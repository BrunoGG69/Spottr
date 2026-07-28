import {useState, useEffect} from 'react'
import {Outlet, useLocation} from 'react-router-dom'
import Sidebar from '../../components/dashboard/Sidebar.jsx'

const NAV_ITEMS = [
    {
        to: '/dashboard', label: 'Overview', end: true,
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <circle cx="7" cy="7" r="2" fill="currentColor" stroke="none"/>
                <circle cx="17" cy="7" r="2" fill="currentColor" stroke="none"/>
                <circle cx="7" cy="17" r="2" fill="currentColor" stroke="none"/>
                <circle cx="17" cy="17" r="2" fill="currentColor" stroke="none"/>
            </svg>
        )
    },
    {
        to: '/dashboard/map', label: 'Floor Map', end: false,
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M9 20l-5-2V4l5 2m0 14l6-2m-6 2V6m6 12l5 2V6l-5-2m0 14V4M9 6l6-2"/>
            </svg>
        )
    },
    {
        to: '/dashboard/badges', label: 'Badges', end: false,
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M7 7h.01M7 3h5a2 2 0 011.4.6l7 7a2 2 0 010 2.8l-5 5a2 2 0 01-2.8 0l-7-7A2 2 0 015 10V5a2 2 0 012-2z"/>
            </svg>
        )
    },
    {
        to: '/dashboard/scanners', label: 'Scanners', end: false,
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M8.7 15.3a4.5 4.5 0 016.6 0M5.9 12.4a8.5 8.5 0 0112.2 0M3 9.5a12.5 12.5 0 0118 0M12 19h.01"/>
            </svg>
        )
    },
    {
        to: '/dashboard/logs', label: 'Logs', end: false,
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10"/>
            </svg>
        )
    },
]

export default function DashboardLayout() {
    const location = useLocation()
    const [menuOpen, setMenuOpen] = useState(false)

    const currentPage = NAV_ITEMS.find(item =>
        item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    )

    useEffect(() => {
        if (!menuOpen) return
        const onKey = e => e.key === 'Escape' && setMenuOpen(false)
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [menuOpen])

    return (
        <div className="min-h-screen bg-bg text-scaled">
            <Sidebar
                items={NAV_ITEMS}
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
            />

            <div>
                <header
                    className="sticky top-0 z-20 flex h-16 items-center gap-3 bg-bg/80 px-4 backdrop-blur-md sm:px-6">
                    <button
                        onClick={() => setMenuOpen(true)}
                        className="-ml-2 rounded-lg p-2 text-text-2 transition-colors hover:text-text"
                        aria-label="Open menu"
                    >
                        <svg viewBox="0 0 24 24" strokeLinecap="round" strokeWidth="1.8"
                             fill="none" stroke="currentColor" className="h-5 w-5">
                            <path d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>

                    <h1 className="text-xl font-medium tracking-tight text-text sm:text-2xl">
                        {currentPage?.label || 'Dashboard'}
                    </h1>
                </header>

                <main className="px-4 pb-4 sm:px-6 sm:pb-6">
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}