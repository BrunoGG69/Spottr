import {useEffect, useState} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {ref, onValue} from 'firebase/database'
import {db} from '@/firebase.js'
import {isBadgeOnline} from '@/lib/status.js'
import {macToLocationKey, addBadge, updateBadge, deleteBadge, matchesQuery} from '@/lib/badges.js'
import {scannerToRoomName} from '../../components/dashboard/FloorMap.jsx'

export default function Badges() {
    const [badges, setBadges] = useState({})
    const [locations, setLocations] = useState({})
    const [search, setSearch] = useState('')
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingBadge, setEditingBadge] = useState(null)
    const [deletingBadge, setDeletingBadge] = useState(null)
    const [deactivatingBadge, setDeactivatingBadge] = useState(null)
    const [formMac, setFormMac] = useState('')
    const [formOwner, setFormOwner] = useState('')
    const [formLabel, setFormLabel] = useState('')
    const [, setTick] = useState(0)

    useEffect(() => {
        const unsubBadges = onValue(ref(db, 'badges'), s => setBadges(s.val() || {}))
        const unsubLocations = onValue(ref(db, 'badge_location'), s => setLocations(s.val() || {}))
        return () => {
            unsubBadges()
            unsubLocations()
        }
    }, [])

    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 10000)
        return () => clearInterval(id)
    }, [])

    function getBadgeStatus(mac, badge) {
        const loc = locations[macToLocationKey(mac)]
        return {
            online: Boolean(badge.active) && isBadgeOnline(loc),
            room: loc?.room || null,
        }
    }

    function openAdd() {
        setFormMac('')
        setFormOwner('')
        setFormLabel('')
        setShowAddForm(true)
    }

    function openEdit(mac, badge) {
        setFormMac(mac)
        setFormOwner(badge.owner || '')
        setFormLabel(badge.label || '')
        setEditingBadge({mac, ...badge})
    }

    function closeForm() {
        setShowAddForm(false)
        setEditingBadge(null)
    }

    const badgeEntries = Object.entries(badges)
        .filter(([mac, badge]) => matchesQuery(mac, badge, search))

    return (
        <div>
            <div className="mb-6 flex items-center justify-between gap-4">
                <p className="label-mono">Manage registered badges</p>

                <div className="flex flex-1 items-center justify-end gap-3">
                    <div className="relative w-full max-w-xs">
                        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3"
                             fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"/>
                        </svg>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search badges"
                            className="w-full rounded-lg border border-line bg-surface-1 py-2 pl-9 pr-9 text-sm
                                       text-text placeholder:text-text-3 focus:border-line-strong focus:outline-none"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        )}
                    </div>

                    <button
                        onClick={openAdd}
                        className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-black"
                    >
                        + Add badge
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl bg-surface-1">
                <table className="w-full min-w-160 text-sm">
                    <thead>
                    <tr className="border-b border-line">
                        <th className="label-mono px-4 py-3 text-left">Owner</th>
                        <th className="label-mono px-4 py-3 text-left">Label</th>
                        <th className="label-mono px-4 py-3 text-left">MAC</th>
                        <th className="label-mono px-4 py-3 text-left">Status</th>
                        <th className="label-mono px-4 py-3 text-left">Room</th>
                        <th className="label-mono px-4 py-3 text-left">Active</th>
                        <th className="label-mono px-4 py-3 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {badgeEntries.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="py-8 text-center text-xs text-text-3">
                                {Object.keys(badges).length === 0 ? 'No badges registered yet' : 'No matches'}
                            </td>
                        </tr>
                    ) : (
                        badgeEntries.map(([mac, badge]) => {
                            const status = getBadgeStatus(mac, badge)
                            return (
                                <tr key={mac} className="border-b border-line last:border-0">
                                    <td className={`px-4 py-3 ${badge.active ? 'text-text' : 'text-text-3'}`}>
                                        {badge.owner}
                                    </td>
                                    <td className="px-4 py-3 text-text-2">{badge.label}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-text-3">{mac}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1.5 text-xs text-text-2">
                                            <span
                                                className="h-1.5 w-1.5 rounded-full"
                                                style={{background: status.online ? 'var(--color-ok)' : 'var(--color-text-3)'}}
                                            />
                                            {status.online ? 'Online' : 'Offline'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-text-2">
                                        {status.room ? scannerToRoomName(status.room) : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => badge.active
                                                ? setDeactivatingBadge({mac, ...badge})
                                                : updateBadge(mac, {active: true})}
                                            role="switch"
                                            aria-checked={Boolean(badge.active)}
                                            className="relative h-5 w-9 rounded-full transition-colors"
                                            style={{background: badge.active ? 'var(--color-brand)' : 'rgba(255,255,255,0.12)'}}
                                        >
                                            <span
                                                className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
                                                style={{left: badge.active ? '18px' : '2px'}}
                                            />
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => openEdit(mac, badge)}
                                            className="mr-3 text-xs text-text-2 hover:text-brand"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeletingBadge({mac, ...badge})}
                                            className="text-xs text-text-2 hover:text-bad"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            )
                        })
                    )}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {(showAddForm || editingBadge) && (
                    <Modal onClose={closeForm}>
                        <p className="label-mono">{editingBadge ? 'Edit badge' : 'Add badge'}</p>

                        <label className="label-mono mt-5 block">MAC address</label>
                        <input
                            value={formMac}
                            onChange={e => setFormMac(e.target.value)}
                            disabled={Boolean(editingBadge)}
                            placeholder="e8:f6:0a:15:9c:56"
                            className="mt-2 w-full rounded-lg border border-line bg-bg px-3 py-2 font-mono text-sm
                                       text-text placeholder:text-text-3 focus:border-line-strong focus:outline-none
                                       disabled:cursor-not-allowed disabled:opacity-40"
                        />

                        <label className="label-mono mt-4 block">Owner</label>
                        <input
                            value={formOwner}
                            onChange={e => setFormOwner(e.target.value)}
                            placeholder="Name"
                            className="mt-2 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm
                                       text-text placeholder:text-text-3 focus:border-line-strong focus:outline-none"
                        />

                        <label className="label-mono mt-4 block">Label</label>
                        <input
                            value={formLabel}
                            onChange={e => setFormLabel(e.target.value)}
                            placeholder="Badge 001"
                            className="mt-2 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm
                                       text-text placeholder:text-text-3 focus:border-line-strong focus:outline-none"
                        />

                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={closeForm}
                                    className="rounded-lg px-4 py-2 text-sm text-text-2 hover:text-text">
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (editingBadge) {
                                        await updateBadge(editingBadge.mac, {
                                            owner: formOwner.trim(),
                                            label: formLabel.trim(),
                                        })
                                    } else {
                                        await addBadge(formMac, formOwner, formLabel)
                                    }
                                    closeForm()
                                }}
                                disabled={!editingBadge && !formMac.trim()}
                                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
                            >
                                {editingBadge ? 'Save' : 'Add'}
                            </button>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deactivatingBadge && (
                    <Modal onClose={() => setDeactivatingBadge(null)}>
                        <p className="label-mono">Disable badge</p>
                        <p className="mt-4 text-sm text-text">
                            {deactivatingBadge.owner}'s badge ({deactivatingBadge.label}) will be disabled.
                        </p>
                        <p className="mt-2 text-xs" style={{color: 'var(--color-warn)'}}>
                            While disabled it won't be tracked or shown on the floor map.
                        </p>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setDeactivatingBadge(null)}
                                    className="rounded-lg px-4 py-2 text-sm text-text-2 hover:text-text">
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    await updateBadge(deactivatingBadge.mac, {active: false})
                                    setDeactivatingBadge(null)
                                }}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-black"
                                style={{background: 'var(--color-warn)'}}
                            >
                                Disable
                            </button>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deletingBadge && (
                    <Modal onClose={() => setDeletingBadge(null)}>
                        <p className="label-mono">Delete badge</p>
                        <p className="mt-4 text-sm text-text">
                            Remove {deletingBadge.owner}'s badge ({deletingBadge.label})?
                        </p>
                        <p className="mt-2 text-xs" style={{color: 'var(--color-bad)'}}>
                            This can't be undone. To stop tracking without losing the record, disable it instead.
                        </p>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setDeletingBadge(null)}
                                    className="rounded-lg px-4 py-2 text-sm text-text-2 hover:text-text">
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    await deleteBadge(deletingBadge.mac)
                                    setDeletingBadge(null)
                                }}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                                style={{background: 'var(--color-bad)'}}
                            >
                                Delete
                            </button>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    )
}

function Modal({children, onClose}) {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.15}}
            onClick={onClose}
        >
            <motion.div
                className="w-full max-w-sm rounded-xl border border-line bg-surface-1 p-5"
                initial={{opacity: 0, scale: 0.97, y: 8}}
                animate={{opacity: 1, scale: 1, y: 0}}
                exit={{opacity: 0, scale: 0.97, y: 8}}
                transition={{duration: 0.18, ease: 'easeOut'}}
                onClick={e => e.stopPropagation()}
            >
                {children}
            </motion.div>
        </motion.div>
    )
}