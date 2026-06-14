import {Route, Routes, useLocation} from 'react-router-dom'
import {AnimatePresence, motion} from "framer-motion";
import Landing from '../pages/landing/Landing'
import Login from '../pages/auth/Login.jsx'
import Dashboard from '../pages/dashboard/Dashboard.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

const PageWrapper = ({children}) => (
    <motion.div
        initial={{opacity: 0, y: 16}}
        animate={{opacity: 1, y: 0}}
        exit={{opacity: 0, y: -16}}
        transition={{duration: 0.4, ease: 'easeInOut'}}
    >
        {children}
    </motion.div>

)

export default function AppRouter() {
    const location = useLocation()
    return (
        <AnimatePresence>
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageWrapper><Landing/></PageWrapper>}/>
                <Route path="/login" element={<PageWrapper><Login/></PageWrapper>}/>
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <PageWrapper><Dashboard/></PageWrapper>
                    </ProtectedRoute>
                }/>
            </Routes>
        </AnimatePresence>
    )
}