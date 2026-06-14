import {Route, Routes} from 'react-router-dom'
import Landing from '../pages/landing/Landing'
import Login from '../pages/auth/Login.jsx'
import Dashboard from '../pages/dashboard/Dashboard.jsx'
import ProtectedRoute from '/ProtectedRoute.jsx'

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Landing/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard/>
                </ProtectedRoute>
            }/>
        </Routes>
    )
}