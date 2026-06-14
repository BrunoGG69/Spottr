import {useState} from 'react'
import {useAuth} from '../../context/AuthContext.jsx'
import {Link, useNavigate} from 'react-router-dom'
import {auth} from '../../firebase.js'
import {GoogleAuthProvider, signInWithPopup} from 'firebase/auth'

const TEST_EMAIL = 'testspottr@spottr.brunogg.in'
const TEST_PASS = 'spottr'

function StickyNote() {
    const [copiedEmail, setCopiedEmail] = useState(false)
    const [copiedPass, setCopiedPass] = useState(false)

    function copy(text, setter) {
        navigator.clipboard.writeText(text)
        setter(true)
        setTimeout(() => setter(false), 1500)
    }

    return (
        <div
            className="absolute -top-16 right-0 sm:-top-10 sm:-right-42 z-20 w-56 sm:w-64 bg-amber-400/95 rounded-lg p-4 shadow-xl -rotate-3 sm:-rotate-6"
        >
            <p className="text-amber-900 text-[11px] sm:text-[15px] font-bold tracking-wider uppercase mb-3">
                Test Account
            </p>
            <div
                onClick={() => copy(TEST_EMAIL, setCopiedEmail)}
                className="cursor-pointer group mb-2"
            >
                <p className="text-[10px] sm:text-[14px] text-amber-800 uppercase tracking-wider mb-0.5">Email</p>
                <p className="text-amber-950 text-[11px] sm:text-[14px] font-bold break-all leading-snug group-hover:text-amber-700 transition-colors">
                    {copiedEmail ? '✓ Copied!' : TEST_EMAIL}
                </p>
            </div>
            <div
                onClick={() => copy(TEST_PASS, setCopiedPass)}
                className="cursor-pointer group mt-2"
            >
                <p className="text-[10px] sm:text-[14px] text-amber-800 uppercase tracking-wider mb-0.5">Password</p>
                <p className="text-amber-950 text-[11px] sm:text-[14px] font-bold group-hover:text-amber-700 transition-colors">
                    {copiedPass ? '✓ Copied!' : TEST_PASS}
                </p>
            </div>
        </div>
    )
}

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
            setError(error.message || 'Login failed. Please try again.')
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
            setError(error.message || 'Google login failed.')
        }
        setLoading(false)
    }

    return (
        <div className="relative w-full min-h-screen bg-[#080808] flex items-center justify-center overflow-hidden">

            {/*Dot Background*/}
            <div className="absolute inset-0 opacity-[0.18] pointer-events-none"
                 style={{
                     backgroundImage: 'radial-gradient(circle, #06B6D4 1px, transparent 1px)',
                     backgroundSize: '28px 28px'
                 }}
            />

            {/* Cyan glow top-left */}
            <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full pointer-events-none"
                 style={{background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)'}}
            />

            {/* Purple glow bottom-right */}
            <div className="absolute -bottom-24 -right-20 w-[350px] h-[350px] rounded-full pointer-events-none"
                 style={{background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)'}}
            />

            <div className="relative z-10 w-[380px] mx-4">
                <StickyNote/>
                {/* Card */}
                <div
                    className="relative z-10 w-[380px] mx-4 bg-white/[0.05] border border-white/[0.08] rounded-[20px] px-8 py-9 backdrop-blur-md">

                    {/* Logo */}
                    <div className="flex flex-col items-center gap-2 mb-8">
                        <img src="/SPOTTR_LOGO.svg" alt="Spottr" className="h-12 w-auto"/>
                    </div>

                    <div className="h-px bg-white/[0.06] mb-6"/>

                    {error && (
                        <div
                            className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text.xs">
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div className="relative mb-2.5">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 w-4 h-4" fill="none"
                             stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-[11px] bg-white/[0.04] border border-white/[0.08] rounded-[10px] text-white text-[13px] placeholder-white/25 focus:outline-none focus:border-cyan-500/40 transition-colors"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative mb-2">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 w-4 h-4" fill="none"
                             stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-[11px] bg-white/[0.04] border border-white/[0.08] rounded-[10px] text-white text-[13px] placeholder-white/25 focus:outline-none focus:border-cyan-500/40 transition-colors"
                        />
                    </div>

                    <button
                        onClick={handleEmailLogin}
                        disabled={loading}
                        className="w-full mt-2 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[13px] tracking-wider rounded-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>


                    <div className="flex items-center gap-2.5 my-4">
                        <div className="flex-1 h-px bg-white/[0.07]"/>
                        <span className="text-white/25 text-[11px]">or</span>
                        <div className="flex-1 h-px bg-white/[0.07]"/>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full py-[11px] border border-white/10 hover:border-white/20 hover:bg-white/[0.03] text-white/70 text-[13px] rounded-[10px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24">
                            <path fill="#4285F4"
                                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853"
                                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05"
                                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335"
                                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    </button>
                    <div className="flex items-center justify-center mt-5">
                        <Link
                            to="/"
                            className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-[12px] transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2"
                                 viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                            Back to home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}