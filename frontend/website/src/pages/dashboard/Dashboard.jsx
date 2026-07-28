import {useEffect, useState} from 'react'
import {ref, onValue} from 'firebase/database'
import {db} from '@/firebase.js'
import FloorMap, {getTotalRooms, scannerToRoomName} from '../../components/dashboard/FloorMap.jsx'
import StatCard from '../../components/dashboard/StatCard.jsx'
import BadgeRail from '../../components/dashboard/BadgeRail.jsx'
import {isBadgeOnline, isScannerOnline} from '@/lib/status.js'
import {macToLocationKey} from '@/lib/badges.js'
import {motion, AnimatePresence} from 'framer-motion'

export default function Dashboard() {
    const [registry, setRegistry] = useState({})
    const [badgeLocations, setBadgeLocations] = useState({})
    const [scannerStatus, setScannerStatus] = useState({})
    const [, setTick] = useState(0)

    useEffect(() => {
        const unsubRegistry = onValue(ref(db, 'badges'), s => setRegistry(s.val() || {}))
        const unsubBadges = onValue(ref(db, 'badge_location'), s => setBadgeLocations(s.val() || {}))
        const unsubScanners = onValue(ref(db, 'scanner_status'), s => setScannerStatus(s.val() || {}))
        return () => {
            unsubRegistry()
            unsubBadges()
            unsubScanners()
        }
    }, [])

    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 10000)
        return () => clearInterval(id)
    }, [])

    const liveBadges = Object.entries(registry)
        .map(([mac, badge]) => ({mac, ...badge, ...(badgeLocations[macToLocationKey(mac)] || {})}))
        .filter(b => b.active && isBadgeOnline(b))

    const scanners = Object.values(scannerStatus)
    const onlineScanners = scanners.filter(isScannerOnline).length
    const totalScanners = scanners.length
    const totalBadges = Object.keys(registry).length
    const totalRooms = getTotalRooms()

    const occupiedRooms = [...new Set(liveBadges.map(b => b.room).filter(Boolean))]

    return (
        <div className="flex flex-col gap-3 xl:h-[calc(100vh-7rem)] xl:flex-row">

            <aside className="flex shrink-0 flex-col gap-3 xl:w-56">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-1">
                    <StatCard
                        label="Badges online"
                        value={liveBadges.length}
                        sublabel={`of ${totalBadges} registered`}
                        status={liveBadges.length > 0 ? 'ok' : totalBadges > 0 ? 'warn' : undefined}
                    />
                    <StatCard
                        label="Scanners online"
                        value={onlineScanners}
                        sublabel={`${totalScanners - onlineScanners} offline`}
                        status={totalScanners === 0 ? undefined : onlineScanners === totalScanners ? 'ok' : 'bad'}
                    />
                    <StatCard
                        label="Rooms occupied"
                        value={occupiedRooms.length}
                        sublabel={`of ${totalRooms} mapped`}
                        status={occupiedRooms.length > 0 ? 'ok' : undefined}
                    />
                    <StatCard
                        label="Total badges"
                        value={totalBadges}
                        sublabel="registered"
                    />
                </div>

                <div className="rounded-xl bg-surface-1 px-4 py-3 xl:min-h-0 xl:flex-1">
                    <p className="label-mono">Occupied now</p>
                    <div className="mt-3 space-y-2 overflow-y-auto">
                        {occupiedRooms.length === 0 && (
                            <p className="text-sm text-text-3">No rooms occupied</p>
                        )}

                        <AnimatePresence initial={false}>
                            {occupiedRooms.map(room => (
                                <motion.div
                                    key={room}
                                    layout
                                    initial={{opacity: 0, x: -8}}
                                    animate={{opacity: 1, x: 0}}
                                    exit={{opacity: 0, x: -8}}
                                    transition={{duration: 0.2}}
                                    className="flex items-center justify-between gap-2"
                                >
                    <span className="truncate text-sm text-text-2">
                        {scannerToRoomName(room)}
                    </span>
                                    <span className="shrink-0 text-sm tabular-nums text-brand">
                        {liveBadges.filter(b => b.room === room).length}
                    </span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </aside>

            <FloorMap
                registry={registry}
                badgeLocations={badgeLocations}
                scannerStatus={scannerStatus}
                className="h-[65vh] xl:h-auto xl:min-h-0 xl:min-w-0 xl:flex-1"
            />

            <div className="flex max-h-[60vh] min-h-0 flex-col xl:max-h-none xl:w-80">
                <BadgeRail registry={registry} locations={badgeLocations}/>
            </div>
        </div>
    )
}