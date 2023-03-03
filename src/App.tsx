import React, {useState, useEffect} from 'react';
import { auth, provider } from './components/firebase';
import {signInWithPopup} from 'firebase/auth'
import {useAuthState} from 'react-firebase-hooks/auth'
import Chat from './components/Chat';

export default function App() {

    const [user] = useAuthState(auth);
    const handleSignUp = () => {
        signInWithPopup(auth, provider)
    }

    const signOut = () => {
        auth.signOut()
    }

    return (
        <div>
            {user ? <Chat
                        user={user}
                        signOut={signOut}/> :
            <button onClick={handleSignUp}>Sign In</button>
                    }
        </div>
    )
}
