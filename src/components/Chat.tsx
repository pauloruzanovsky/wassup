import {useEffect, useState, useRef} from 'react';
import {fireStore,auth} from './firebase';
import {collection, query, orderBy, limit, addDoc, setDoc, doc, serverTimestamp} from 'firebase/firestore';
import {useCollectionData, useDocumentData} from 'react-firebase-hooks/firestore';
import ChatMessage from './ChatMessage';
import ChatSettingsModal from './ChatSettingsModal'
import Sidebar from './Sidebar';
import {BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import settingsIcon from '../assets/setting.png'
import sendMsgIcon from '../assets/send-message.png'
import '../style/Chat.css'
import '../style/Sidebar.css'


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

    const [currentRoom] = useDocumentData(doc(fireStore,'rooms', currentDb));

    const dummy = useRef<HTMLDivElement>(null)
    const [shouldScroll, setShouldScroll] = useState(false);

    const [addUserInputValue, setAddUserInputValue] = useState("");
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [showChatSettingsModal, setShowChatSettingsModal] = useState(false);

    const sendMessage = async(e:any) => {
        e.preventDefault();

        if(user && formValue) {
            const {uid, photoURL, displayName} = user;
            console.log(user)
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
    const switchChat = async(e:any) => {
    setCurrentDb(e.target.textContent)        
    setShouldScroll(true)
    }

    const addUserToPublicRooms = () => {
        roomsData?.forEach((room:any) => {
           if(user && room.type === 'public' && !room.users.some((roomUser:any) => roomUser.email === user?.email)) {
                setDoc(doc(fireStore,'rooms',room.title), 
                            {
                            ...room,
                            users: [...room.users, {email: user?.email, displayName: user?.displayName, photoURL: user?.photoURL, uid: user?.uid}]  
                            }
                    )
           }
       })
   }

   const handleNewUserInputChange = (e:any) => {
    console.log('usersData:', props.usersData)
       setAddUserInputValue(e.target.value)
       setFilteredUsers([])
       const newFilteredUsers:any[] = []
       props.usersData.forEach((user:any) => {
        if(currentRoom) {
            const shouldShowUser =  user.displayName.toLowerCase().includes(e.target.value.toLowerCase()) && 
                                    e.target.value && 
                                    !currentRoom.users.some((roomUser:any) => roomUser.email === user.email)
            if(shouldShowUser) {
                newFilteredUsers.push(user)
                setFilteredUsers(newFilteredUsers)

            }
        }
       })
   }

   const addUserToRoom = (e:any) => {

    const emailOfUserToBeAdded = e.target.querySelector('.text-wrapper').querySelector('.suggestion-user-email').textContent
    if(currentRoom){
        props.usersData.forEach((user:any) => {
            if(user.email === emailOfUserToBeAdded) {
                setDoc(doc(fireStore,'rooms',currentRoom.title), 
                        {
                        ...currentRoom,
                        users: [...currentRoom.users, user]  
                        }
                )
            }
        })
        
    setAddUserInputValue('');
    console.log(`${emailOfUserToBeAdded} added to room`)
    }
    
   }

    useEffect(() => {

        addUserToPublicRooms()
        let newRooms:any[] = [];
        roomsData?.forEach((room:any) => newRooms.push(room))

        setRooms([...newRooms])

    },[roomsData])

    useEffect(() => {
        setTimeout(() => {
            if(dummy.current)
            dummy.current.scrollIntoView({behavior:'smooth'})
        },1000)
        setShouldScroll(false)

       
    },[shouldScroll])

    useEffect(() => {

        const hideModal = (event:any) => {
            if (
              !event.target.matches(".chat-settings-icon") &&
              !event.target.closest(".chat-settings-modal") &&
              !event.target.matches(".suggestion-user") &&
              showChatSettingsModal
            ) { 
                setShowChatSettingsModal(false);
                document.removeEventListener("click", hideModal)
                setAddUserInputValue('')
            }
        }

       document.addEventListener("click",hideModal)    
        
    },[showChatSettingsModal])


    
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
                    user={user}
                    usersData={props.usersData}/>
                <div className='main'>
                    <div className='chat-header'>
                        <div className='chat-title'>{currentDb}</div>
                            <div>
                                <img src={settingsIcon} className='chat-settings-icon' title='Room settings' onClick={() => {setShowChatSettingsModal(true)}}/>
                                {showChatSettingsModal && <ChatSettingsModal 
                                                                            addUserInputValue={addUserInputValue}
                                                                            handleNewUserInputChange={handleNewUserInputChange}
                                                                            filteredUsers={filteredUsers}
                                                                            addUserToRoom={addUserToRoom}
                                                                            currentRoom={currentRoom}
                                                                            currentUser={user}
                                                                            />
                                }
                            </div>
                    </div>
                    <Routes>
                    <Route path={`/`} element={<Navigate to="/welcome"/>}/>
                    {rooms.map((room:any) => {
                        return(
                            <Route path={`/${room.title}`} 
                                   key={room.title} 
                                   element={<div className='chat-container'>
                                            
                                            <div className='chat-messages'>
                                                {messages && messages.map((message:any) => (<ChatMessage key={message.id} message={message}/>
                                                ))} 
                                                <div ref={dummy}></div>
                                            </div>
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