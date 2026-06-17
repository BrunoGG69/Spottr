import {NavLink, Outlet, useLocation} from 'react-router-dom'
import {useAuth} from '../../context/AuthContext.jsx'

const navItems = [
    {
        name: 'Overview', path: '/dashboard', tip: 'Overview', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round"
                 strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>)
    },
    {
        name: 'Floor Map', path: '/dashboard/map', tip: 'Floor Map', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round"
                 strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4">
                <path
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-13v13m6-13l5.447-2.724A1 1 0 0121 5.618v10.764a1 1 0 01-.553.894L15 20m0-13v13"/>
            </svg>
        )
    },
    {
        name: 'Badges', path: '/dashboard/badges', tip: 'Badges', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round"
                 strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4">
                <path
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 015 10V5a2 2 0 012-2z"/>
            </svg>
        )
    },
    {
        name: 'Scanners', path: '/dashboard/scanners', tip: 'Scanners', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round"
                 strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4">
                <path d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01M4.929 12.93a10 10 0 0114.142 0"/>
            </svg>
        )
    },
    {
        name: 'Logs', path: '/dashboard/logs', tip: 'Logs', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round"
                 strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
            </svg>
        )
    }
]

export default function DashboardLayout() {
    const {logout} = useAuth()
    const location = useLocation()

    const currentPage = navItems.find(item =>
        item.path === '/dashboard'
            ? location.pathname === '/dashboard'
            : location.pathname.startsWith(item.path)
    )

    return (
        <div className="drawer lg:drawer-open bg-[#080808] min-h-screen">
            <input id="dashboard-drawer" type="checkbox" className="drawer-toggle"/>
            <div className="drawer-content">
                <nav className="navbar w-full bg-[#0d0d0d] border-b border-white/10">
                    <label htmlFor="dashboard-drawer" aria-label="open sidebar" className="btn btn-ghost text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round"
                             strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"
                             className="my-1.5 inline-block size-4">
                            <path
                                d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                            <path d="M9 4v16"></path>
                            <path d="M14 10l2 2l-2 2"></path>
                        </svg>
                    </label>
                    <div className="px-4 text-white font-semibold">
                        {currentPage?.name || 'Dashboard'}
                    </div>
                </nav>

                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                    <Outlet/>
                </div>
            </div>

            <div className="drawer-side is-drawer-close:overflow-visible">
                <label htmlFor="dashboard-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                <div
                    className="flex min-h-full flex-col items-start bg-[#0d0d0d] border-r border-white/10 is-drawer-close:w-14 is-drawer-open:w-64">

                    <div className="flex items-center gap-2 px-4 py-5 w-full">
                        <img src="/SPOTTR_LOGO_ONLY.svg" alt="Spottr" className="h-7 w-7 shrink-0"/>
                        <span
                            className="text-white font-bold font-[SavedByZero] tracking-widest text-sm is-drawer-close:hidden">SPOTTR</span>
                    </div>

                    <ul className="menu w-full grow">
                        {navItems.map(item => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    end={item.path === '/dashboard'}
                                    className={({isActive}) =>
                                        `is-drawer-close:tooltip is-drawer-close:tooltip-right ${
                                            isActive ? 'active text-cyan-400' : 'text-gray-400'
                                        }`
                                    }
                                    data-tip={item.tip}
                                >
                                    {item.icon}
                                    <span className="is-drawer-close:hidden">{item.name}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    <ul className="menu w-full">
                        <li>
                            <button
                                onClick={logout}
                                className="is-drawer-close:tooltip is-drawer-close:tooltip-right text-gray-400 hover:text-red-400"
                                data-tip="Logout"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round"
                                     strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"
                                     className="my-1.5 inline-block size-4">
                                    <path
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                </svg>
                                <span className="is-drawer-close:hidden">Log out</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )

}