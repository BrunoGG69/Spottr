import {useState} from 'react'
import {useAuth} from '../../context/AuthContext.jsx'
import {Link, useNavigate} from 'react-router-dom'
import {auth} from '@/firebase.js'
import {GoogleAuthProvider, signInWithPopup} from 'firebase/auth'
import {motion} from 'framer-motion'

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
        <motion.div
            initial={{opacity: 0, y: -12, rotate: -8}}
            animate={{opacity: 1, y: 0, rotate: -5}}
            transition={{delay: 0.35, type: 'spring', stiffness: 260, damping: 22}}
            className="absolute -top-14 right-2 z-20 w-52 rounded-xl bg-[#f0a01e] p-4 sm:-top-8 sm:-right-40 sm:w-56"
            style={{boxShadow: '0 12px 32px -8px rgba(0,0,0,0.6)'}}
        >
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black/60">
                Test account
            </p>

            <button
                onClick={() => copy(TEST_EMAIL, setCopiedEmail)}
                className="group mt-3 block w-full text-left"
            >
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-black/50">Email</p>
                <p className="mt-0.5 break-all text-xs font-semibold leading-snug text-black transition-opacity group-hover:opacity-70">
                    {copiedEmail ? '✓ Copied' : TEST_EMAIL}
                </p>
            </button>

            <button
                onClick={() => copy(TEST_PASS, setCopiedPass)}
                className="group mt-3 block w-full text-left"
            >
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-black/50">Password</p>
                <p className="mt-0.5 text-xs font-semibold text-black transition-opacity group-hover:opacity-70">
                    {copiedPass ? '✓ Copied' : TEST_PASS}
                </p>
            </button>
        </motion.div>
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
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.')
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
        } catch (err) {
            setError(err.message || 'Google login failed.')
        }
        setLoading(false)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-bg px-4">
            <motion.div
                initial={{opacity: 0, y: 12}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.35, ease: 'easeOut'}}
                className="relative w-full max-w-sm"
            >
                <StickyNote/>

                <div className="relative z-10 rounded-3xl border border-line bg-surface-1 px-7 py-8"
                     style={{boxShadow: '0 24px 64px -16px rgba(0,0,0,0.8)'}}>

                    <div className="flex flex-col items-center">
                        <img src="/SPOTTR_LOGO.svg" alt="Spottr" className="h-10 w-auto"/>
                        <p className="label-mono mt-4">Sign in to continue</p>
                    </div>

                    <form onSubmit={handleEmailLogin} className="mt-8">
                        {error && (
                            <div className="mb-4 rounded-lg border border-bad/20 bg-bad/10 px-3 py-2.5">
                                <p className="text-sm leading-snug" style={{color: 'var(--color-bad)'}}>
                                    {error}
                                </p>
                            </div>
                        )}

                        <label className="label-mono block">Email</label>
                        <div className="relative mt-2">
                            <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3"
                                 fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            <input
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full rounded-xl border border-line bg-bg py-3 pl-10 pr-4 text-base
                                           text-text placeholder:text-text-3 transition-colors
                                           focus:border-brand/50 focus:outline-none"
                            />
                        </div>

                        <label className="label-mono mt-5 block">Password</label>
                        <div className="relative mt-2">
                            <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3"
                                 fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                            <input
                                type="password"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full rounded-xl border border-line bg-bg py-3 pl-10 pr-4 text-base
                                           text-text placeholder:text-text-3 transition-colors
                                           focus:border-brand/50 focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-6 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-black
                                       transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>

                    <div className="my-5 flex items-center gap-3">
                        <div className="h-px flex-1 bg-line"/>
                        <span className="label-mono">or</span>
                        <div className="h-px flex-1 bg-line"/>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-line
                                   py-3 text-sm text-text-2 transition-colors hover:border-line-strong hover:text-text
                                   disabled:opacity-40"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24">
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

                    <div className="mt-6 flex justify-center">
                        <Link
                            to="/"
                            className="flex items-center gap-1.5 text-sm text-text-3 transition-colors hover:text-text-2"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8"
                                 viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                            Back to home
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}