import React, {useEffect, useState, useRef} from 'react';
import {fireStore,auth} from './firebase';
import {collection, query, orderBy, where, limit, addDoc, setDoc, doc, serverTimestamp} from 'firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import ChatMessage from './ChatMessage';
import '../style/Chat.css'
import '../style/Sidebar.css'
import addIcon from '../assets/plus.png'
import sendMsgIcon from '../assets/send-message.png'
import Sidebar from './Sidebar';
import {BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'


export default function Chat(props:any) {

    const user = auth.currentUser;
    const [currentDb, setCurrentDb] = useState('welcome');
    const [rooms, setRooms] = useState<any[]>([]);
    const [formValue, setFormValue] = useState('');
    
    const messagesRef = collection(fireStore,`rooms/${currentDb}/chat-messages`);
    const q = query(messagesRef, orderBy('createdAt'),limit(50));
    const [messages] = useCollectionData(q);

    const roomsCollection = collection(fireStore,'rooms')
    const roomsQuery = query(roomsCollection,orderBy('createdAt'));
    const [roomsData] = useCollectionData(roomsQuery);
    console.log('roomsData:', roomsData)
    const dummy = useRef<HTMLDivElement>(null)

    const sendMessage = async(e:any) => {
        e.preventDefault();

        if(user && formValue) {
            const {uid, photoURL, displayName} = user;
            await addDoc(messagesRef, {
                text: formValue,
                createdAt: serverTimestamp(),
                uid,
                photoURL,
                displayName
            }).then(() => {
                setFormValue('')

            })

            if(dummy.current) {
                dummy.current.scrollIntoView({behavior: 'auto'})
            }
        }
        
    }

    const switchChat = (e:any) => {
        setCurrentDb(e.target.textContent)
    }

    useEffect(() => {

        addUsersToPublicRooms()
        let newRooms:any[] = [];
        roomsData?.forEach((room:any) => newRooms.push(room))

        setRooms([...newRooms])

    },[roomsData])


    useEffect(() => {
       
    },[roomsData])

    const addUsersToPublicRooms = () => {
         roomsData?.forEach((room:any) => {
            if(room.type === 'public' && !room.users.includes(props.user.uid)) {
                  setDoc(doc(fireStore,'rooms',room.title), 
                    {
                    ...room,
                    users: [...room.users, props.user.uid]  
                    }
                )
            }
        })
    }

    
    return(
        <BrowserRouter>
            <div className='app'>  
                <header>Header
                    <button onClick={props.signOut}>Sign Out</button>
                </header>
                <Sidebar
                    switchChat={switchChat}
                    rooms={rooms}
                    setRooms={setRooms}
                    user={user}/>
                <div className='main'>
                    <Routes>
                    <Route path={`/`} element={<Navigate to="/welcome"/>}/>
       

                    {rooms.map((room:any) => {
                        return(
                            <Route path={`/${room.title}`} 
                                   key={room.title} 
                                   element={<div className='chat-container'>
                                            <div>{room.title}</div>
                                                {messages && messages.map((message:any) => (<ChatMessage key={message.id} message={message}/>
                                                ))} 
                                                <div ref={dummy}></div>
                                            </div>}/>
                        )
                    })}
                    </Routes>
                    <form className='chat-form' onSubmit={sendMessage}>                
                        <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
                        <button className='submit-button' type='submit'>
                            <img className='send-img' src={sendMsgIcon} alt='send'/>
                        </button>
                    </form>
                </div>
            </div>
        </BrowserRouter>

    )
}