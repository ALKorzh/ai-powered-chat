import React, {useEffect, useState} from 'react';
import Header from "../../components/Header/Header.jsx";
import ChatList from "../../components/ChatList/ChatList.jsx";
import ChatItem from "../../components/ChatItem/ChatItem.jsx";
import classes from './Home.module.css'
import {useNavigate} from "react-router-dom";

const Home = () => {
    const [isChatListVisible, setIsChatListVisible] = useState(false)
    const [isRecordActive, setIsRecordActive] = useState(false)
    const [isOpenUserInfo, setIsOpenUserInfo] = useState(false)

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/authorization');
        }
    }, [navigate]);

    return (
        <div className={isChatListVisible ? classes.showAside : classes.hideAside}>
            <Header isChatListVisible={isChatListVisible} setIsChatListVisible={setIsChatListVisible} setIsOpenUserInfo={setIsOpenUserInfo} isOpenUserInfo={isOpenUserInfo} />
            <ChatList isVisible={isChatListVisible}/>
            <ChatItem isVisible={isChatListVisible} isRecordActive={isRecordActive} setIsRecordActive={setIsRecordActive}/>
        </div>
    );
};

export default Home;