import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketProvider';
import images from '../assets/exo';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';
import copy from 'clipboard-copy';

const Main = () => {
  const [meetingCode, setMeetingCode] = useState('');
  const [token, setToken] = useState('');
  const [remoteMeetingCode, setRemoteMeetingCode] = useState('');
  const [myName, setMyName] = useState('');
  const [copied, setCopied] = useState(false);

  const socket = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem('user');
    if (data) {
      const parsedData = JSON.parse(data);
      setToken(parsedData.token);
      setMyName(parsedData.name);
    }
    else {
      navigate('/');
    }
  }, []);

  const handleSubmitForm = useCallback((e) => {
    e.preventDefault();
    socket.emit('room:join', { room: remoteMeetingCode, name: myName });
  }, [remoteMeetingCode, myName, socket]);

  const handleJoinRoom = useCallback((data) => {
    const { room, name } = data;
    navigate(`/room/${room}`);
  }, [navigate]);

  useEffect(() => {
    socket.on('room:join', handleJoinRoom);
    return () => {
      socket.off('room:join', handleJoinRoom);
    }
  }, [socket, handleJoinRoom])

  const getUserIdFromToken = (token) => {
    const decodedToken = jwt_decode(token);
    return decodedToken.userId;
  }

  const handleMeeting = async () => {
    try {
      if (meetingCode) {
        return;
      }
      const response = await axios.post('/api/creating-meeting', {
        userId: getUserIdFromToken(token),
      });

      if (response.status === 200) {
        setMeetingCode(response.data.code);
      }
    } catch (err) {
      console.log('Error generating meeting: ', err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleCopyClick = () => {
    const textToCopy = meetingCode;
    copy(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch((err) => {
        console.error('Copy failed:', err);
      });
  };


  return (
    <div className='h-full bg-bgc flex flex-col items-center justify-center gap-11'>
      <div className='bg-card flex flex-col max-w-fit items-center p-10 gap-10 drop-shadow-xl'>
        {myName &&
          <h1 className='text-2xl lg:text-3xl text-center'>Welcome, {myName}</h1>
        }
        <img className='w-20 lg:w-24 drop-shadow-xl' src={images.meeting} alt="" />
        <button className='bg-violet-700 hover:bg-violet-500 text-white p-2' onClick={handleMeeting}>
          Generate Meeting
        </button>
        {meetingCode &&
          (
            <div className='flex flex-col justify-between gap-2 bg-gray-400 p-2'>
              <div className='flex flex-row justify-between gap-2 italic'>
                <p>{meetingCode}</p>
                {copied === false
                  ? <ContentCopyIcon className='scale-75 cursor-pointer' onClick={handleCopyClick} />
                  : <DoneIcon className='scale-75' />
                }
              </div>
              <p className='text-xs text-center'>Enter the above code below and <br /> share this code with someone.</p>
            </div>
          )
        }
        <form className='flex flex-col gap-2' onSubmit={handleSubmitForm}>
          <input
            className='p-2 border-2 border-violet-700 focus:outline-none text-center'
            placeholder='Enter meeting code' type="text"
            onChange={
              (e) => setRemoteMeetingCode(e.target.value)
            }
          />
          <button type='submit' className='bg-violet-700 hover:bg-violet-500 text-white p-2'>
            Join Room
          </button>
        </form>
        <button className='bg-violet-700 hover:bg-violet-500 text-white p-2' onClick={handleLogout}>
          Logout
        </button>
      </div>

    </div>
  )
}

export default Main;