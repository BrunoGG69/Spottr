import {Route, Routes} from 'react-router-dom'
import Landing from '../pages/landing/Landing'
import Login from '../pages/auth/Login.jsx'
import DashboardLayout from '../pages/dashboard/DashboardLayout.jsx'
import Dashboard from '../pages/dashboard/Dashboard.jsx'
import FloorMapPage from '../pages/dashboard/FloorMapPage.jsx'
import Badges from '../pages/dashboard/Badges.jsx'
import Scanners from '../pages/dashboard/Scanners.jsx'
import Logs from '../pages/dashboard/Logs.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Landing/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <DashboardLayout/>
                </ProtectedRoute>
            }>
                <Route index element={<Dashboard/>}/>
                <Route path="map" element={<FloorMapPage/>}/>
                <Route path="badges" element={<Badges/>}/>
                <Route path="scanners" element={<Scanners/>}/>
                <Route path="logs" element={<Logs/>}/>
            </Route>
        </Routes>
    )
}