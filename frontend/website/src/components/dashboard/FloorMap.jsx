import {useState, useRef} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {isBadgeOnline, isScannerOnline} from '@/lib/status.js'
import {macToLocationKey} from '@/lib/badges.js'

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

const BASE = {x: 290, y: 20, w: 630, h: 910}
const MIN_W = BASE.w * 0.25
const MAX_W = BASE.w * 1.4

export function getTotalRooms() {
    return ROOMS.length
}

export function scannerToRoomName(scannerId) {
    return ROOMS.find(r => r.scannerId === scannerId)?.name || scannerId
}

function getPolygonCenter(pointsStr) {
    const pts = pointsStr.trim().split(' ').map(p => {
        const [x, y] = p.split(',').map(Number)
        return {x, y}
    })
    return {
        x: pts.reduce((sum, p) => sum + p.x, 0) / pts.length,
        y: pts.reduce((sum, p) => sum + p.y, 0) / pts.length,
    }
}

function roomStyle(info) {
    if (info.badges.length) return {
        fill: 'rgba(100,210,255,0.12)',
        stroke: 'rgba(100,210,255,0.55)',
        text: 'rgba(160,225,255,0.90)',
    }
    if (info.isOnline) return {
        fill: 'rgba(255,255,255,0.05)',
        stroke: 'rgba(255,255,255,0.22)',
        text: 'rgba(255,255,255,0.50)',
    }
    if (info.scannerId) return {
        fill: 'rgba(255,69,58,0.05)',
        stroke: 'rgba(255,69,58,0.30)',
        text: 'rgba(255,255,255,0.30)',
    }
    return {
        fill: 'rgba(255,255,255,0.022)',
        stroke: 'rgba(255,255,255,0.09)',
        text: 'rgba(255,255,255,0.22)',
    }
}

function clampView(v) {
    const nw = Math.min(MAX_W, Math.max(MIN_W, v.w))
    const factor = nw / v.w
    return {...v, w: nw, h: v.h * factor}
}

function ZoomButton({onClick, label, children}) {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            className="grid h-7 w-7 place-items-center rounded-lg border border-line bg-surface-2
                       text-sm text-text-2 transition-colors hover:border-line-strong hover:text-text"
        >
            {children}
        </button>
    )
}

