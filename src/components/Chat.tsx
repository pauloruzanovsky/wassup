import {useEffect, useState, useRef} from 'react';
import {fireStore,auth} from './firebase';
import {collection, query, orderBy, limit, addDoc, setDoc, doc, serverTimestamp} from 'firebase/firestore';
import {useCollectionData, useDocumentData} from 'react-firebase-hooks/firestore';
import ChatMessage from './ChatMessage';
import '../style/Chat.css'
import '../style/Sidebar.css'
import sendMsgIcon from '../assets/send-message.png'
import Sidebar from './Sidebar';
import {BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import addUserIcon from '../assets/add-user.png'
import removeUserIcon from '../assets/remove-user.png'

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
    const [addUserModal, setAddUserModal] = useState(false);

    console.log('currentroom:', currentRoom?.admins);
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

   const handleNewUserInputChange = (e:any) => {
       setAddUserInputValue(e.target.value)
       setFilteredUsers([])
       const newFilteredUsers:any[] = []
       props.usersData.forEach((user:any) => {
           if(user.displayName.toLowerCase().includes(e.target.value.toLowerCase()) && e.target.value) {
               newFilteredUsers.push(user)
           }
       })
       setFilteredUsers(newFilteredUsers)
       console.log('filteredUsers:', filteredUsers)
       
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
              !event.target.matches(".add-user-icon") &&
              !event.target.closest(".add-user-modal") &&
              addUserModal
            ) { 
                console.log(event.target)
                setAddUserModal(false);
                console.log('modal hidden')
                document.removeEventListener("click", hideModal)
            }
        }

       document.addEventListener("click",hideModal)    
        
    },[addUserModal])


    
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
                        {currentRoom?.admins.includes(user?.email) &&
                          <div className='chat-header-icons'>
                            <img src={addUserIcon} title='Add a user to this room' className='add-user-icon'onClick={() => {setAddUserModal(true)}}/>
                            {addUserModal && 
                            <div className='add-user-modal'>
                                <p>Add User</p>
                                <input value={addUserInputValue}
                                    onChange={handleNewUserInputChange}
                                    placeholder='User to be added'/> 
                                <div className='suggestion-box'>
                                    {filteredUsers.map(user => 
                                    <div className='suggestion-user' onClick={() => {setAddUserInputValue(user.email)}}>
                                        <img className='avatar'src={user.photoURL}/>
                                        <div className='text-wrapper'>
                                            <div className='suggestion-user-name'>{user.displayName}</div>
                                            <div className='suggestion-user-email'>{user.email}</div>
                                        </div>
                                    </div>)}
                                </div>
                            </div>
                                }
                            <img src={removeUserIcon} style={{height:'1em'}}/>
                        </div> }
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