import { useState, useEffect, createContext, useContext, Children } from "react"

import { requestUserProfile } from "../api/userAPI.js"
const userContext = createContext()

let UserProvider = ({ children }) => {

    let [user, setUser] = useState({
        logedIn: false,
        // name: "ritesh itankar"
    })

    useEffect(() => {
        fetchUserProfile()
    }, [])

    const fetchUserProfile = async () => {
        try {
            let token = localStorage.getItem('token')

            if (!token) throw ("token not found !")

            let result = await requestUserProfile(token)

            if (result.status != 200) throw ("unable to fetch user profile !")

            setUser(prev => {
                return { ...result.data.userData, logedIn: true }
            })

        } catch (err) {
            console.log("profile fetching error : ", err)
        }
    }

    return (
        <userContext.Provider value={{ user, fetchUserProfile }}>

            {children}
        </userContext.Provider>
    )
}

const useUser = () => useContext(userContext)

export { UserProvider, useUser }