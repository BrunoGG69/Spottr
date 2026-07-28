import {useEffect, useRef} from 'react'
import {motion, useSpring, useTransform} from 'framer-motion'

export default function AnimatedNumber({value, className, style}) {
    const spring = useSpring(value, {stiffness: 180, damping: 24})
    const display = useTransform(spring, v => Math.round(v))
    const mounted = useRef(false)

    useEffect(() => {
        if (!mounted.current) {
            spring.jump(value)
            mounted.current = true
            return
        }
        spring.set(value)
    }, [value, spring])

    return <motion.span className={className} style={style}>{display}</motion.span>
}