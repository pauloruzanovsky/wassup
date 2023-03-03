
import '../style/Sidebar.css'
import addIcon from '../assets/plus.png'
import React, {useState, useEffect, } from 'react'
import {Link} from 'react-router-dom'
import { fireStore,auth } from './firebase';
import {collection, query, orderBy, limit, setDoc, doc, serverTimestamp} from 'firebase/firestore';


export default function Sidebar(props:any) {
    const [newRoomModal, setNewRoomModal] = useState(false);
    const [newRoomInputValue, setNewRoomInputValue] = useState("");

    const showRoomModal = () => {
        setNewRoomModal(true);
    }

    const createNewRoom = async (e:any) => {
        e.preventDefault();
        if(newRoomInputValue) {
            await setDoc(doc(fireStore,'rooms',newRoomInputValue), {
                title: newRoomInputValue,
                createdAt: serverTimestamp(),
                type: 'private',
                users: [props.user.uid]
    
            }).then(() => {
                setNewRoomInputValue('')
                setNewRoomModal(false);
            })
        }
       
    }
    console.log(props.user.uid)
    useEffect(() => {

        const hideModal = (event:any) => {
            // If user either clicks X button OR clicks outside the modal window, then close modal by calling closeModal()
            if (
              !event.target.matches(".new") &&
              !event.target.closest(".new-room-modal") &&
              newRoomModal
            ) { 
                console.log(event.target)
                setNewRoomModal(false);
                console.log('modal hidden')
                document.removeEventListener("click", hideModal)
            }
        }

       document.addEventListener("click",hideModal)    
        
    },[newRoomModal])

    return(
        <nav className='sidebar'>
                <div className='chats'>
                    <div className='rooms-title'>
                        <h3>Chats</h3>
                        <button className='new chat'>
                            <img src={addIcon}/>
                        </button>
                    </div>                    
                    <div className='chats-content'>
                        <a href='#'>Chat 1 under construction</a>
                        <a href='#'>Chat 2 under construction</a>
                    </div>
                   
                </div>
                <div className='rooms'>
                    <div className='rooms-title'>
                        <h3>Rooms</h3>
                        <button onClick={showRoomModal} className='new room'>
                            <img src={addIcon}/>
                        </button>
                    </div>
                    <div className='rooms-content'>
                        {props.rooms && props.rooms.map((room:any) => {
                            if(room.users.includes(props.user.uid)) {
                                return(
                                    <Link to={`/${room.title}`} onClick={props.switchChat} key={room.title}>{room.title}</Link>
                                )
                            }
                            
                        })}
                    </div>
                    {newRoomModal && <div className='new-room-modal'>
                        <form className='new-room-form'>
                            <input value={newRoomInputValue}
                                    onChange={(e) => setNewRoomInputValue(e.target.value)}
                                    className='new-room-input' 
                                    placeholder='New room name'/>
                            
                            <button 
                                onClick={createNewRoom}
                                className='new-room-submit-button'>Create Room</button>
                        </form>
                        </div>}
                </div>
                
            </nav>
    )
}
