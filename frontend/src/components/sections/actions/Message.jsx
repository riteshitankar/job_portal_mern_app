import React from 'react'

import "./message.scss"

import { useMessage } from "../../../context/messageContext.jsx"

const Message = () => {

    let { message } = useMessage()

    if (!message.open) return null

    return (
        <div id='message' className={message.status}>
            <span className='font-bold'>{message.content}</span>
        </div>
    )
}

export default Message