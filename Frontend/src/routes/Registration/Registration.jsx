import React, {useState} from 'react';
import classes from './Registration.module.css'
import {Link, useNavigate} from "react-router-dom";
import {validateRegistration} from "../../utils/validators/registrationValidator.js";
import axios from 'axios';

const Registration = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [errors, setErrors] = useState({})
    const navigate = useNavigate();

    const handleClick = async (e) => {
        e.preventDefault()
        const validationErrors = validateRegistration(username, email, password, confirmPassword)

        if (validationErrors) {
            setErrors(validationErrors)
        } else {
            setErrors({})
            try {
                const response = await axios.post('http://localhost:8000/auth/register/', {
                    email: email,
                    password: password
                });
                
                if (response.status === 200) {
                    navigate('/authorization');
                }
            } catch (error) {
                console.error('Registration error:', error);
                if (error.response?.status === 400) {
                    setErrors({ auth: ['Registration failed. Please check your data.'] });
                } else {
                    setErrors({ auth: ['Server error. Please try again later.'] });
                }
            }
        }
    }

    const handleChange = (e, val, setVal) => {
        setVal(e.target.value)
        setErrors(prev => ({...prev, [val]: null, auth: null}))
    }

    return (
        <form className={classes.registrationForm}>
            <h1>Create an account</h1>
            {errors.auth && <p className={classes.authError}>{errors.auth[0]}</p>}
            <div className={classes.formField}>
                <div className={classes.inputContainer}>
                    <input className={errors.username ? `${classes.inputError} ${classes.registrationInput}` : classes.registrationInput}
                        type="text"
                           id='username'
                           placeholder=''
                           value={username}
                           onChange={(e) => handleChange(e, 'username', setUsername)}
                    />
                    <label  className={errors.username ? classes.labelError : ''}
                        htmlFor='username'>Username</label>
                </div>
                {errors.username && <p>{errors.username[0]}</p>}
            </div>

            <div className={classes.formField}>
                <div className={classes.inputContainer}>
                    <input  className={errors.email ? `${classes.inputError} ${classes.registrationInput}` : classes.registrationInput}
                        type="text"
                           id='email'
                           placeholder=''
                           value={email}
                           onChange={(e) => handleChange(e, 'email', setEmail)}
                    />
                    <label className={errors.email ? classes.labelError : ''}
                        htmlFor='email'>Email</label>
                </div>
                {errors.email && <p>{errors.email[0]}</p>}

            </div>

            <div className={classes.formField}>
                <div className={classes.inputContainer}>
                    <input  className={errors.password ? `${classes.inputError} ${classes.registrationInput}` : classes.registrationInput}
                        type="password"
                           id='password'
                           placeholder=''
                           value={password}
                           onChange={(e) => handleChange(e, 'password', setPassword)}
                    />
                    <label className={errors.password ? classes.labelError : ''}
                        htmlFor='password'>Password</label>
                </div>
                {errors.password && <p>{errors.password[0]}</p>}

            </div>

            <div className={classes.formField}>
                <div className={classes.inputContainer}>
                    <input  className={errors.confirmPassword ? `${classes.inputError} ${classes.registrationInput}` : classes.registrationInput}
                        type="password"
                           id='confirmPassword'
                           placeholder=''
                           value={confirmPassword}
                           onChange={(e) => handleChange(e, 'confirmPassword', setConfirmPassword)}
                    />
                    <label className={errors.confirmPassword ? classes.labelError : ''}
                        htmlFor='confirmPassword'>Confirm password</label>
                </div>
                {errors.confirmPassword && <p>{errors.confirmPassword[0]}</p>}
            </div>

            <button
                className={classes.registrationBtn}
                type="submit"
                onClick={(e) => handleClick(e)}>
                Continue
            </button>
            <p>Already have an account? <Link to='/authorization'>Login</Link></p>
        </form>
    );
};

export default Registration;