import React, { useState, useEffect } from 'react';
import classes from './Header.module.css'
import UserInfoModal from "../UserInfoModal/UserInfoModal.jsx";

const Header = ({isChatListVisible, isOpenUserInfo, setIsOpenUserInfo}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY < lastScrollY) {
                // Scrolling up
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down and not at the top
                setIsVisible(false);
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <header className={`${isChatListVisible ? classes.showChatList : ''} ${isVisible ? classes.visible : classes.hidden}`}>
            <div className={classes.controlPanel}>
                {/*<button*/}
                {/*    // className={isChatListVisible ? `${classes.hideChatListBtn} ${classes.headerBtn}` : classes.headerBtn}*/}
                {/*    onClick={() => setIsChatListVisible(!isChatListVisible)}>*/}
                {/*    <img*/}
                {/*        src={isChatListVisible ? '/images/hide_chats.svg' : '/images/show_chats.svg'}*/}
                {/*        alt={isChatListVisible ? 'close' : 'show'}/>*/}
                {/*</button>*/}

                <h1>EnglishTutor</h1>
            </div>

            <button className={classes.headerBtn} onClick={() => setIsOpenUserInfo(!isOpenUserInfo)}>
                <img src="/images/user_icon.svg" alt="user"/>
            </button>

            <UserInfoModal setIsActive={setIsOpenUserInfo} isActive={isOpenUserInfo}/>
        </header>
    );
};

export default Header;