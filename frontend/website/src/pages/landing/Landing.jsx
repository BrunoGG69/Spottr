import {useEffect} from 'react'
import Hero from './sections/Hero.jsx'
// import HowItWorks from './sections/HowItWorks.jsx'

export default function Landing() {
    useEffect(() => {
        const id = requestAnimationFrame(() => {
            import('../auth/Login.jsx')
        })
        return () => cancelIdleCallback(id)
    }, [])
    return (
        <main className = "bg-[#080808]">
            <Hero />
            {/*<HowItWorks/>*/}
        </main>
    )
}