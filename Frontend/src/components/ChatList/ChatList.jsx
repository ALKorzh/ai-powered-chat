import React from 'react';
import classes from './ChatList.module.css'

const ChatList = ({isVisible}) => {
    return (
        <aside className={isVisible ? classes.showChatList : classes.hideChatList}>
            <p>ChatList</p>
        </aside>
    );
};

export default ChatList;