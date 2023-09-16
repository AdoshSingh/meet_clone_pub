import React, { useEffect, useState } from 'react';
import images from '../assets/exo';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passMatch, setPassMatch] = useState(true);
    const [regDone, setRegDone] = useState(false);
    const [regProblem, setRegProblem] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        setPassMatch(password === confirmPassword);
    }, [password, confirmPassword]);

    const handleSignupSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
        };

        try {
            const response = await axios.post('/api/register', userData);

            if (response.status === 201) {
                console.log("Registration successful");
                setRegDone(true);
                navigate('/');
            }
        } catch (err) {
            setRegProblem(true);
            console.log('Registration failed: ', err.message);
        }
    };

    const handleLoginClick = () => {
        navigate('/');
    }

    return (
        <div className='h-full bg-bgc flex items-center justify-around'>
            <img className='hidden md:inline h-250 lg:h-300 xl:h-400 drop-shadow-xl' src={images.backImg} alt="" />
            <div className='bg-card flex flex-col max-w-fit items-center p-10 gap-10 drop-shadow-xl'>
                <div> 
                    <h1 className='text-3xl lg:text-4xl text-center'>Register Now!</h1>
                    <p className='text-md lg:text-lg text-center'>Create an account. Fill in the details.</p>
                </div>
                <img className='w-20 lg:w-24' src={images.signup} alt="" />
                <form className='flex flex-col gap-4 w-64 md:56 lg:w-80' onSubmit={handleSignupSubmit}>
                    <input className='p-2 border-2 border-violet-700 focus:outline-none' type="text" name="name" required placeholder='Name' />
                    <input className='p-2 border-2 border-violet-700 focus:outline-none' type="email" name="email" required placeholder='Email' />
                    <input
                        className='p-2 border-2 border-violet-700 focus:outline-none'
                        type="password"
                        name="password"
                        placeholder='Password'
                        required
                        onChange={(e) => { setPassword(e.target.value) }}
                    />
                    <input
                        className='p-2 border-2 border-violet-700 focus:outline-none'
                        type="password"
                        name="password"
                        placeholder='Confirm Password'
                        required
                        onChange={(e) => { setConfirmPassword(e.target.value) }}
                    />
                    {!passMatch && (
                        <p className="text-red-600 text-sm text-center">Passwords do not match</p>
                    )}
                    <button type='submit' className='bg-violet-700 hover:bg-violet-500 text-white p-2'>REGISTER NOW</button>
                    {regDone && <p className='text-center text-sm text-green-600'>Registered Successfully. Now you can login.</p>}
                    {regProblem && <p className='text-center text-sm text-red-600'>Registration failed. User already exists or internal server error.</p>}
                    <p className='text-center text-sm'>
                        Already have an account? &nbsp;
                        <span onClick={handleLoginClick} className='underline text-blue-600 hover:text-blue-800 cursor-pointer'>
                            Login
                        </span>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Signup
