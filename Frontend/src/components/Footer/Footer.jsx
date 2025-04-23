import React from 'react';
import classes from './Footer.module.css'

const Footer = ({isVisible}) => {
    return (
        <footer className={isVisible ? classes.showChatList : classes.hideChatList}>
            <p>2025</p>
        </footer>
    );
};

export default Footer;