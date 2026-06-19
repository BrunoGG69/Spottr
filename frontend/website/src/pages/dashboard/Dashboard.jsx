import {useEffect, useState} from "react";
import {ref, onValue} from 'firebase/database';
import {db} from '../../firebase.js'
import FloorMap, {getTotalRooms} from '../../components/dashboard/FloorMap.jsx'
import StatCard from '../../components/dashboard/StatCard.jsx'

const STATUS_THRESHOLD = 60

function isRecentlyOnline(lastSeen) {
    if (!lastSeen) return false;
    return (Date.now() / 1000) - lastSeen < STATUS_THRESHOLD
}

export default function Dashboard() {
    const [badgeLocations, setBadgeLocations] = useState({})
    const [scannerStatus, setScannerStatus] = useState({})

    useEffect(() => {
        const badgeRef = ref(db, 'badge_location')
        const scannerRef = ref(db, 'scanner_status')

        const unsubBadges = onValue(badgeRef, (snapshot) => {
            setBadgeLocations(snapshot.val() || {})
        })

        const unsubScanners = onValue(scannerRef, (snapshot) => {
            setScannerStatus(snapshot.val() || {})
        })

        return () => {
            unsubScanners()
            unsubBadges()
        }
    }, []);

    const onlineBadges = Object.values(badgeLocations).filter(b => isRecentlyOnline(b.last_seen)).length
    const onlineScanners = Object.values(scannerStatus).filter(s => isRecentlyOnline(s.last_seen)).length
    const totalBadges = Object.keys(badgeLocations).length
    const totalScanners = Object.keys(scannerStatus).length
    const totalRooms = getTotalRooms()

    const roomOccupied = new Set(
        Object.values(badgeLocations)
            .filter(b => b.status === 'ONLINE')
            .map(b => b.room)
    ).size

    return (
        <div>
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:w-64 shrink-0 lg:h-full">
                    <StatCard
                        label="BADGES ONLINE"
                        value={`${onlineBadges}`}
                        sublabel={`OF ${totalBadges} REGISTERED`}
                        accent={onlineBadges > 0 ? 'green' : 'amber'}
                    />
                    <StatCard
                        label="SCANNERS ONLINE"
                        value={`${onlineScanners}`}
                        sublabel={`${totalScanners - onlineScanners} OFFLINE`}
                        accent={onlineScanners === totalScanners ? 'green' : 'amber'}
                    />
                    <StatCard
                        label="Rooms occupied"
                        value={roomOccupied}
                        sublabel={`OF ${totalRooms} MAPPED`}
                        accent="purple"
                    />
                    <StatCard
                        label="Total badges"
                        value={totalBadges}
                        sublabel="REGISTERED BADGES"
                        accent="cyan"
                    />
                </div>
                <div className="relative flex-1">
                    <FloorMap badgeLocations={badgeLocations} scannerStatus={scannerStatus}/>
                </div>
            </div>
        </div>
    )
}