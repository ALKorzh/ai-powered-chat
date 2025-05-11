import React, {useEffect, useState} from 'react';
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import ChatList from "../../components/ChatList/ChatList.jsx";
import ChatItem from "../../components/ChatItem/ChatItem.jsx";
import classes from './Home.module.css'
import axios from "axios";

const Home = () => {

    const [userId, setUserId] = useState(null)
    const [chatId, setChatId] = useState(null)
    const [isChatListVisible, setIsChatListVisible] = useState(true)
    const [isRecordActive, setIsRecordActive] = useState(false )
    const [isOpenUserInfo, setIsOpenUserInfo] = useState(false)

    useEffect(() => {
        const fetchIds = async () => {
            try {
                const response = await axios.get('http://localhost:8000/get-ids');
                setUserId(response.data.userId);
                setChatId(response.data.chatId);
            } catch (error) {
                console.error('Failed to fetch IDs:', error);
            }
        };

        fetchIds();
    }, []);


    return (
        <div className={isChatListVisible ? classes.showAside : classes.hideAside}>
            <Header isChatListVisible={isChatListVisible} setIsChatListVisible={setIsChatListVisible} setIsOpenUserInfo={setIsOpenUserInfo} isOpenUserInfo={isOpenUserInfo} userId={userId}/>
            <ChatList isVisible={isChatListVisible}/>
            <ChatItem isVisible={isChatListVisible} isRecordActive={isRecordActive} setIsRecordActive={setIsRecordActive} userId={userId} chatId={chatId}/>
            <Footer isVisible={isChatListVisible}/>
        </div>
    );
};

export default Home;