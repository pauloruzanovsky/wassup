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
    const user = auth.currentUser;
    const [users, setUsers] = useState<any[]>([])


    const registerUser = () => {
        if(user) {
            const exists = usersData?.find(userdata => userdata.email === user?.email)
            if(!exists) {
                setDoc(doc(fireStore,'users', user.uid), 
                    {
                        uid: user.uid,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        email: user.email,
                        }
                )
                console.log('user logged.')
            }
        }
   }

    const handleSignUp = () => {
        signInWithPopup(auth, provider)
    }

    const signOut = () => {
        auth.signOut()
    }

    // useEffect(() => {
    //     const unsubscribe = auth.onAuthStateChanged((user) => {
    //         if(user) {
    //             registerUser()
    //         }
    //     })
    //     return unsubscribe;
    // },[])

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
