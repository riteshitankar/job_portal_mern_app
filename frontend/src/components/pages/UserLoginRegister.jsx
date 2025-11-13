import React from "react";

import UserLoginRegisterForm from '../sections/UserLoginRegisterForm.jsx'

// header and footer
import Header from '../sections/sections/includes/Header.jsx'
import Footer from '../sections/sections/includes/Footer.jsx'


const UserLoginRegister = () => {
    return(
        <>
        <Header />
        {/* actual registration form */}
        <UserLoginRegisterForm />
        <Footer />
        </>
    )
}

export default UserLoginRegister