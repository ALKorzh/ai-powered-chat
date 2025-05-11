import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import classes from './UserInfoModal.module.css';

const UserInfoModal = ({ isActive, setIsActive}) => {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState('');  // теперь email будет динамичным 👇

    const handleLogout = async () => {
        try {
            await axios.post(`http://localhost:8000/api/logout`);
            localStorage.removeItem('token');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setUserEmail(response.data.email);
            } catch (error) {
                console.error('Failed to fetch user info:', error);
            }
        };

        if (isActive) {
            fetchUserInfo();
        }
    }, [isActive]);

    return (
        <div className={isActive ? `${classes.active} ${classes.modal}` : classes.modal} onClick={() => setIsActive(false)}>
            <div className={classes.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={classes.userEmail}>
                    <p>email: {userEmail}</p>
                </div>
                <div>
                    <button className={classes.logoutBtn} onClick={handleLogout}>
                        <p>log out</p>
                        <img src="/images/logout.svg" alt="logout"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserInfoModal;
