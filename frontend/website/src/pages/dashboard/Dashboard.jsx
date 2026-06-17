import {useEffect, useState} from "react";
import {ref, onValue} from 'firebase/database';
import {db} from '../../firebase.js'
import FloorMap from '../../components/dashboard/FloorMap.jsx'
import StatCard from '../../components/dashboard/StatCard.jsx'

const STATUS_THRESHOLD = 90

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

    const roomOccupied = new Set(
        Object.values(badgeLocations)
            .filter(b => b.status === 'ONLINE')
            .map(b => b.room)
    ).size

    return (
        <div>
            <div className='mb-6'>
                <h1 className='text-white text-2xl font-bold'> Overview </h1>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <StatCard
                    label="Badges online"
                    value={`${onlineBadges}/${totalBadges}`}
                    sublabel={onlineBadges > 0 ? 'Active now' : 'None active'}
                    accent={onlineBadges > 0 ? 'cyan' : 'amber'}
                />
                <StatCard
                    label="Scanners online"
                    value={`${onlineScanners}/${totalScanners}`}
                    sublabel={onlineScanners === totalScanners ? 'All healthy' : 'Check scanners'}
                    accent={onlineScanners === totalScanners ? 'green' : 'amber'}
                />
                <StatCard
                    label="Rooms occupied"
                    value={roomOccupied}
                    sublabel="Right now"
                    accent="purple"
                />
                <StatCard
                    label="Total badges"
                    value={totalBadges}
                    sublabel="Registered"
                    accent="cyan"
                />
            </div>
            <FloorMap badgeLocations={badgeLocations} scannerStatus={scannerStatus}/>
        </div>
    )
}