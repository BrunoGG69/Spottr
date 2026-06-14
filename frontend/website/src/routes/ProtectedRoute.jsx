import {Navigate} from 'react-router-dom'
import {useAuth} from '../context/AuthContext.jsx'

export default function ProtectedRoute() {
    const {user} = useAuth()
    return user ? children : <Navigate to="/login" replace/>
}