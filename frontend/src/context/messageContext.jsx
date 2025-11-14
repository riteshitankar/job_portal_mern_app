import { useState, useEffect, createContext, useContext, Children } from "react"

const messageContext = createContext()

let MessageProvider = ({ children }) => {

    let [message, setMessage] = useState({
        status: "", content: "", open: false
    })

    let triggerMessage = (status, content) => {
        setMessage({ status, content, open: true })

        setTimeout(() => {
            setMessage({
                status: "", content: "", open: false
            })
        }, 5000)
    }

    return (
        <messageContext.Provider value={{ message, triggerMessage }}>
            {children}
        </messageContext.Provider>
    )
}

const useMessage = () => useContext(messageContext)

export { MessageProvider, useMessage }