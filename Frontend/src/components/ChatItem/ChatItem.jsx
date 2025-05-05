import React from 'react';
import classes from './ChatItem.module.css'
import MessageInput from "../MessageInput/MessageInput.jsx";

const ChatItem = ({isVisible, setIsRecordActive, isRecordActive}) => {
    return (
        <div className={isVisible ? `${classes.showChatList} ${classes.chatItem}` : `${classes.hideChatList} ${classes.chatItem}`}>
            <p>ChatItem</p>
            <MessageInput isActive={isRecordActive} setIsActive={setIsRecordActive}/>
        </div>
    );
};

export default ChatItem;