import { fireStore, auth, provider } from './components/firebase';
import {signInWithPopup} from 'firebase/auth'
import Chat from './components/Chat';
import {collection, setDoc, doc, query, orderBy} from 'firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import  { useEffect, useState } from 'react';
import './style/App.css'



export default function App() {
    
    const usersCollection = collection(fireStore,'users')
    const usersQuery = query(usersCollection, orderBy('displayName'));
    const [usersData, isLoading] = useCollectionData(query(usersCollection, orderBy('displayName')));
    const user = auth.currentUser;
    const [loggedUser, setLoggedUser] = useState(user)

    console.log(usersData);
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
        setLoggedUser(null)
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if(user) {
                registerUser()
                setLoggedUser(user)
            }
        })
        return unsubscribe;
    },[isLoading])

    return (
        <div>
            {loggedUser ? <Chat
                        user={user}
                        usersData={usersData}
                        signOut={signOut}/> :
                        <div className='login-page'>
                            <div>
                                Wassup, a minimalistic chat app.
                            </div>
                            <button onClick={handleSignUp}>Sign in with Google</button>

                        </div>
                    }
        </div>
    )
}
