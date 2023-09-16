import React, { useState } from 'react';
import images from '../assets/exo';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passCorrect, setPassCorrect] = useState(false);
    const navigate = useNavigate();

    const handleSignupClick = () => {
        navigate('/signup-page');
    }

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        const userData = {
            email,
            password,
        }

        try {
            const response = await axios.post('/api/login', userData);

            if (response.status === 200) {
                console.log("Login successful");
                localStorage.setItem('user', JSON.stringify(response.data));
                navigate('/main-page');
            }
        } catch (err) {
            console.log('Login failed: ', err.message);
            setPassCorrect(true);
        }
    }

    const handleForgotPass = () => {
        navigate('/forgot-pass');
    }

    return (
        <div className='h-full bg-bgc flex items-center justify-around'>
            <img className='hidden md:inline h-250 lg:h-300 xl:h-400 drop-shadow-xl' src={images.backImg} alt="" />
            <div className='bg-card flex flex-col max-w-fit items-center p-10 gap-10 drop-shadow-xl'>
                <div>
                    <h1 className='text-3xl lg:text-4xl text-center'>Welcome Back!</h1>
                    <p className='text-md lg:text-lg text-center'>Please enter your login details</p>
                </div>
                <img className='w-20 lg:w-24' src={images.login} alt="" />
                <form className='flex flex-col gap-4 w-64 md:w-56 lg:w-80' onSubmit={handleLoginSubmit}>
                    <input
                        className='p-2 border-2 border-violet-700 focus:outline-none'
                        type="email"
                        name="email"
                        placeholder='Email'
                        required
                        onChange={(e) => { setEmail(e.target.value) }}
                    />
                    <input
                        className='p-2 border-2 border-violet-700 focus:outline-none'
                        type="password"
                        name="password"
                        placeholder='Password'
                        required
                        onChange={(e) => { setPassword(e.target.value) }}
                    />
                    {passCorrect && <p className='text-red-500 text-center text-xs'>Wrong Credentials</p>}
                    <div className='flex justify-center'>
                        <button className='text-xs underline text-blue-600 hover:text-blue-800 cursor-pointer' onClick={handleForgotPass}>
                            Forgot Password
                        </button>
                    </div>
                    <button type='submit' className='bg-violet-700 hover:bg-violet-500 text-white p-2'>
                        LOGIN
                    </button>
                    <p className='text-center text-sm'>
                        Don't have an account? &nbsp;
                        <span onClick={handleSignupClick} className='underline text-blue-600 hover:text-blue-800 cursor-pointer'>
                            Signup
                        </span>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Login
