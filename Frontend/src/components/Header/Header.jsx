import React from 'react';
import classes from './Header.module.css'


const Header = ({isVisible, setIsVisible}) => {
    return (
        <header className={isVisible ? classes.showChatList : ''}>
            <div className={classes.controlPanel}>
                <button
                    className={isVisible ? `${classes.hideChatListBtn} ${classes.headerBtn}` : classes.headerBtn}
                    onClick={() => setIsVisible(!isVisible)}>
                    <img
                        src={isVisible ? '/images/hide_chats.svg' : '/images/show_chats.svg'}
                        alt={isVisible ? 'close' : 'show'}/>
                </button>

                <h1>EnglishTutor</h1>
            </div>

            <button className={classes.headerBtn}>
                <img src="/images/user_icon.svg" alt="user"/>
            </button>
        </header>
    );
};

export default Header;