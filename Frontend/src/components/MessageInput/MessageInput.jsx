import React, { useState, useRef, useEffect } from 'react';
import classes from './MessageInput.module.css';
import VoiceVisualizer from '../VoiceVisualizer/VoiceVisualizer.jsx';
import axios from "axios";

const MessageInput = ({ isActive, setIsActive, chatId, userId }) => {
    const [textMessage, setTextMessage] = useState('');
    const textareaRef = useRef(null);
    const [recordTime, setRecordTime] = useState(0);
    const timerRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const handleSendTextMessage = async () => {
        if (!textMessage.trim() || !userId || !chatId) return;

        try {
            const response = await axios.post(`http://localhost:8000/${userId}/${chatId}`, {
                message: textMessage,
                userId,
                chatId,
            });
            console.log('Text message sent!', response.data);
            setTextMessage('');
        } catch (error) {
            console.error('Text message failed:', error);
        }
    };

    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                setRecordTime(prev => prev + 10);
            }, 10);
        } else {
            clearInterval(timerRef.current);
            setRecordTime(0);
        }

        return () => clearInterval(timerRef.current);
    }, [isActive]);

    useEffect(() => {
        if (!textareaRef.current) return;

        textareaRef.current.style.height = 'auto';
        const scrollHeight = textareaRef.current.scrollHeight;
        const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight);
        const maxHeight = lineHeight * 10;

        if (scrollHeight > maxHeight) {
            textareaRef.current.style.height = `${maxHeight}px`;
            textareaRef.current.style.overflowY = 'auto';
        } else {
            textareaRef.current.style.height = `${scrollHeight}px`;
            textareaRef.current.style.overflowY = 'hidden';
        }
    }, [textMessage]);

    useEffect(() => {
        const startRecording = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/ogg; codecs=opus' });
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/ogg; codecs=opus' });
                    const audioFile = new File([audioBlob], 'recording.ogg', { type: 'audio/ogg' });

                    const formData = new FormData();
                    formData.append('audio', audioFile);
                    formData.append('userId', userId);
                    formData.append('chatId', chatId);

                    try {
                        const response = await axios.post('http://localhost:8000/upload', formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        });
                        console.log('Audio uploaded!', response.data);
                    } catch (error) {
                        console.error('Audio upload failed:', error);
                    }
                };

                mediaRecorder.start();
            } catch (err) {
                console.error('Microphone access denied:', err);
            }
        };

        if (isActive) {
            startRecording();
        } else if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }

        return () => {
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
                mediaRecorderRef.current = null;
            }
        };
    }, [isActive, userId, chatId]);

    const formatTime = (time) => {
        const ms = String(time % 1000).padStart(3, '0').slice(0, 2);
        const sec = String(Math.floor((time / 1000) % 60)).padStart(2, '0');
        const min = String(Math.floor((time / 60000) % 60)).padStart(2, '0');
        return `${min}:${sec}:${ms}`;
    };

    const handleButtonClick = async (e) => {
        e.preventDefault();

        if (textMessage.trim()) {
            await handleSendTextMessage();
        } else {
            setIsActive(prev => !prev);
        }
    };

    return (
        <form className={classes.messageForm}>
            {!isActive ? (
                <div className={classes.inactiveRecordForm}>
                    <textarea
                        ref={textareaRef}
                        className={classes.messageInput}
                        rows={1}
                        value={textMessage}
                        placeholder="Send message..."
                        onChange={(e) => setTextMessage(e.target.value)}
                    />
                    <button className={classes.sendMessageBtn}
                            type="button"
                            onClick={handleButtonClick}>
                        {textMessage === '' ? (
                            <img src="/images/voice-message.svg" alt="voice" />
                        ) : (
                            <img src="/images/send_message.svg" alt="send" />
                        )}
                    </button>
                </div>
            ) : (
                <div className={classes.activeRecordForm}>
                    <span>{formatTime(recordTime)}</span>
                    <div>
                        <VoiceVisualizer isActive={isActive} />
                    </div>
                    <button onClick={handleButtonClick}
                            type='button'
                            className={classes.sendMessageBtn}>
                        <img src="/images/send_message.svg" alt="send" />
                    </button>
                    <button className={classes.sendMessageBtn}
                            type="button"
                            onClick={() => setIsActive(false)}>
                        <img src="/images/stop_message.svg" alt="stop" />
                    </button>
                </div>
            )}
        </form>
    );
};

export default MessageInput;
