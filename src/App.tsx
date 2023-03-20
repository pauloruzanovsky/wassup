import { fireStore, auth, provider } from './components/firebase';
import {signInWithPopup} from 'firebase/auth'
import Chat from './components/Chat';
import {collection, setDoc, doc} from 'firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import  { useEffect } from 'react';
import './style/App.css'



export default function App() {
    
    const usersCollection = collection(fireStore,'users')
    const [usersData, isLoading] = useCollectionData(usersCollection);
    const user = auth.currentUser;

    const registerUser = () => {
        if(user) {
            const exists = usersData?.find(userdata => userdata.email === user?.email)
            if(!exists) {
                setDoc(doc(fireStore,'users', user.uid), 
                    JSON.parse(JSON.stringify(user)))
                
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

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if(user) {
                registerUser()
            }
        })
        return unsubscribe;
    },[isLoading])

    return (
        <div className='login-page'>
            {user ? <Chat
                        user={user}
                        usersData={usersData}
                        signOut={signOut}/> :
            <button onClick={handleSignUp}>Sign In</button>
                    }
        </div>
    )
}
