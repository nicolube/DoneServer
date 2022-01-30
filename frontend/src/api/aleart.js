import React, { useEffect, useState } from 'react';
import { Alert,  CloseButton, Stack } from "react-bootstrap";



export const MessageTypes = {
    DEFAULT: 'primary',
    SUCCEESS: 'success',
    DANGER: 'danger',
    WARING: 'warning',
    INFO: 'info'
}
var messages = [];

let msgId = 0;
export const addMessage = (message, type = MessageTypes.DEFAULT) => {
    messages.push({
        key: msgId,
        msg: <Alert className='mt-3' key={msgId} variant={type}>
            <Stack direction="horizontal" gap={1}>
                <div className="me-auto" >{message}</div>
                <CloseButton value={msgId} onClick={handleRemove}></CloseButton >
            </Stack>
        </Alert>
    })
    msgId++;
    console.log("Add " + messages);
}

const handleRemove = (e) => {
    messages = messages.filter(m =>  m.key !== parseInt(e.target.value))
}
export default () => {

    const [m, setM] = useState([])
    useEffect(() => {

        setTimeout(() => {
            setM(messages.map(m => m.msg))
        }, 200)
    })
    return <div>
        {m}
    </div>
}
