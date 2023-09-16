import React, { useEffect, useState } from 'react';
import images from '../assets/exo';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ResetPass = () => {

    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passMatch, setPassMatch] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        setPassMatch(password === confirmPassword);
    }, [password, confirmPassword]);

    const handleResetSubmit = async (e) => {
        e.preventDefault();

        if (!passMatch) return;

        try {
            const response = await axios.post(`/api/reset-password/${token}`, {
                newPassword: password,
            })

            if (response.status === 200) {
                navigate('/');
            }
        } catch (err) {
            console.log('Password reset failed: ', err.message);
        }
    }

    const handleLoginClick = () => {
        navigate('/');
    }

    return (
        <div className='h-full bg-bgc flex items-center justify-center'>
            <div className='bg-card flex flex-col max-w-fit items-center p-10 gap-10 drop-shadow-xl'>
                <div>
                    <h1 className='text-3xl lg:text-4xl text-center'>Reset Password</h1>
                    <p className='text-md lg:text-lg text-center'>Enter new credentials.</p>
                </div>
                <img className='w-20 lg:w-24' src={images.forgotPass} alt="" />
                <form className='flex flex-col gap-4 w-64 lg:w-80' onSubmit={handleResetSubmit}>
                    <input
                        className='p-2 border-2 border-violet-700 focus:outline-none'
                        type="password"
                        name="password"
                        placeholder='Password'
                        onChange={(e) => { setPassword(e.target.value) }}
                    />
                    <input
                        className='p-2 border-2 border-violet-700 focus:outline-none'
                        type="password"
                        name="password"
                        placeholder='Confirm Password'
                        onChange={(e) => { setConfirmPassword(e.target.value) }}
                    />
                    {!passMatch && (
                        <p className="text-red-600 text-sm text-center">Passwords do not match</p>
                    )}
                    <button type='submit' className='bg-violet-700 hover:bg-violet-500 text-white p-2'>SUBMIT</button>
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

export default ResetPass
