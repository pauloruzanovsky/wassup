import '../style/ChatSettingsModal.css'
import removeUserIcon from '../assets/delete.png'  
import {doc, updateDoc} from 'firebase/firestore'
import {fireStore} from './firebase'

export default function ChatSettingsModal(props:any) {
    const currentRoomDoc = doc(fireStore,'rooms',props.currentRoom.title)

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

    console.log('currentUser: ', props.currentUser)

    const isCurrentUserAdmin = props.currentRoom.admins.some((admin:any) => admin.email === props.currentUser?.email)

    return(
        <div className='chat-settings-modal'>
            <div>Room Users</div>
            <div className='room-users'>
                {props.currentRoom.users.map((user:any) => 
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