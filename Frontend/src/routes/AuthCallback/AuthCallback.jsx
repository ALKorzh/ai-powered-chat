import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleAuth = async () => {
            try {
                const token = searchParams.get('token');
                const error = searchParams.get('error');

                if (error) {
                    console.error('Authentication error:', error);
                    setError(error);
                    setTimeout(() => {
                        navigate('/authorization', { replace: true });
                    }, 3000);
                    return;
                }

                if (token) {
                    try {
                        // Сохраняем токен в localStorage
                        localStorage.setItem('token', token);
                        
                        // Используем replace: true для предотвращения возврата на страницу callback
                        navigate('/', { replace: true });
                    } catch (storageError) {
                        console.error('Error saving token:', storageError);
                        setError('Failed to save authentication token');
                        setTimeout(() => {
                            navigate('/authorization', { replace: true });
                        }, 3000);
                    }
                } else {
                    setError('No authentication token received');
                    setTimeout(() => {
                        navigate('/authorization', { replace: true });
                    }, 3000);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
                setError('An unexpected error occurred');
                setTimeout(() => {
                    navigate('/authorization', { replace: true });
                }, 3000);
            }
        };

        handleAuth();
    }, [searchParams, navigate]);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            flexDirection: 'column',
            gap: '1rem',
            textAlign: 'center',
            padding: '2rem'
        }}>
            {error ? (
                <>
                    <h2 style={{ color: '#dc3545' }}>Ошибка авторизации</h2>
                    <p>{error}</p>
                    <p>Перенаправление на страницу авторизации...</p>
                </>
            ) : (
                <>
                    <h2>Успешная авторизация!</h2>
                    <p>Перенаправление на главную страницу...</p>
                </>
            )}
        </div>
    );
};

export default AuthCallback; 