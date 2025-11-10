import React from 'react'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Home from "./components/pages/Home.jsx"
import UserLoginRegister from './components/pages/UserLoginRegister.jsx'

const App = () => {

  return (
    <>
      {/* <JobProvider>
        <UserPorovider> */}
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/user-login-register' element={<UserLoginRegister />} />
        </Routes>
      </Router>
      {/* </UserPorovider>
      </JobProvider> */}
    </>
  )
}

export default App
