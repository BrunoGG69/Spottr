import {useEffect, useRef, useState} from 'react'

const ROOM_LABELS = {
    bedroom_1: 'Bedroom 1',
    bedroom_2: 'Bedroom 2',
    bedroom_3: 'Bedroom 3',
    living_room: 'Living Room',
    kitchen: 'Kitchen',
    bathroom_1: 'Bathroom 1',
    bathroom_2: 'Bathroom 2',
    bathroom_3: 'Bathroom 3',
    service_area_1: 'Service Area 1',
    service_area_2: 'Service Area 2',
}

const MAP_SCANNER = {
    bedroom_1: 'scanner_bedroom',
    living_room: 'scanner_living_room',
}

export default function FloorMap({badgeLocations = {}, scannerStatus = {}}) {
    const containerRef = useRef(null)
    const [svgMarkup, setSvgMarkup] = useState('')
    const [roomBounds, setRoomBounds] = useState({})
    const [viewBox, setViewBox] = useState('0 0 1000 1200')

    useEffect(() => {
        fetch('/floor-plan.svg')
            .then(res => res.text())
            .then(setSvgMarkup)
            .catch(err => console.error('Failed to load floor plan SVG:', err))
    }, [])

    useEffect(() => {
        if (!svgMarkup || !containerRef.current) return

        const frame = requestAnimationFrame(() => {
            const svgEl = containerRef.current.querySelector('svg')
            if (!svgEl) {
                console.warn('SVG element not found in container')
                return
            }

            if (svgEl.getAttribute('viewBox')) {
                setViewBox(svgEl.getAttribute('viewBox'))
            }

            const bounds = {}
            Object.keys(ROOM_LABELS).forEach(roomId => {
                const roomEl = svgEl.querySelector(`#${roomId}`)
                if (roomEl) {
                    const bbox = roomEl.getBBox()
                    bounds[roomId] = {
                        x: bbox.x,
                        y: bbox.y,
                        width: bbox.width,
                        height: bbox.height,
                        centerX: bbox.x + bbox.width / 2,
                        centerY: bbox.y + bbox.height / 2,
                    }

                    const scannerId = MAP_SCANNER[roomId]
                    const isActive = scannerId && scannerStatus[scannerId]?.status === 'ONLINE'
                    roomEl.style.fill = isActive ? 'rgba(6,182,212,0.18)' : 'rgba(255,255,255,0.04)'
                    roomEl.style.stroke = isActive ? 'rgba(6,182,212,0.6)' : 'rgba(255,255,255,0.1)'
                    roomEl.style.strokeWidth = isActive ? '2' : '1'
                    roomEl.style.transition = 'fill 0.3s, stroke 0.3s'
                } else {
                    console.warn(`Room element not found: #${roomId}`)
                }
            })
            setRoomBounds(bounds)
        })

        return () => cancelAnimationFrame(frame)
    }, [svgMarkup, scannerStatus])

    const badgesByRoom = {}
    Object.entries(badgeLocations).forEach(([mac, data]) => {
        const scannerId = data.room
        const roomId = Object.keys(MAP_SCANNER).find(r => MAP_SCANNER[r] === scannerId)
        if (roomId) {
            if (!badgesByRoom[roomId]) badgesByRoom[roomId] = []
            badgesByRoom[roomId].push(data)
        }
    })

    return (
        <div className="relative w-full bg-white/2 border border-white/8 rounded-2xl p-4 overflow-hidden">
            <div
                ref={containerRef}
                className="relative w-full"
                dangerouslySetInnerHTML={{__html: svgMarkup}}
            />
            <svg
                viewBox={viewBox}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{top: 0, left: 0}}
            >
                {Object.entries(badgesByRoom).map(([roomId, badges]) =>
                    badges.map((badge, i) => {
                        const bounds = roomBounds[roomId]
                        if (!bounds) return null
                        const offsetX = (i % 3) * 24 - 24
                        const offsetY = Math.floor(i / 3) * 24
                        return (
                            <g key={badge.mac}>
                                <circle
                                    cx={bounds.centerX + offsetX}
                                    cy={bounds.centerY + offsetY}
                                    r="10"
                                    fill="#8B5CF6"
                                    stroke="white"
                                    strokeWidth="2"
                                />
                                <text
                                    x={bounds.centerX + offsetX}
                                    y={bounds.centerY + offsetY + 24}
                                    textAnchor="middle"
                                    fontSize="13"
                                    fill="white"
                                    fontFamily="sans-serif"
                                >
                                    {badge.owner}
                                </text>
                            </g>
                        )
                    })
                )}
            </svg>
        </div>
    )
}