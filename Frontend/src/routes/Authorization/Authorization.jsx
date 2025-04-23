import React, {useState} from 'react';
import classes from "./Authorization.module.css";
import {Link} from "react-router-dom";
import {validateAuthorization} from "../../utils/validators/authorizationValidator.js";

const Authorization = () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isVisible, setIsVisible] = useState(false)
    const [errors, setErrors] = useState({})


    const handleClick = (e) => {
        e.preventDefault()
        const validationErrors = validateAuthorization(email, password)

        if (validationErrors) {
            setErrors(validationErrors)
            console.log(errors)
        } else {
            setErrors({})
        }
    }

    const handleChange = (e, val, setVal) => {
        setVal(e.target.value)
        setErrors(prev => ({...prev, [val]: null}))
    }

    return (
        <form className={classes.authorizationForm}>
            <h1>Welcome back!</h1>
            <div className={classes.formField}>
                <div className={classes.inputContainer}>
                    <input
                        className={errors.email ? `${classes.inputError} ${classes.registrationInput}` : classes.registrationInput}
                        type="text"
                        id='email'
                        placeholder=''
                        value={email}
                        onChange={(e) => handleChange(e, 'email', setEmail)}
                    />
                    <label
                        htmlFor='email'
                        className={errors.email ? classes.labelError : ''}>Email</label>
                </div>
                {errors.email && <p>{errors.email[0]}</p>}
            </div>

            <div className={classes.formField}>
                <div className={classes.inputContainer}>
                    <input className={errors.password ? `${classes.inputError} ${classes.registrationInput}` : classes.registrationInput}
                           type={isVisible ? 'text' : 'password'}
                           id='password'
                           value={password}
                           placeholder=''
                           onChange={(e) => handleChange(e, 'password', setPassword)}
                    />
                    <label className={errors.password ? `${classes.inputError} ${classes.registrationInput}` : classes.registrationInput}
                           htmlFor='password'>Password</label>
                    <img
                        src={!isVisible ? "/images/eye_open.svg" : "/images/eye_closed.svg"}
                        alt={!isVisible ? "open" : "closed"}
                        onClick={() => setIsVisible(!isVisible)}
                    />
                </div>
                {errors.password && <p>{errors.password[0]}</p>}
            </div>

            <button
                className={classes.authorizationBtn}
                type='submit'
                onClick={(e) => handleClick(e)}>
                Log in
            </button>

            <p>Dont have an account? <Link to='/registration'>Sign up</Link></p>

            <button className={classes.withGoogleBtn}>
                <img src="/images/google_icon.svg" alt="google"/>
                <p>Continue with Google</p>
            </button>
        </form>
    );
};

export default Authorization;