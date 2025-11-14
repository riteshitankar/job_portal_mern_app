import React from "react";

// for message 
import { MessageProvider } from './context/messageContext.jsx'
import Message from './components/sections/actions/Message.jsx'

// react-router-dom
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// pages
import Home from './components/pages/Home.jsx'
import UserLoginRegister from './components/pages/UserLoginRegister.jsx'
import UserDashboard from './components/pages/UserDashboard/UserDashboard.jsx'


// context 
import { UserProvider } from './context/userContext.jsx'


const App = () => {
    return (
        <>
            <MessageProvider>
                <Message />
                <UserProvider>
                    <Router>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/user-login-register" element={<UserLoginRegister />} />
                            <Route path="/user/dashboard" element={<UserDashboard />} />
                        </Routes>
                    </Router>
                </UserProvider>
            </MessageProvider>
        </>
    )
}

export default App