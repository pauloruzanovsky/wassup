import {useEffect, useState, useRef} from 'react';
import {fireStore,auth} from './firebase';
import {collection, query, orderBy, limit, addDoc, setDoc, doc, serverTimestamp} from 'firebase/firestore';
import {useCollectionData, useDocumentData} from 'react-firebase-hooks/firestore';
import ChatMessage from './ChatMessage';
import ChatSettingsModal from './ChatSettingsModal'
import Sidebar from './Sidebar';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import settingsIcon from '../assets/setting.png'
import sendMsgIcon from '../assets/send-message.png'
import '../style/Chat.css'
import '../style/Sidebar.css'
import personalsIcon from '../assets/chat.png'
import roomsIcon from '../assets/group.png'
import headerMenuIcon from '../assets/user.png'


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
    const switchChat = (e:any) => {
        showMainChat();
        setShouldScroll(true)
        if(e.target.className === 'room') {
            setCurrentDb(e.target.querySelector('.room-title').textContent)  
            return      
        }
        const personalToSwitch = roomsData?.filter((room:any) => 
                                                                room.type === 'personal' && 
                                                                [room.firstUser.displayName,room.secondUser.displayName].includes(e.target.querySelector('.personal-name').textContent) && 
                                                                [room.firstUser.displayName,room.secondUser.displayName].includes(props.user.displayName))[0].title
        setCurrentDb(personalToSwitch)
        }

    const addUserToWelcomeRoom = () => {
        roomsData?.forEach((room:any) => {
           if(user && room.title === 'welcome' && !room.users.some((roomUser:any) => roomUser.email === user?.email)) {
                setDoc(doc(fireStore,'rooms','welcome'), 
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

   const showHeader = () => {
    const header = document.getElementsByTagName('header')[0];
    const mainChat = document.querySelector('.main')
    const personals = document.querySelector('.personals')
    const rooms = document.querySelector('.rooms')
    const sideBar = document.querySelector ('.sidebar')
    header.className = 'show';
    mainChat && (mainChat.className = 'hide main')
    personals && (personals.className = 'hide personals')
    rooms && (rooms.className = 'hide rooms')
    sideBar && (sideBar.className = 'hide sidebar')
   }

   const showPersonals = () => {
    const header = document.getElementsByTagName('header')[0];
    const mainChat = document.querySelector('.main')
    const personals = document.querySelector('.personals')
    const rooms = document.querySelector('.rooms')
    const sideBar = document.querySelector ('.sidebar')
    header.className = 'hide';
    mainChat && (mainChat.className = 'hide main')
    personals && (personals.className = 'show personals')
    rooms && (rooms.className = 'hide rooms')
    sideBar && (sideBar.className = 'show sidebar')
   }

   const showRooms = () => {
    const header = document.getElementsByTagName('header')[0];
    const mainChat = document.querySelector('.main')
    const personals = document.querySelector('.personals')
    const rooms = document.querySelector('.rooms')
    const sideBar = document.querySelector ('.sidebar')
    header.className = 'hide';
    mainChat && (mainChat.className = 'hide main')
    personals && (personals.className = 'hide personals')
    rooms && (rooms.className = 'show rooms')
    sideBar && (sideBar.className = 'show sidebar')
   }

   const showMainChat = () => {
    const header = document.getElementsByTagName('header')[0];
    const mainChat = document.querySelector('.main')
    const personals = document.querySelector('.personals')
    const rooms = document.querySelector('.rooms')
    const sideBar = document.querySelector ('.sidebar')
    header.className = 'hide';
    mainChat && (mainChat.className = 'show main')
    rooms && (rooms.className = 'hide rooms')
    personals && (personals.className = 'hide personals')
    sideBar && (sideBar.className = 'show sidebar')
   }   

    useEffect(() => {

        addUserToWelcomeRoom()
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
                <header>
                    <b className='header-text'>{`Hello ${props.user.displayName}!`}</b>
                    <img className='user-avatar' src={props.user.photoURL} alt={props.user.displayName}/>
                    <button onClick={props.signOut}>Sign Out</button>
                </header>
                <Sidebar
                    switchChat={switchChat}
                    rooms={rooms}
                    setRooms={setRooms}
                    user={user}
                    usersData={props.usersData}
                    setCurrentDb={setCurrentDb}
                    showMainChat={showMainChat}
                    />
                <div className='main'>
                    <div className='chat-header'>
                        <div className='chat-title'>{currentRoom?.type === 'personal' ? 
                            <>
                            <div className='personal-title'>{currentRoom.firstUser.email === props.user.email ? currentRoom.secondUser.displayName : currentRoom.firstUser.displayName}</div>
                            <div className='personal-email'>{currentRoom.firstUser.email === props.user.email ? currentRoom.secondUser.email : currentRoom.firstUser.email}</div>
                            </>
                            : currentRoom?.title}</div>
                            <div>
                                {currentRoom?.type === 'room' && <img src={settingsIcon} className='chat-settings-icon' title='Room settings' onClick={() => {setShowChatSettingsModal(true)}}/>}
                                {showChatSettingsModal && <ChatSettingsModal
                                                                            addUserInputValue={addUserInputValue}
                                                                            handleNewUserInputChange={handleNewUserInputChange}
                                                                            filteredUsers={filteredUsers}
                                                                            addUserToRoom={addUserToRoom}
                                                                            currentRoom={currentRoom}
                                                                            currentUser={user}
                                                                            switchChat={switchChat}
                                                                            setCurrentDb={setCurrentDb}
                                                                            setShouldScroll={setShouldScroll}
                                                                            setShowChatSettingsModal={setShowChatSettingsModal}
                                                                            />
                                    }
                                </div>
                        </div>
                        <Routes>
                        <Route path={`/*`} element={<Navigate to="/welcome"/>}/>
                        <Route path={`/welcome`} element={<div className='chat-container'>
                                                            <div className='chat-messages'>
                                                {messages && messages.map((message:any) => (<ChatMessage key={message.id} message={message}/>
                                                ))} 
                                                <div ref={dummy}></div>
                                            </div>
                                            </div>}/>

                        {rooms && rooms.map((room:any) => {
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
                <nav className='mobile-navbar'>
                        <div onClick={showPersonals}>
                            <img src={personalsIcon}/>
                        </div>
                        <div onClick={showRooms}>
                        <img src={roomsIcon}/>
                        </div>
                        <div onClick={showHeader}>
                        <img src={headerMenuIcon}/>
                        </div>

                    </nav>
            </div>
        </BrowserRouter>

    )

}