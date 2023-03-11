import { fireStore, auth, provider } from './components/firebase';
import {signInWithPopup} from 'firebase/auth'
import {useAuthState} from 'react-firebase-hooks/auth'
import Chat from './components/Chat';
import {collection, setDoc, doc} from 'firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import  { useEffect, useState } from 'react';
import './style/App.css'



export default function App() {
    
    const usersCollection = collection(fireStore,'users')
    const [usersData, isLoading] = useCollectionData(usersCollection);
    const [user] = useAuthState(auth);
    const [users, setUsers] = useState<any[]>([])


    const registerUser = () => {
        const currentUser = auth.currentUser;
        const exists = usersData?.find(user => user.email === currentUser?.email)
           if(!exists && currentUser) {
                 setDoc(doc(fireStore,'users', currentUser.uid), 
                   {
                    uid: currentUser.uid,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL,
                    email: currentUser.email,
                    }
               )
            console.log('user logged.')

           }
   }

    const handleSignUp = () => {
        signInWithPopup(auth, provider)
    }

    const signOut = () => {
        auth.signOut()
    }

    useEffect(() => {
        if(usersData && user) {
            registerUser()

        }
    },[user])

    useEffect(() => {
        if(!isLoading && usersData) {
            setUsers(usersData);
            
        }

    },[isLoading])

    return (
        <div className='login-page'>
            {user ? <Chat
                        user={user}
                        usersData={users}
                        signOut={signOut}/> :
            <button onClick={handleSignUp}>Sign In</button>
                    }
        </div>
    )
}
