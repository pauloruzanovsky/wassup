
import '../style/Sidebar.css'
import addIcon from '../assets/plus.png'
import {useState, useEffect, } from 'react'
import {Link} from 'react-router-dom'
import { fireStore } from './firebase';
import {setDoc, doc, serverTimestamp} from 'firebase/firestore';


export default function Sidebar(props:any) {
    const [showNewRoomModal, setShowNewRoomModal] = useState(false);
    const [newRoomInputValue, setNewRoomInputValue] = useState("");

    const [showNewPersonalModal, setShowNewPersonalModal] = useState(false);
    const [newPersonalInputValue, setNewPersonalInputValue] = useState("");
    
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);


    const createNewRoom = async (e:any) => {
        e.preventDefault();
        if(newRoomInputValue) {
            await setDoc(doc(fireStore,'rooms',newRoomInputValue), {
                title: newRoomInputValue,
                createdAt: serverTimestamp(),
                type: 'room',
                users: [JSON.parse(JSON.stringify(props.user))],
                admins: [JSON.parse(JSON.stringify(props.user))]
    
            }).then(() => {
                setNewRoomInputValue('')
                setShowNewRoomModal(false);
            })
        }
       
   
    }

    const handleNewPersonalInputChange = (e:any) => {
        setNewPersonalInputValue(e.target.value)
        setFilteredUsers([])
        console.log(props.usersData)
        console.log(props.currentUser)
        const newFilteredUsers:any[] = []
        props.usersData.forEach((user:any) => {
            console.log(user.email.toLowerCase() !== (props.user?.email.toLowerCase()))
             const shouldShowUser =  user.displayName.toLowerCase().includes(e.target.value.toLowerCase()) && 
                                     e.target.value && 
                                     user.email.toLowerCase() !== (props.user?.email.toLowerCase())
             if(shouldShowUser) {
                 newFilteredUsers.push(user)
                 setFilteredUsers(newFilteredUsers)
 
             }
         
        })
    }
    
    const startPersonalWithUser = (e:any) => {
        const secondUserEmail = e.target.querySelector('.text-wrapper').querySelector('.suggestion-user-email').textContent
        
        props.usersData.forEach( async (user:any) => {
            if(user.email === secondUserEmail) {
                const personalTitle = `${props.user.email} and  ${secondUserEmail} personal chat`


                await setDoc(doc(fireStore,'rooms', personalTitle), {
                    title: personalTitle,
                    createdAt: serverTimestamp(),
                    type: 'personal',
                    firstUser: JSON.parse(JSON.stringify(props.user)),
                    secondUser: user    
                }).then(() => {
                    setNewPersonalInputValue('')
                    setShowNewPersonalModal(false);
                })


                // setDoc(doc(fireStore,'rooms',currentRoom.title), 
                //         {
                //         ...currentRoom,
                //         users: [...currentRoom.users, user]  
                //         }
                // )
            }
        })
        
    setNewPersonalInputValue('');
    }

    useEffect(() => {

        const hideNewRoomModal = (event:any) => {
            // If user either clicks X button OR clicks outside the modal window, then close modal by calling closeModal()
            if (
              !event.target.matches(".new-room") &&
              !event.target.closest(".new-room-modal") &&
              showNewRoomModal
            ) { 
                console.log(event.target)
                setShowNewRoomModal(false);
                document.removeEventListener("click", hideNewRoomModal)
            }
        }

        const hideNewPersonalModal = (event:any) => {
            // If user either clicks X button OR clicks outside the modal window, then close modal by calling closeModal()
            if (
              !event.target.matches(".new-personal") &&
              !event.target.closest(".new-personal-modal") &&
              showNewPersonalModal
            ) { 
                console.log(event.target)
                setShowNewPersonalModal(false);
                document.removeEventListener("click", hideNewPersonalModal)
            }
        }

       document.addEventListener("click",hideNewRoomModal)    
       document.addEventListener("click",hideNewPersonalModal)    

        
    },[showNewRoomModal, showNewPersonalModal])

    return(
        <nav className='sidebar'>
                <div className='personals'>
                    <div className='rooms-title'>
                        <h3>Personal Chats</h3>
                        <button onClick={() => {setShowNewPersonalModal(true)}} className='new-personal' >
                            <img src={addIcon}/>
                        </button>
                    </div>                    
                    <div className='personals-content'>
                    {props.rooms && props.rooms.map((room:any) => {
                        if(room.type === 'personal') {
                            let shouldShowPersonal = room.firstUser.email === props.user.email || room.secondUser.email === props.user.email
                            if(shouldShowPersonal) {
                                return(
                                    <Link to={`/${room.title}`} onClick={props.switchChat} key={room.title}>{room.firstUser.email === props.user.email ? room.secondUser.email : room.firstUser.email}</Link>
                                )
                            }
                        }
                            
                           
                        })}
                    </div>
                    {showNewPersonalModal && <div className='new-personal-modal'>
                        <form className='new-personal-form'>
                            <div>Start a personal chat</div>
                            <input value={newPersonalInputValue}
                                    onChange={handleNewPersonalInputChange}
                                    className='new-personal-input' 
                                    placeholder='User'/>
                            {newPersonalInputValue && filteredUsers && <div className='suggestion-box'>
                            {filteredUsers.map((user:any) => <div className='suggestion-user' onClick={startPersonalWithUser}>
                                <img className='avatar' src={user.photoURL} />
                                <div className='text-wrapper'>
                                    <div className='suggestion-user-name'>{user.displayName}</div>
                                    <div className='suggestion-user-email'>{user.email}</div>
                                </div>
                            </div>)}
                             </div>}
                        </form>
                        </div>}
                   
                </div>
                <div className='rooms'>
                    <div className='rooms-title'>
                        <h3>Rooms</h3>
                        <button onClick={() => {setShowNewRoomModal(true)}} className='new-room'>
                            <img src={addIcon}/>
                        </button>
                    </div>
                    <div className='rooms-content'>
                        {props.rooms && props.rooms.map((room:any) => {
                            if(room.type === 'room') {
                                let shouldShowRoom = room.users.some((roomUser:any) => roomUser.email === props.user.email)
                                if(shouldShowRoom) {
                                    return(
                                        <Link to={`/${room.title}`} onClick={props.switchChat} key={room.title}>{room.title}</Link>
                                    )
                                }
                            }
                            
                        })}
                    </div>
                    {showNewRoomModal && <div className='new-room-modal'>
                        <form className='new-room-form'>
                            <div>Create a room</div>
                            <input value={newRoomInputValue}
                                    onChange={(e) => setNewRoomInputValue(e.target.value)}
                                    className='new-room-input' 
                                    placeholder='Room name'/>
                            <button 
                                onClick={createNewRoom}
                                className='new-room-submit-button'>Create Room</button>
                        </form>
                        </div>}
                </div>
                
            </nav>
    )
}
