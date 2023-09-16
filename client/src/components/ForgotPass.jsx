import React, { useState } from 'react';
import images from '../assets/exo';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPass = () => {

    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const navigate = useNavigate();

    const handleForgotSubmit = async (e) => {
        e.preventDefault();

        const userData = {
            email,
        }

        try {
            const response = await axios.post('/api/forgot-password', userData);

            if (response.status === 200) {
                setEmailSent(true);
            }
        } catch (err) {
            console.log('Password reset request failed: ', err.message);
        }
    }

    const handleLoginClick = () => {
        navigate('/');
    }

    return (
        <div className='h-full bg-bgc flex items-center justify-center'>
            <div className='bg-card flex flex-col max-w-fit items-center p-10 gap-10 drop-shadow-xl'>
                <div>
                    <h1 className='text-3xl lg:text-4xl text-center'>Forgot Password?</h1>
                    <p className='text-md lg:text-lg text-center'>Enter your email address.</p>
                </div>
                <img className='w-20 lg:w-24' src={images.forgotPass} alt="" />
                <form className='flex flex-col gap-4 w-64 lg:w-80' onSubmit={handleForgotSubmit}>
                    <input 
                        className='p-2 border-2 border-violet-700 focus:outline-none' 
                        type="email" 
                        name="email" 
                        placeholder='Email'
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {emailSent ? (
                        <p className='text-green-500 text-center'>
                            An email has been sent with instructions on how to reset your password.
                        </p>
                    ) : (
                        <button type='submit' className='bg-violet-700 hover:bg-violet-500 text-white p-2'>SEND EMAIL</button>
                    )}
                    <p className='text-center text-sm'>
                        Remember your password? &nbsp;
                        <span onClick={handleLoginClick} className='underline text-blue-600 hover:text-blue-800 cursor-pointer'>
                            Login
                        </span>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default ForgotPass