export default function FloorMap({registry = {}, badgeLocations = {}, scannerStatus = {}, className = ''}) {
    const [activeRoom, setActiveRoom] = useState(null)
    const [view, setView] = useState(BASE)
    const [panning, setPanning] = useState(false)
    const svgRef = useRef(null)
    const panRef = useRef(null)

    const z = BASE.w / view.w

    const badgesByRoom = {}
    Object.entries(registry).forEach(([mac, badge]) => {
        if (!badge.active) return
        const loc = badgeLocations[macToLocationKey(mac)]
        if (!loc || !isBadgeOnline(loc)) return
        const room = ROOMS.find(r => r.scannerId === loc.room)
        if (!room) return
        if (!badgesByRoom[room.id]) badgesByRoom[room.id] = []
        badgesByRoom[room.id].push({mac, ...badge, ...loc})
    })

    function getRoomInfo(room) {
        const isOnline = Boolean(room.scannerId) && isScannerOnline(scannerStatus[room.scannerId])
        return {...room, isOnline, badges: badgesByRoom[room.id] || []}
    }

    const activeInfo = activeRoom
        ? getRoomInfo(ROOMS.find(r => r.id === activeRoom))
        : null

    function handleWheel(e) {
        e.preventDefault()
        const rect = svgRef.current.getBoundingClientRect()
        const scale = e.deltaY > 0 ? 1.12 : 1 / 1.12
        const px = (e.clientX - rect.left) / rect.width
        const py = (e.clientY - rect.top) / rect.height

        setView(v => {
            const next = clampView({...v, w: v.w * scale, h: v.h * scale})
            return {
                x: v.x + (v.w - next.w) * px,
                y: v.y + (v.h - next.h) * py,
                w: next.w,
                h: next.h,
            }
        })
    }

    function zoomBy(scale) {
        setView(v => {
            const next = clampView({...v, w: v.w * scale, h: v.h * scale})
            return {
                x: v.x + (v.w - next.w) / 2,
                y: v.y + (v.h - next.h) / 2,
                w: next.w,
                h: next.h,
            }
        })
    }

    function handlePointerDown(e) {
        panRef.current = {
            px: e.clientX,
            py: e.clientY,
            view: {...view},
            rect: svgRef.current.getBoundingClientRect(),
            moved: false,
        }
        setPanning(true)
    }

    function handlePointerMove(e) {
        const p = panRef.current
        if (!p) return

        const dx = e.clientX - p.px
        const dy = e.clientY - p.py
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) p.moved = true

        setView({
            ...p.view,
            x: p.view.x - (dx / p.rect.width) * p.view.w,
            y: p.view.y - (dy / p.rect.height) * p.view.h,
        })
    }

    function handlePointerUp() {
        setPanning(false)
        setTimeout(() => {
            panRef.current = null
        }, 0)
    }

    function handleRoomClick(roomId) {
        if (panRef.current?.moved) return
        setActiveRoom(prev => prev === roomId ? null : roomId)
    }

    return (
        <div className={`rounded-xl bg-surface-1 p-4 ${className}`}>
            <div className="relative h-full w-full">
                <svg
                    ref={svgRef}
                    viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="h-full w-full touch-none select-none"
                    style={{cursor: panning ? 'grabbing' : 'grab'}}
                    onWheel={handleWheel}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                >
                    {ROOMS.map(room => {
                        const info = getRoomInfo(room)
                        const isActive = activeRoom === room.id
                        const center = getPolygonCenter(room.points)
                        const s = roomStyle(info)

                        return (
                            <g key={room.id}>
                                <motion.polygon
                                    points={room.points}
                                    strokeWidth={1.5 / z}
                                    animate={{
                                        fill: s.fill,
                                        stroke: isActive ? 'rgba(255,255,255,0.45)' : s.stroke,
                                    }}
                                    transition={{duration: 0.25}}
                                    onPointerUp={() => handleRoomClick(room.id)}
                                />

                                <motion.text
                                    x={center.x}
                                    y={center.y}
                                    textAnchor="middle"
                                    fontSize={18 / z}
                                    letterSpacing={1 / z}
                                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                                    animate={{fill: s.text}}
                                    transition={{duration: 0.25}}
                                    style={{pointerEvents: 'none'}}
                                >
                                    {room.name.toUpperCase()}
                                </motion.text>

                                <AnimatePresence>
                                    {info.badges.map((badge, i) => (
                                        <motion.circle
                                            key={badge.mac}
                                            cx={center.x + ((i % 3) * 24 - 24) / z}
                                            cy={center.y + (26 + Math.floor(i / 3) * 24) / z}
                                            r={6 / z}
                                            fill="var(--color-brand)"
                                            initial={{scale: 0, opacity: 0}}
                                            animate={{scale: 1, opacity: 1}}
                                            exit={{scale: 0, opacity: 0}}
                                            transition={{type: 'spring', stiffness: 500, damping: 25}}
                                            style={{
                                                pointerEvents: 'none',
                                                transformOrigin: 'center',
                                                transformBox: 'fill-box',
                                            }}
                                        />
                                    ))}
                                </AnimatePresence>
                            </g>
                        )
                    })}
                </svg>

                <div className="absolute right-2 top-2 flex flex-col gap-1">
                    <ZoomButton onClick={() => zoomBy(1 / 1.3)} label="Zoom in">+</ZoomButton>
                    <ZoomButton onClick={() => zoomBy(1.3)} label="Zoom out">−</ZoomButton>
                    <ZoomButton onClick={() => setView(BASE)} label="Reset view">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                             strokeLinecap="round" className="h-3.5 w-3.5">
                            <path
                                d="M3 9V5a2 2 0 012-2h4M21 9V5a2 2 0 00-2-2h-4M3 15v4a2 2 0 002 2h4M21 15v4a2 2 0 01-2 2h-4"/>
                        </svg>
                    </ZoomButton>
                </div>

                <AnimatePresence>
                    {activeInfo && (
                        <motion.div
                            key={activeRoom}
                            className="pointer-events-none absolute inset-x-2 bottom-2 rounded-lg border border-line bg-surface-2 px-3 py-2.5 sm:inset-x-auto sm:left-2 sm:max-w-64"
                            initial={{opacity: 0, y: 6}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: 6}}
                            transition={{duration: 0.15}}
                        >
                            <p className="m-0 text-sm text-text">{activeInfo.name}</p>

                            <div className="mt-2 flex items-center gap-2">
                                <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{
                                        background: !activeInfo.scannerId ? 'var(--color-text-3)'
                                            : activeInfo.isOnline ? 'var(--color-ok)'
                                                : 'var(--color-bad)'
                                    }}
                                />
                                <span className="label-mono">
                                    {!activeInfo.scannerId ? 'No scanner'
                                        : activeInfo.isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>

                            <p className="m-0 mt-2 text-sm text-text-2">
                                {activeInfo.badges.length
                                    ? activeInfo.badges.map(b => b.owner).join(', ')
                                    : 'Empty'}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}