import {useState, useRef, useEffect} from 'react'
import {motion, AnimatePresence} from 'framer-motion'

const navLinks = [
    {"name": "Home", "href": "#home"},
    {"name": "How it Works", "href": "#how"},
    {"name": "Hardware", "href": "#hardware"},
    {"name": "Software", "href": "#software"}
]

export default function Navbar({visible}) {
    const [hovered, setHovered] = useState(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div ref={menuRef}>
            <motion.nav
                className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%]"
                initial={{opacity: 0, y: -20}}
                animate={visible ? {opacity: 1, y: 0} : {}}
                transition={{duration: 0.6, ease: "easeOut"}}
            >
                <div
                    className="relative flex items-center justify-between bg-[#0d0d0d]/90 backdrop-blur-md border border-white/10 rounded-full px-6 py-3">

                    {/*Logo - Desktop*/}
                    <a href="#home"
                       className="flex items-center gap-2 md:relative absolute left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0">
                        <img src="/SPOTTR.svg" alt="SPOTTR LOGO" className="h-7 w-7"/>
                        <span className="text-white font-bold font-[SavedByZero] tracking-widest text-sm">SPOTTR</span>
                    </a>

                    <div className="flex-1 flex justify-start">
                        <motion.button
                            className="md:hidden flex items-center justify-center w-8 h-8 p-1"
                            onClick={() => setMenuOpen(!menuOpen)}
                            whileTap={{scale: 0.9}}
                        >
                            {menuOpen ? (
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <line x1="1" y1="1" x2="17" y2="17" stroke="white" strokeWidth="2"
                                          strokeLinecap="round"/>
                                    <line x1="17" y1="1" x2="1" y2="17" stroke="white" strokeWidth="2"
                                          strokeLinecap="round"/>
                                </svg>
                            ) : (
                                <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
                                    <line x1="0" y1="1" x2="18" y2="1" stroke="white" strokeWidth="2"
                                          strokeLinecap="round"/>
                                    <line x1="0" y1="8" x2="18" y2="8" stroke="white" strokeWidth="2"
                                          strokeLinecap="round"/>
                                    <line x1="0" y1="15" x2="18" y2="15" stroke="white" strokeWidth="2"
                                          strokeLinecap="round"/>
                                </svg>
                            )}
                        </motion.button>
                        <div className="hidden md:block w-5"/>
                    </div>


                    {/*Links at the center - desktop*/}
                    <div
                        className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2"
                        onMouseLeave={() => setHovered(null)}
                    >
                        {navLinks.map((link, i) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onMouseEnter={() => setHovered(i)}
                                className="relative px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                            >
                                {hovered === i && (
                                    <motion.span
                                        layoutId="nav-hover"
                                        className="absolute inset-0 bg-white/10 rounded-full"
                                        transition={{
                                            type: 'spring',
                                            stiffness: 200,
                                            damping: 30,
                                        }}
                                    />
                                )}
                                <span className="relative z-10">{link.name}</span>
                            </a>
                        ))}
                    </div>

                    {/*Login Button*/}
                    <div className="flex-1 flex justify-end">
                        <motion.a
                            whileHover={{scale: 1.04, y: -2}}
                            whileTap={{
                                scale: 0.96,
                                stiffness: 300,
                                damping: 15,
                                mass: 0.7,
                            }}
                            href="/login"
                            className="px-5 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-cyan-400 transition-colors"
                        >
                            Login
                        </motion.a>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile dropdown menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-5xl"
                        initial={{opacity: 0, y: -10, scale: 0.98}}
                        animate={{opacity: 1, y: 0, scale: 1}}
                        exit={{opacity: 0, y: -10, scale: 0.98}}
                        transition={{duration: 0.2}}
                    >
                        <div
                            className="bg-[#0d0d0d]/95 backdrop-blur-md border border-white/10 rounded-4xl p-4 flex flex-col gap-1">
                            {navLinks.map((link, i) => (
                                <motion.a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                    initial={{opacity: 0, x: -10}}
                                    animate={{opacity: 1, x: 0}}
                                    transition={{delay: i * 0.05}}
                                >
                                    {link.name}
                                </motion.a>
                            ))}
                            <div className="border-t border-white/10 mt-2 pt-2">

                                <a href="https://github.com/BrunoGG69/Spottr"
                                   className="block px-4 py-3 text-sm text-cyan-400 hover:bg-white/5 rounded-xl
                                transition-colors"
                                   onClick={() => setMenuOpen(false)}
                                >
                                    View on GitHub →
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}