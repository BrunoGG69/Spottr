import {useState} from 'react'

const ROOMS = [
    {
        id: "room_1",
        name: "Master Bedroom",
        scannerId: null,
        points: "737,446 554,446 554,441 549,441 549,276 544,276 544,309 442,309 442,231 549,231 549,190 601,190 601,179 549,179 549,83 562,83 562,77 748,77 748,177 737,177 737,446"
    },
    {
        id: "room_2",
        name: "Kids Bedroom",
        scannerId: "scanner_bedroom",
        points: "382,543 321,543 321,309 310,309 310,225 413,225 413,279 431,279 431,322 543,322 543,503 538,503 538,509 383,509 383,543"
    },
    {
        id: "room_3",
        name: "Guest Bedroom",
        scannerId: null,
        points: "549,901 660,901 660,908 806,908 806,730 549,730 549,867"
    },
    {
        id: "room_4",
        name: "Bathroom: Master",
        scannerId: null,
        points: "436,82 442,82 442,226 450,226 450,227 544,227 544,190 538,190 538,83 543,83 543,41 436,41"
    },
    {
        id: "room_5",
        name: "Bathroom: Kids",
        scannerId: null,
        points: "321,549 321,600 543,600 543,514 388,514 388,566 381,566 381,549 322,549 322,549"
    },
    {
        id: "room_6",
        name: "Kitchen",
        scannerId: null,
        points: "457,818 457,797 451,797 451,698 410,698 410,691 316,691 316,656 310,656 310,614 549,614 549,559 704,559 704,724 549,724 549,699 549,655 538,655 538,818"
    },
    {
        id: "room_7",
        name: "Living Room",
        scannerId: "scanner_living_room",
        points: "759,356 897,356 897,366 901,366 901,440 897,440 897,913 811,913 811,869 837,869 837,858 811,858 811,725 710,725 710,552 549,552 549,452 764,452 764,440 748,440 748,415 764,415 764,408 758,408 758,356"
    },
    {
        id: "room_8",
        name: "Bathroom: Guest",
        scannerId: null,
        points: "407,823 407,905 536,905 536,901 542,901 542,892 544,892 544,824 407,824"
    },
]

export function getTotalRooms() {
    return ROOMS.length
}

const viewBox = '290 20 630 910'
const STATUS_THRESHOLD = 90

function isRecentlyOnline(lastSeen) {
    if (!lastSeen) return false;
    return (Date.now() / 1000) - lastSeen < STATUS_THRESHOLD
}

function getPolygonCenter(pointsStr) {
    const pts = pointsStr.trim().split(' ').map(p => {
        const [x, y] = p.split(',').map(Number)
        return {x, y}
    })
    const cent_x = pts.reduce((sum, p) => sum + p.x, 0) / pts.length
    const cent_y = pts.reduce((sum, p) => sum + p.y, 0) / pts.length
    return {x: cent_x, y: cent_y}
}

export default function FloorMap({badgeLocations = {}, scannerStatus = {}}) {
    const [hoveredRoom, setHoveredRoom] = useState(null)
    const [selectedRoom, setSelectedRoom] = useState(null)
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0})

    const badgesByRoom = {}
    Object.entries(badgeLocations).forEach(([, data]) => {
        const room = ROOMS.find(r => r.scannerId === data.room)
        if (room) {
            if (!badgesByRoom[room.id]) badgesByRoom[room.id] = []
            badgesByRoom[room.id].push(data)
        }
    })

    function getRoomInfo(room) {
        const isOnline = room.scannerId && isRecentlyOnline(scannerStatus[room.scannerId]?.last_seen)
        const badges = badgesByRoom[room.id] || []
        return {...room, isOnline, badges}
    }

    const activeRoom = selectedRoom ? getRoomInfo(ROOMS.find(r => r.id === selectedRoom)) : null

    console.log('badgeLocations prop:', badgeLocations)
    console.log('badgesByRoom:', badgesByRoom)

    return (
        <div className="bg-white/2 border-white/8 rounded 2xl p-4">
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <svg viewBox={viewBox} className="w-full h-screen">
                        {ROOMS.map(room => {
                            const info = getRoomInfo(room)
                            const isHovered = hoveredRoom === room.id
                            const center = getPolygonCenter(room.points)
                            return (
                                <g key={room.id}>
                                    <polygon
                                        points={room.points}
                                        fill={info.isOnline ? 'rgba(6,182,212,0.18)' : 'rgba(255,255,255,0.05)'}
                                        stroke={info.isOnline ? 'rgba(6,182,212,0.7)' : 'rgba(255,255,255,0.15)'}
                                        strokeWidth={isHovered ? 3 : 2}
                                        style={{cursor: 'pointer', transition: 'stroke-width 0.15s, fill 0.2s'}}
                                        onMouseEnter={() => setHoveredRoom(room.id)}
                                        onMouseLeave={() => setHoveredRoom(null)}
                                        onMouseMove={(e) => {
                                            const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect()
                                            setMousePosition({
                                                x: e.clientX - rect.left,
                                                y: e.clientY - rect.top,
                                            })
                                        }}
                                        onClick={() => setSelectedRoom(room.id)}
                                    />
                                    <text
                                        x={center.x}
                                        y={center.y}
                                        textAnchor="middle"
                                        fontSize="14"
                                        fill={info.isOnline ? '#7dd3e8' : 'rgba(255,255,255,0.45)'}
                                        fontFamily="sans-serif"
                                        style={{pointerEvents: 'none'}}
                                    >
                                        {room.name}
                                    </text>
                                    {info.badges.map((badge, i) => (
                                        <circle
                                            key={badge.mac}
                                            cx={center.x + (i % 3) * 24 - 24}
                                            cy={center.y + 22 + Math.floor(i / 3) * 24}
                                            r="9"
                                            fill="#8B5CF6"
                                            stroke="white"
                                            strokeWidth="2"
                                            style={{pointerEvents: 'none'}}
                                        />
                                    ))}
                                </g>
                            )
                        })}
                    </svg>

                    {hoveredRoom && (
                        <div
                            className="absolute bg-[#0d0d0d] border border-white/15 rounded-lg px-3 py-2 pointer-events-none z-10 min-w-40"
                            style={{left: mousePosition.x + 14, top: mousePosition.y + 14}}
                        >
                            {(() => {
                                const info = getRoomInfo(ROOMS.find(r => r.id === hoveredRoom))
                                return (
                                    <>
                                        <p className="text-white text-sm font-medium m-0">{info.name}</p>
                                        <p className={`text-xs mt-1 m-0 ${info.isOnline ? 'text-cyan-400' : 'text-white/40'}`}>
                                            {info.scannerId ? (info.isOnline ? 'Scanner online' : 'Scanner offline') : 'No scanner'}
                                        </p>
                                        <p className="text-xs text-white/50 mt-1 m-0">
                                            {info.badges.length ? info.badges.map(b => b.owner).join(', ') : 'No one here'}
                                        </p>
                                    </>
                                )
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

}
