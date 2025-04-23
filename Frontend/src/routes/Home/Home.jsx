import React, {useState} from 'react';
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import ChatList from "../../components/ChatList/ChatList.jsx";
import ChatItem from "../../components/ChatItem/ChatItem.jsx";
import classes from './Home.module.css'
import {set} from "zod";

const Home = () => {

    const [isChatListVisible, setIsChatListVisible] = useState(true)
    const [isRecordActive, setIsRecordActive] = useState(false )

    return (
        <div className={isChatListVisible ? classes.showAside : classes.hideAside}>
            <Header isVisible={isChatListVisible} setIsVisible={setIsChatListVisible}/>
            <ChatList isVisible={isChatListVisible}/>
            <ChatItem isVisible={isChatListVisible} isRecordActive={isRecordActive} setIsRecordActive={setIsRecordActive}/>
            <Footer isVisible={isChatListVisible}/>
        </div>
    );
};

export default Home;