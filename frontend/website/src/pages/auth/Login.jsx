import {useState} from 'react'
import {useAuth} from '../../context/AuthContext.jsx'
import {useNavigate} from 'react-router-dom'
import {auth} from '../../firebase.js'
import {GoogleAuthProvider, signInWithPopup} from 'firebase/auth'
import {TextHoverEffect} from '../../components/ui/text-hover-effect.jsx'

export default function Login() {
    const {login} = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleEmailLogin(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(email, password)
            navigate('/dashboard')
        } catch (error) {
            setError(error)
        }
        setLoading(false)
    }

    async function handleGoogleLogin() {
        setError('')
        setLoading(true)
        try {
            const provider = new GoogleAuthProvider()
            await signInWithPopup(auth, provider)
            navigate('/dashboard')
        } catch (error) {
            setError(error)
        }
        setLoading(false)
    }

    return (
        <div className="relative w-full min-h-screen bg-[#080808] flex items-center justify-center overflow-hidden">
            {/* BG With da Dots */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #06B6D4 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}
            />

            {/* SPOTTR bg text */}
            <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-15">
                <TextHoverEffect text="SPOTTR" duration={0.3} showStroke={true} strokeColor="white"/>
            </div>
        </div>
    )
}