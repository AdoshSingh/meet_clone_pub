import React from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPass from './components/ForgotPass';
import Main from './components/Main';
import ResetPass from './components/ResetPass';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SocketProvider } from './context/SocketProvider';
import Room from './components/Room';

const App = () => {
  return (
    <div className='h-screen'>
      <BrowserRouter>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup-page" element={<Signup />} />
            <Route path="/main-page" element={<Main />} />
            <Route path="/room/:roomId" element={<Room />} />
            <Route path="/forgot-pass" element={<ForgotPass />} />
            <Route path="/reset-pass/:token" element={<ResetPass />} />
          </Routes>
        </SocketProvider>
      </BrowserRouter>
    </div>
  )
}

export default App
