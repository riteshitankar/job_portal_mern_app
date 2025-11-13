import { useState, useEffect, createContext, useContext, Children } from "react"

const userContext = createContext()

let UserProvider = ({ children }) => {

    let [user, setUser] = useState({
        logedIn: false,
        name: "Amey Khondekar"
    })

    return (
        <userContext.Provider value={{ user }}>
            {children}
        </userContext.Provider>
    )
}

const useUser = () => useContext(userContext)

export { UserProvider, useUser }