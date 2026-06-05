import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from '../pages/landing/Landing'
import Login from '../pages/Login.jsx'

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </BrowserRouter>
    )
}