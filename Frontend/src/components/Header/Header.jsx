import React from 'react';
import classes from './Header.module.css'
import UserInfoModal from "../UserInfoModal/UserInfoModal.jsx";


const Header = ({isChatListVisible, setIsChatListVisible, isOpenUserInfo, setIsOpenUserInfo, userId}) => {
    return (
        <header className={isChatListVisible ? classes.showChatList : ''}>
            <div className={classes.controlPanel}>
                <button
                    className={isChatListVisible ? `${classes.hideChatListBtn} ${classes.headerBtn}` : classes.headerBtn}
                    onClick={() => setIsChatListVisible(!isChatListVisible)}>
                    <img
                        src={isChatListVisible ? '/images/hide_chats.svg' : '/images/show_chats.svg'}
                        alt={isChatListVisible ? 'close' : 'show'}/>
                </button>

                <h1>EnglishTutor</h1>
            </div>

            <button className={classes.headerBtn} onClick={() => setIsOpenUserInfo(!isOpenUserInfo)}>
                <img src="/images/user_icon.svg" alt="user"/>
            </button>

            <UserInfoModal setIsActive={setIsOpenUserInfo} isActive={isOpenUserInfo} userId={userId}/>
        </header>
    );
};

export default Header;