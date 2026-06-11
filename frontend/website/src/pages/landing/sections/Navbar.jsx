import {useState} from 'react'
import {motion} from 'framer-motion'

const navLinks = [
    {"name": "Home", "href": "#home"},
    {"name": "How it Works", "href": "#how"},
    {"name": "Hardware", "href": "#hardware"},
    {"name": "Software", "href": "#software"}
]

export default function Navbar({visible}) {
    const [hovered, setHovered] = useState(null)
    return (
        <motion.nav
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[95%]"
            initial={{opacity: 0, y: -20}}
            animate={visible ? {opacity: 1, y: 0} : {}}
            transition={{duration: 0.6, ease: "easeOut"}}
        >
            <div
                className="flex items-center justify-between bg-[#0d0d0d]/90 backdrop-blur-md border border-white/10 rounded-full px-6 py-3">
                {/*Logo*/}
                <a href="#home" className="flex items-center gap-2">
                    <img src="/SPOTTR.svg" alt="SPOTTR LOGO" className="h-7 w-7"/>
                    <span className="text-white font-bold font-[SavedByZero] tracking-widest text-sm">SPOTTR</span>
                </a>
                {/*Links at the center*/}
                <div
                    className="hidden md:flex items-center gap-1"
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
        </motion.nav>
    )
}