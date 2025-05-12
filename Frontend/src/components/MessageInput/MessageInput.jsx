import React, { useState, useRef, useEffect } from 'react';
import classes from './MessageInput.module.css';
import VoiceVisualizer from '../VoiceVisualizer/VoiceVisualizer.jsx';
import axios from "axios";
import RecordRTC from 'recordrtc';
import { useNavigate } from 'react-router-dom';

const MessageInput = ({ isActive, setIsActive}) => {
    const navigate = useNavigate();
    const [textMessage, setTextMessage] = useState('');
    const textareaRef = useRef(null);
    const [recordTime, setRecordTime] = useState(0);
    const timerRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const getAuthToken = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        return token;
    };

    const handleAuthError = () => {
        localStorage.removeItem('token');
        navigate('/authorization');
    };

    const handleSendTextMessage = async () => {
        if (!textMessage.trim()) return;

        try {
            const token = getAuthToken();
            const response = await axios.post(`http://localhost:8000/api/chat`, {
                message: textMessage,
                message_type: "TEXT"
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Text message sent!', response.data);
            setTextMessage('');
        } catch (error) {
            console.error('Text message failed:', error);
            if (error.response?.status === 401) {
                handleAuthError();
            }
        }
    };

    const stopRecording = async () => {
        if (mediaRecorderRef.current?.recorder) {
            const { recorder } = mediaRecorderRef.current;

            return new Promise(resolve => {
                recorder.stopRecording(async () => {
                    try {
                        console.log('Stopping recording...');
                        const blob = recorder.getBlob();
                        console.log('Blob created:', blob.size, 'bytes');

                        const MAX_FILE_SIZE = 10 * 1024 * 1024;
                        if (blob.size > MAX_FILE_SIZE) {
                            throw new Error('Audio file is too large. Maximum size is 10MB');
                        }
                        
                        const audioFile = new File([blob], 'recording.wav', { type: 'audio/wav' });
                        console.log('Audio file created:', audioFile.size, 'bytes');

                        const formData = new FormData();
                        formData.append('audio_file', audioFile);
                        console.log('FormData created with audio file');

                        const token = getAuthToken();
                        console.log('Token retrieved:', token ? 'Yes' : 'No');

                        console.log('Sending voice message to server...');
                        const response = await axios.post('http://localhost:8000/api/chat/voice', formData, {
                            headers: { 
                                'Content-Type': 'multipart/form-data',
                                'Authorization': `Bearer ${token}`
                            },
                            timeout: 30000,
                            onUploadProgress: (progressEvent) => {
                                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                console.log('Upload progress:', percentCompleted, '%');
                            }
                        });
                        console.log('WAV voice message sent successfully!', response.data);
                    } catch (error) {
                        console.error('Voice message failed:', {
                            message: error.message,
                            response: error.response?.data,
                            status: error.response?.status,
                            headers: error.response?.headers
                        });
                        if (error.response?.status === 401) {
                            handleAuthError();
                        }
                        throw error;
                    } finally {
                        if (mediaRecorderRef.current) {
                            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
                            mediaRecorderRef.current = null;
                        }
                        resolve();
                    }
                });
            });
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
        let recorder;
        let stream;

        const startRecording = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                recorder = new RecordRTC(stream, {
                    type: 'audio',
                    mimeType: 'audio/wav',
                    recorderType: RecordRTC.StereoAudioRecorder,
                    desiredSampRate: 16000,
                    numberOfAudioChannels: 1,
                    timeSlice: 1000,
                    ondataavailable: (blob) => {
                        audioChunksRef.current.push(blob);
                    }
                });

                mediaRecorderRef.current = { recorder, stream };
                recorder.startRecording();
            } catch (err) {
                console.error('Microphone access denied:', err);
                setIsActive(false);
            }
        };

        if (isActive) {
            startRecording();
        }

        return () => {
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
                if (mediaRecorderRef.current.recorder.state === 'recording') {
                    mediaRecorderRef.current.recorder.stopRecording();
                }
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

    const handleButtonClick = async (e) => {
        e.preventDefault();

        if (textMessage.trim()) {
            await handleSendTextMessage();
        } else {
            if (!isActive) {
                setIsActive(true);
            } else {
                await handleStopRecording();
            }
        }
    };

    const handleStopRecording = async () => {
        if (mediaRecorderRef.current) {
            try {
                setIsActive(false);
                await stopRecording();
            } catch (error) {
                console.error('Error stopping recording:', error);
            }
        }
    };

    const handleCancelRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.recorder.stopRecording(() => {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
                mediaRecorderRef.current = null;
                setIsActive(false);
            });
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
                    <button onClick={handleStopRecording}
                            type='button'
                            className={classes.sendMessageBtn}>
                        <img src="/images/send_message.svg" alt="send" />
                    </button>
                    <button className={classes.sendMessageBtn}
                            type="button"
                            onClick={handleCancelRecording}>
                        <img src="/images/stop_message.svg" alt="stop" />
                    </button>
                </div>
            )}
        </form>
    );
};

export default MessageInput;
