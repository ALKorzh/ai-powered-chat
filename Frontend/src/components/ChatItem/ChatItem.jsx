import React from 'react';
import classes from './ChatItem.module.css'
import MessageInput from "../MessageInput/MessageInput.jsx";
import MessageList from "../MessageList/MessageList.jsx";

const ChatItem = ({isVisible, setIsRecordActive, isRecordActive, chatId, userId}) => {
    return (
        <div className={isVisible ? `${classes.showChatList} ${classes.chatItem}` : `${classes.hideChatList} ${classes.chatItem}`}>
            <MessageList/>
            <MessageInput isActive={isRecordActive} setIsActive={setIsRecordActive} chatId={chatId} userId={userId}/>
        </div>
    );
};

export default ChatItem;