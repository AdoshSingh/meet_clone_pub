import React, { useCallback, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import PeerService from '../service/peer';
import { useSocket } from '../context/SocketProvider';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import images from '../assets/exo';
import VideocamIcon from '@mui/icons-material/Videocam';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';

var peer = new PeerService();

const RoomPage = () => {
    const socket = useSocket();
    const navigate = useNavigate();

    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [remoteUserName, setRemoteUserName] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState();
    const [roomOwnerName, setRoomOwnerName] = useState('');
    const [streamSent, setStreamSent] = useState(false);
    const [hide, setHide] = useState(false);
    const [myName, setMyName] = useState();
    const [waitingCall, setWaitingCall] = useState(false);
    const [videoStatus, setVideoStatus] = useState(true);
    const [remoteVideoStatus, setRemoteVideoStatus] = useState(true);
    const [micStatus, setMicStatus] = useState(false);
    const [remoteMicStatus, setRemoteMicStatus] = useState(false);
    const [userDis, setUserDis] = useState(false);

    const { roomId } = useParams();
    const fetchRoomOwnerName = async () => {
        try {
            const response = await axios.get(`/api/get-ownername/${roomId}`);
            const ownerName = response.data.ownerName;
            setRoomOwnerName(ownerName);
            console.log('Name: ', ownerName);
        } catch (err) {
            console.log('Error: ', err);
        }
    }
    useEffect(() => {
        const data = localStorage.getItem('user');
        if (data) {
            const parsedData = JSON.parse(data);
            setMyName(parsedData.name);
        }
        else {
            navigate('/');
        }
        fetchRoomOwnerName();
    }, []);

    const handleUserJoined = useCallback(({ name, id }) => {
        console.log(`Name: ${name} joined the room`);
        setRemoteUserName(name);
        setRemoteSocketId(id);
    }, [])

    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        const offer = await peer.getOffer();
        socket.emit("user:call", { to: remoteSocketId, offer });
        setMyStream(stream);
        setHide(true);
        setWaitingCall(true);
    }, [remoteSocketId, socket]);

    const handleIncomingCall = useCallback(async ({ from, offer }) => {
        setHide(true);
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        setMyStream(stream);
        console.log(`Incoming offer`, from, offer);

        const ans = await peer.getAnswer(offer);
        socket.emit('call:accepted', { to: from, ans });
    }, [socket]);

    const sendStream = useCallback(() => {
        setStreamSent(true);
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }
    }, [myStream]);

    const handleCallAccepted = useCallback(({ from, ans }) => {
        peer.setLocalDescription(ans);
        console.log('Call accepted!');
        sendStream();
    }, [sendStream]);

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed', { offer, to: remoteSocketId })
    }, [remoteSocketId, socket]);

    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
        }
    }, [handleNegoNeeded]);

    const handleNegoNeedIncoming = useCallback(async ({ from, offer }) => {
        const ans = await peer.getAnswer(offer);
        socket.emit('peer:nego:done', { to: from, ans });
    }, [socket]);

    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans);
    }, [])

    useEffect(() => {
        peer.peer.addEventListener('track', async ev => {
            const remoteStream = ev.streams;
            setRemoteStream(remoteStream[0]);
        });
    }, []);

    useEffect(() => {
        socket.on('user:joined', handleUserJoined);
        socket.on('incoming:call', handleIncomingCall);
        socket.on('call:accepted', handleCallAccepted);
        socket.on('peer:nego:needed', handleNegoNeedIncoming)
        socket.on('peer:nego:final', handleNegoNeedFinal);

        return () => {
            socket.off('user:joined', handleUserJoined);
            socket.off('incoming:call', handleIncomingCall);
            socket.off('call:accepted', handleCallAccepted);
            socket.off('peer:nego:needed', handleNegoNeedIncoming)
            socket.off('peer:nego:final', handleNegoNeedFinal);
        }
    }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeedIncoming, handleNegoNeedFinal]);

    const handleVideoStatus = () => {
        const message = {
            type: 'videoStatus',
            videoStatus: !videoStatus,
        };
        socket.emit('send:message', { to: remoteSocketId, message });
        setVideoStatus(!videoStatus);
    }

    const handleMicStatus = () => {
        const message = {
            type: 'micStatus',
            micStatus: !micStatus,
        };
        socket.emit('send:message', { to: remoteSocketId, message });
        setMicStatus(!micStatus);
    }

    useEffect(() => {
        socket.on('receive:message', ({ message }) => {
            if (message.type === 'videoStatus') {
                setRemoteVideoStatus(message.videoStatus);
            }
            if (message.type === 'micStatus') {
                setRemoteMicStatus(message.micStatus);
            }
        });

        return () => {
            socket.off('receive:message');
        }
    }, [socket]);

    const handleLeaveMeeting = () => {
        socket.emit('user-disconnected', {to: remoteSocketId});
        if(myStream) {
            myStream.getTracks().forEach((track) => track.stop());
            setMyStream(null);
        }
        navigate('/main-page');
    }

    useEffect(() => {
        socket.on('user-disconnected', () => {
            setUserDis(true);
        });

        return () => {
            socket.off('user-disconnected');
        };
    },[socket]);

    return (
        <div className='h-screen bg-bgc flex flex-col items-center justify-center'>
            <div className='bg-card flex flex-col max-w-fit items-center p-8 gap-2 drop-shadow-xl'>
                <div className='flex flex-row items-center justify-between w-full'>
                    <h1 className='text-xl lg:text-4xl text-center font-semibold bg-violet-400 rounded-lg p-4'>{roomOwnerName}'s Room</h1>
                    {myStream && remoteStream &&
                        <button className='text-xl lg:text-4xl text-center font-semibold bg-red-400 rounded-lg p-4 hover:bg-red-300' onClick={handleLeaveMeeting}>
                            Leave
                        </button>
                    }
                </div>
                {hide == false
                    ?
                    (remoteSocketId ?
                        <div className='flex flex-col items-center justify-center gap-4'>
                            <p className='text-md sm:text-lg text-center'>{remoteUserName ? remoteUserName : roomOwnerName} joined the room</p>
                            <img className='w-24 drop-shadow-xl' src={images.connected} alt="" />
                        </div>
                        :
                        <div className='flex flex-col items-center justify-center gap-4'>
                            <p className='text-md sm:text-lg text-center'>Waiting for connection...</p>
                            <img className='w-24 drop-shadow-xl' src={images.disconnected} alt="" />
                        </div>
                    )
                    :
                    <div></div>
                }

                {streamSent == false
                    ?
                    myStream &&
                    <button className='text-lg p-2 bg-violet-400 rounded-lg font-semibold' onClick={sendStream}>
                        Accept Call
                    </button>
                    :
                    <div></div>
                }
                {remoteStream
                    ?
                    <div></div>
                    :
                    remoteSocketId &&
                    (<div>
                        {waitingCall
                            ?
                            <button className='mt-4 text-lg p-2 bg-violet-400 rounded-lg font-semibold'>
                                Calling...
                            </button>
                            :
                            <button className='mt-4 text-lg p-2 bg-violet-400 rounded-lg font-semibold' onClick={handleCallUser}>
                                Call {remoteUserName ? remoteUserName : roomOwnerName}
                            </button>
                        }
                    </div>)
                }
                <div className='flex flex-col lg:flex-row items-center justify-between gap-14'>
                    {
                        myStream &&
                        <div className='flex flex-col items-center gap-4 justify-center'>
                            <div className='flex items-center justify-center w-300 sm:w-400 lg:w-470 xl:w-500 2xl:w-600 border-violet-700 border-4'>
                                {videoStatus
                                    ?
                                    <ReactPlayer playing muted={micStatus} width="100%" height="100%" url={myStream} />
                                    :
                                    <img className='h-96 p-8' src={images.videoOff} alt="" />
                                }
                            </div>
                            <div className='flex flex-row gap-4 items-center justify-around w-full'>
                                <div
                                    className='flex items-center justify-center h-10 w-10 rounded-full border-violet-700 hover:bg-bgc border-4 cursor-pointer'
                                    onClick={handleVideoStatus}
                                >
                                    {videoStatus
                                        ?
                                        <VideocamIcon style={{ color: '#6d28d9' }} />
                                        :
                                        <VideocamOffIcon style={{ color: '#6d28d9' }} />
                                    }
                                </div>
                                <h1 className='text-3xl font-bold text-violet-700'>{myName}</h1>
                                <div
                                    className='flex items-center justify-center h-10 w-10 rounded-full border-violet-700 hover:bg-bgc border-4 cursor-pointer'
                                    onClick={handleMicStatus}
                                >
                                    {!micStatus
                                        ?
                                        <MicIcon style={{ color: '#6d28d9' }} />
                                        :
                                        <MicOffIcon style={{ color: '#6d28d9' }} />
                                    }
                                </div>
                            </div>
                        </div>
                    }
                    {
                        remoteStream &&
                        <div className='flex flex-col items-center gap-4 justify-center'>
                            <div className='flex items-center justify-center w-300 sm:w-400 lg:w-470 xl:w-500 2xl:w-600 border-gray-500 border-4'>
                                {remoteVideoStatus
                                    ?
                                    <ReactPlayer playing muted={remoteMicStatus} width="100%" height="100%" url={remoteStream} />
                                    :
                                    <img className='h-96 p-8' src={images.videoOff} alt="" />
                                }
                            </div>
                            <div className='flex flex-row gap-4 items-center justify-around w-full'>
                                <div className='flex items-center justify-center h-10 w-10 rounded-full border-gray-500 border-4'>
                                    {remoteVideoStatus
                                        ?
                                        <VideocamIcon style={{ color: '#6b7280' }} />
                                        :
                                        <VideocamOffIcon style={{ color: '#6b7280' }} />
                                    }
                                </div>
                                <h1 className='text-3xl font-bold text-gray-500'>{remoteUserName ? remoteUserName : roomOwnerName}</h1>
                                <div className='flex items-center justify-center h-10 w-10 rounded-full border-gray-500 border-4'>
                                    {!remoteMicStatus
                                        ?
                                        <MicIcon style={{ color: '#6b7280' }} />
                                        :
                                        <MicOffIcon style={{ color: '#6b7280' }} />
                                    }
                                </div>
                            </div>
                            {userDis && <p className='text-red-500 text-sm text-center'>{remoteUserName ? remoteUserName : roomOwnerName} disconnected</p>}
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default RoomPage