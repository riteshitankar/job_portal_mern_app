import React, { useEffect } from 'react'

import { useUser } from '../../../context/userContext.jsx'
import { useMessage } from '../../../context/messageContext.jsx'
import { useNavigate } from 'react-router-dom'
import { requestUserProfile } from '../../../api/userAPI.js'
import Header from '../../sections/sections/includes/Header.jsx'
import Footer from '../../sections/sections/includes/Footer.jsx'

const UserDashboard = () => {

    let { user, fetchUserProfile } = useUser()

    let { triggerMessage } = useMessage()

    let navigate = useNavigate()

    let token = localStorage.getItem("token")

    useEffect(() => {
        checkDashbaordAccess()
    }, [])


    const checkDashbaordAccess = async () => {
        try {

            if (!token) throw ("token not found !")

            let result = await requestUserProfile(token)

            if (result.status != 200) throw ("token is invalid please login first !")

            await fetchUserProfile()

            triggerMessage("success", `welcome ${result.data.userData.name} to dashboard !`)

        } catch (err) {
            console.log("cannot provide dashboard access !")
            navigate("/user-login-register")
            triggerMessage("warning", "Please login first to access dashboard !")
        }
    }

    return (
        <>
            <Header />
            <h1 className='text-4xl'>this is user dashboard !</h1>
            <Footer />
        </>
    )
}

export default UserDashboard