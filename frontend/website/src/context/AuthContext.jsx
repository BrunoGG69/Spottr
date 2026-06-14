import {createContext, useContext, useEffect, useState} from 'react'
import {auth} from "../firebase.js"
import {onAuthStateChange, signInWithEmailAndPassword, signOut} from "firebase/auth"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsub = onAuthStateChange(auth, (user) => {
            setUser(user)
            setLoading(false)
        })
        return () => unsub()
    }, [])

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password)
    }

    const logout = () => {
        return signOut(auth)
    }

    return(
        <AuthContext.Provider value={{user, loading, login, logout}}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}