import React from "react";

// for message 
// import { MessageProvider } from './context/messageContext.jsx'
// import Message from './components/sections/actions/Message.jsx'

// react-router-dom
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'

// pages
import Home from './components/pages/Home.jsx'
import UserLoginRegister from './components/pages/UserLoginRegister.jsx'

// context 
import {UserProvider} from './context/userContext.jsx'


const App = () => {
    return (
        <>
        <UserProvider>

        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/user-login-register" element={<UserLoginRegister />} />
            </Routes>
        </Router>
        </UserProvider>
        </>
    )
}

export default App