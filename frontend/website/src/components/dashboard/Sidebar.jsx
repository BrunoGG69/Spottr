import {NavLink} from 'react-router-dom'
import {motion, AnimatePresence} from 'framer-motion'
import {signOut} from 'firebase/auth'
import {auth} from '@/firebase.js'

export default function Sidebar({items, open, onClose}) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/60"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.18}}
                        onClick={onClose}
                    />
                    <motion.aside
                        className="fixed left-3 top-3 bottom-3 z-50 flex w-64 flex-col overflow-hidden
                                   rounded-3xl border border-line bg-surface-1"
                        initial={{x: -300, opacity: 0}}
                        animate={{x: 0, opacity: 1}}
                        exit={{x: -300, opacity: 0}}
                        transition={{type: 'spring', stiffness: 420, damping: 38}}
                        style={{boxShadow: '0 16px 48px -12px rgba(0,0,0,0.7)'}}
                    >
                        <SidebarBody items={items} onNavigate={onClose}/>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    )
}

function SidebarBody({items, onNavigate}) {
    return (
        <>
            <div className="flex h-20 shrink-0 items-center">
                <span className="ml-2.5 grid h-12 w-12 shrink-0 place-items-center">
                    <img src="/SPOTTR_LOGO_ONLY.svg" alt="Spottr" className="h-7 w-7"/>
                </span>
                <span className="font-[SavedByZero] text-sm font-bold tracking-widest text-text">
                    SPOTTR
                </span>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto py-2">
                {items.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={onNavigate}
                        className={({isActive}) =>
                            `relative mx-2.5 flex h-12 items-center rounded-xl transition-colors ${
                                isActive ? 'text-brand' : 'text-text-3 hover:text-text'
                            }`
                        }
                    >
                        {({isActive}) => (
                            <>
                                {isActive && (
                                    <motion.span
                                        layoutId="nav-active"
                                        className="absolute inset-0 rounded-xl bg-brand/10"
                                        transition={{type: 'spring', stiffness: 400, damping: 34}}
                                    />
                                )}
                                <span className="relative z-10 grid h-12 w-12 shrink-0 place-items-center">
                                    {item.icon}
                                </span>
                                <span className="relative z-10 whitespace-nowrap pr-4 text-sm">
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="shrink-0 border-t border-line py-2">
                <button
                    onClick={() => signOut(auth)}
                    className="mx-2.5 flex h-12 items-center rounded-xl text-text-3 transition-colors hover:text-bad"
                >
                    <span className="grid h-12 w-12 shrink-0 place-items-center">
                        <svg viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.8"
                             fill="none" stroke="currentColor" className="h-5 w-5">
                            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                    </span>
                    <span className="whitespace-nowrap pr-4 text-sm">Log out</span>
                </button>
            </div>
        </>
    )
}