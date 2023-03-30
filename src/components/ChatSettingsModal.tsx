import '../style/ChatSettingsModal.css'
import removeUserIcon from '../assets/delete.png'  
import {doc, updateDoc, deleteDoc} from 'firebase/firestore'
import {fireStore} from './firebase'
import { Link } from 'react-router-dom'

export default function ChatSettingsModal(props:any) {

    if(props.currentRoom) {

    const isCurrentUserAdmin = props.currentRoom.admins.some((admin:any) => admin.email === props.currentUser?.email)
    const currentRoomDoc = props.currentRoom && doc(fireStore,'rooms',props.currentRoom.title)
    const sortedRoomUsers = props.currentRoom.users.sort((a:any,b:any) => {
        const nameA = a.displayName.toLowerCase()
        const nameB = b.displayName.toLowerCase()

        if(nameA < nameB) {
            return -1
        }

        if(nameA > nameB) {
            return 1

        }
        return 0
    })

    const removeUserFromRoom = async (e:any) => {
        const emailOfUserToBeRemoved = e.target.parentElement.id
        const updatedUsersArray:any[] = [];
        props.currentRoom?.users.forEach((user:any) => {
            if(user.email !== emailOfUserToBeRemoved) {
                updatedUsersArray.push(user)
            }
        })
        if(currentRoomDoc) {
           await updateDoc(currentRoomDoc, {
            users: [...updatedUsersArray]
           })
            
            
        }
    }

    const leaveRoom = async () => {

        const emailOfUserLeavingRoom = props.currentUser.email
        const updatedUsersArray:any[] = [];
        props.currentRoom?.users.forEach((user:any) => {
            if(user.email !== emailOfUserLeavingRoom) {
                updatedUsersArray.push(user)
            }
        })
        if(currentRoomDoc) {
           await updateDoc(currentRoomDoc, {
            users: [...updatedUsersArray]
           })
           props.setCurrentDb('welcome')
           props.setShouldScroll(true)
           props.setShowChatSettingsModal(false)


        }

        
    }

    const deleteRoom = async () => {
        await deleteDoc(currentRoomDoc).then(() => {
            props.setCurrentDb('welcome')     
            props.setShouldScroll(true)
            props.setShowChatSettingsModal(false)
   

        })
        }
    


    return(
        <div className='chat-settings-modal' >
            <div className='chat-settings-buttons'>
                <Link to='welcome'>                
                    <button className='chat-settings-button' onClick={leaveRoom}>Leave Room</button>
                </Link>
                <Link to='welcome'>                
                {isCurrentUserAdmin && <button className='chat-settings-button' onClick={deleteRoom}>Delete Room</button>}
                </Link>

            </div>
                                

            <div className='room-users-title'>Room Users</div>
            <div className='room-users'>
                {sortedRoomUsers.map((user:any) => 
                <div className="room-user" id={user.email} key={user.email}>
                    <img className='avatar' src={user.photoURL} />
                    <div className='text-wrapper'>
                        <div className='suggestion-user-name'>{user.displayName}</div>
                        <div className='suggestion-user-email'>{user.email}</div>
                    </div>
                    { isCurrentUserAdmin && <img className='remove-user-icon' title='Remove user from room' onClick={removeUserFromRoom} src={removeUserIcon}/>}
                </div>)}
            </div>
            
            {isCurrentUserAdmin && 
            <div className='add-user-section'>
                <p>Add User</p>
                <input value={props.addUserInputValue}
                    onChange={props.handleNewUserInputChange}
                    placeholder='User to be added'/>
                {props.addUserInputValue && props.filteredUsers && <div className='suggestion-box'>
                    {props.filteredUsers.map((user:any) => <div className='suggestion-user' onClick={props.addUserToRoom}>
                        <img className='avatar' src={user.photoURL} />
                        <div className='text-wrapper'>
                            <div className='suggestion-user-name'>{user.displayName}</div>
                            <div className='suggestion-user-email'>{user.email}</div>
                        </div>
                    </div>)}
                </div>}
            </div>}
        </div>
    )
            }
    return (<></>)
}