import React from 'react'
import {auth} from './firebase'
import '../style/ChatMessage.css'
import { Timestamp } from "firebase/firestore";


export default function ChatMessage(props:any) {
    const {text,uid, photoURL, displayName, createdAt } = props.message
    const messageClass = uid === auth.currentUser?.uid ? 'sent' : 'received';

    const  createTime = () => {
        if(createdAt) {
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            const msgDate = createdAt.toDate();

            if( msgDate.getDate() === yesterday.getDate() &&
                msgDate.getMonth() === yesterday.getMonth() &&
                msgDate.getFullYear() === yesterday.getFullYear()) {
                    const date = 'Yesterday';
                    return date

                }

                if(msgDate < yesterday){
                    const newTimestampObj = new Timestamp(createdAt.seconds,createdAt.nanoseconds)
                    const date = newTimestampObj.toDate().toLocaleString('br-BR', {day:'2-digit', month:'2-digit', year:'numeric', });
                    return date
    
                    }


            const newTimestampObj = new Timestamp(createdAt.seconds,createdAt.nanoseconds)
            const date = newTimestampObj.toDate().toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true})
            return date
        }
        
    }
    return (
        <>
            <div className={`message ${messageClass}`}>
                <img className='avatar' src={photoURL}/>
                <div className='text-wrapper'>
                    <div className='name-and-time'>
                        <div className='display-name'>{displayName}</div>
                        <div className='time'>{createTime()}</div>
                    </div>
                    <div className="chat-text">{text}</div> 
                </div>
                
            </div>
                       
        </>
    )
}