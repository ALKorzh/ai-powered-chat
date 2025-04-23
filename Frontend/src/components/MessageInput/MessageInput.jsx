import React, { useState, useRef, useEffect } from 'react';
import classes from './MessageInput.module.css';
import VoiceVisualizer from '../VoiceVisualizer/VoiceVisualizer.jsx';

const MessageInput = ({ isActive, setIsActive }) => {
    const [textMessage, setTextMessage] = useState('');
    const textareaRef = useRef(null);
    const [recordTime, setRecordTime] = useState(0);
    const timerRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

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
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });

                    const formData = new FormData();
                    formData.append('audio', audioFile);

                    fetch('/upload', {
                        method: 'POST',
                        body: formData
                    }).then(response => console.log('Uploaded!', response))
                        .catch(error => console.error('Upload failed:', error));
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
    }, [isActive]);

    const formatTime = (time) => {
        const ms = String(time % 1000).padStart(3, '0').slice(0, 2);
        const sec = String(Math.floor((time / 1000) % 60)).padStart(2, '0');
        const min = String(Math.floor((time / 60000) % 60)).padStart(2, '0');
        return `${min}:${sec}:${ms}`;
    };

    const handleButtonClick = () => {
        if (textMessage) return;
        setIsActive(prev => !prev);
    };

    return (
        <form className={classes.messageForm}>
            {!isActive ? (
                <div className={classes.activeRecordForm}>
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
                <div className={classes.inactiveRecordForm}>
                    <span>{formatTime(recordTime)}</span>
                    <div>
                        <VoiceVisualizer isActive={isActive} />
                    </div>
                    <button className={classes.sendMessageBtn}>
                        <img src="/images/send_message.svg" alt="send" />
                    </button>
                    <button className={classes.sendMessageBtn} type="button" onClick={() => setIsActive(false)}>
                        <img src="/images/stop_message.svg" alt="stop" />
                    </button>
                </div>
            )}
        </form>
    );
};

export default MessageInput;
