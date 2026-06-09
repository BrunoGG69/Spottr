import {useEffect, useRef, useState} from 'react'
import {AnimatePresence, motion, useScroll, useTransform} from 'framer-motion'
import BadgeCanvas from '../../../components/3d/BadgeCanvas.jsx'
import {TextHoverEffect} from '../../../components/ui/text-hover-effect.jsx'

export default function Hero() {
    const ref = useRef(null)
    const [introComplete, setIntroComplete] = useState(false)

    const {scrollYProgress} = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    })

    const textY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
    const modelY = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])
    const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

    useEffect(() => {
        const timer = setTimeout(() => setIntroComplete(true), 3500)
        return () => clearTimeout(timer)
    }, [])

    return (
        <section ref={ref} className="relative w-full min-h-screen flex items-center bg-[#080808] overflow-hidden">

            {/* BG With da Dots */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #06B6D4 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}
            />

            {/*SPOTTR starting animation*/}
            <AnimatePresence>
                {!introComplete && (
                    <motion.div
                        className="absolute inset-0 z-50 bg-[#080808] flex items-center justify-center"
                        exit={{opacity: 0}}
                        transition={{duration: 0.8, ease: 'easeInOut'}}
                    >
                        <div className="w-full h-32 sm:h-48 lg:h-full flex items-center justify-center">
                            <TextHoverEffect text="SPOTTR" duration={0.3} showStroke={false}
                                             strokeColor="url(#textGradient)"/>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/*SPOTTR text behind za Hero Section*/}
            <motion.div
                className="absolute inset-0 z-0 pointer-events-none hidden lg:flex items-center"
                initial={{opacity: 0}}
                animate={{opacity: introComplete ? 0.15 : 0}}
                transition={{duration: 1}}
            >
                <TextHoverEffect text="SPOTTR" duration={0.3} showStroke={true} strokeColor="white"/>
            </motion.div>

            <div className="relative z-10 w-full flex flex-col lg:flex-row items-center">
                {/*Content on the left side of za page*/}
                <motion.div
                    className="relative z-10 w-full lg:w-1/2  px-6 sm:px-10 lg:px-32 pt-24 lg:pt-10 pb-8 lg:pb-0"
                    style={{y: textY, opacity}}
                    initial={{opacity: 0, y: 30}}
                    animate={introComplete ? {opacity: 1, y: 0} : {}}
                    transition={{duration: 0.8, delay: 0.2}}
                >
                    <div className="flex items-center gap-3 flex-wrap mb-4">
                        <div
                            className="inline-flex items-center gap-2 text-xs text-cyan-400 tracking-widest uppercase border border-cyan-500/30 rounded-full px-4 py-1.5 bg-cyan-500/5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"/>
                            100% Open Source
                        </div>

                        <div
                            className="inline-flex items-center gap-2 text-xs text-amber-400 tracking-widest uppercase border border-amber-500/30 rounded-full px-4 py-1.5 bg-amber-500/5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"/>
                            ESP32-C3
                        </div>

                        <div
                            className="inline-flex items-center gap-2 text-xs text-purple-400 tracking-widest uppercase border border-purple-500/30 rounded-full px-4 py-1.5 bg-purple-500/5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"/>
                            BLE
                        </div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                        No Cameras.<br/>
                        No Check-ins.<br/>
                        <span className="text-cyan-400 block">Just Spottr.</span>
                    </h1>

                    <p className="text-gray-400 mt-3 text-base lg:text-lg leading-relaxed max-w-md">
                        Spottr is an open-source indoor presence tracking system built on ESP32-C3 and Bluetooth Low
                        Energy.
                        Wear a badge, walk into a room, show up on the map
                    </p>

                    <div className="flex items-center gap-4 mt-6">
                        <motion.div
                            whileHover={{scale: 1.03}}
                            whileTap={{scale: 0.97}}
                            className="px-6 py-3 bg-cyan-500 text-black font-semibold rounded hover:bg-cyan-400 transition-colors text-sm lg:text-base">
                            Get Started
                        </motion.div>
                        <motion.a
                            whileHover={{scale: 1.03}}
                            whileTap={{scale: 0.97}}
                            href="https://github.com/BrunoGG69/Spottr"
                            className="px-6 py-3 border border-white/20 text-white rounded hover:border-white/50 transition-colors text-sm lg:text-base"
                        >
                            View on GitHub
                        </motion.a>
                    </div>
                    <div
                        className="flex items-center gap-6 lg:gap-10 mt-8 pt-6 border-t border-white/10">                    {[
                        {value: '9mo', label: 'Battery life'},
                        {value: '<$50', label: 'To build'},
                        {value: '100%', label: 'Open source'},
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{opacity: 0, y: 20}}
                            animate={introComplete ? {opacity: 1, y: 0} : {}}
                            transition={{delay: 0.5 + i * 0.1, duration: 0.6}}
                        >
                            <p className="text-2xl font-bold text-white font-mono">{stat.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                        </motion.div>
                    ))}
                    </div>
                </motion.div>

                {/* 3D Model of Spottr */}
                <motion.div
                    className="w-full lg:w-1/2 h-96 sm:h-screen lg:h-screen relative z-10"
                    style={{y: modelY}}
                    initial={{opacity: 0, x: 60}}
                    animate={introComplete ? {opacity: 1, x: 0} : {}}
                    transition={{duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1]}}
                >
                    <BadgeCanvas/>
                </motion.div>
            </div>

        </section>
    )
}