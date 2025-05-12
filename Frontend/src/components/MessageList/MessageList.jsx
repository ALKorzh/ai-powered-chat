import React, { useEffect, useState, useRef } from 'react';
import classes from './MessageList.module.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MessageList = () => {
    const [messages, setMessages] = useState([]);
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const prevMessagesLengthRef = useRef(0);

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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get('http://localhost:8000/api/chat/history', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Reverse the messages array to show newest at the bottom
            setMessages(response.data.reverse());
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            if (error.response?.status === 401) {
                handleAuthError();
            }
        }
    };

    useEffect(() => {
        fetchMessages();
        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, []);

    // Scroll to bottom only when new messages are added
    useEffect(() => {
        if (messages.length > prevMessagesLengthRef.current) {
            scrollToBottom();
        }
        prevMessagesLengthRef.current = messages.length;
    }, [messages]);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const markdownComponents = {
        p: ({ children }) => <p className={classes.markdownP}>{children}</p>,
        h1: ({ children }) => <h1 className={classes.markdownH1}>{children}</h1>,
        h2: ({ children }) => <h2 className={classes.markdownH2}>{children}</h2>,
        h3: ({ children }) => <h3 className={classes.markdownH3}>{children}</h3>,
        h4: ({ children }) => <h4 className={classes.markdownH4}>{children}</h4>,
        h5: ({ children }) => <h5 className={classes.markdownH5}>{children}</h5>,
        h6: ({ children }) => <h6 className={classes.markdownH6}>{children}</h6>,
        code: ({ children }) => <code className={classes.markdownCode}>{children}</code>,
        pre: ({ children }) => <pre className={classes.markdownPre}>{children}</pre>,
        blockquote: ({ children }) => <blockquote className={classes.markdownBlockquote}>{children}</blockquote>,
        ul: ({ children }) => <ul className={classes.markdownUl}>{children}</ul>,
        ol: ({ children }) => <ol className={classes.markdownOl}>{children}</ol>,
        li: ({ children }) => <li className={classes.markdownLi}>{children}</li>,
        a: ({ href, children }) => <a href={href} className={classes.markdownA}>{children}</a>,
        table: ({ children }) => <table className={classes.markdownTable}>{children}</table>,
        th: ({ children }) => <th className={classes.markdownTh}>{children}</th>,
        td: ({ children }) => <td className={classes.markdownTd}>{children}</td>,
    };

    return (
        <div className={classes.messageList}>
            {messages.map((message) => (
                <div key={message.id} className={classes.messageContainer}>
                    <div className={classes.messageWrapper}>
                        <div className={classes.userMessage}>
                            <div className={classes.messageContent}>
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={markdownComponents}
                                >
                                    {message.message}
                                </ReactMarkdown>
                                <span className={classes.timestamp}>{formatTime(message.timestamp)}</span>
                            </div>
                        </div>
                        <div className={classes.botMessage}>
                            <div className={classes.messageContent}>
                                {message.is_corrected && message.corrections && (
                                    <div className={classes.corrections}>
                                        {message.corrections.map((correction, index) => (
                                            <div key={index} className={classes.correction}>
                                                <p className={classes.original}>"{correction.original}"</p>
                                                <p className={classes.corrected}>"{correction.corrected}"</p>
                                                <p className={classes.explanation}>({correction.explanation})</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={markdownComponents}
                                >
                                    {message.response}
                                </ReactMarkdown>
                                <span className={classes.timestamp}>{formatTime(message.timestamp)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;