import {useEffect, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {ref, onValue, set, update, remove} from 'firebase/database';
import {db} from '../../firebase.js'

const STATUS_THRESHOLD = 90;

function isRecentlyOnline(lastSeen) {
    if (!lastSeen) return false
    return (Date.now() / 1000) - lastSeen < STATUS_THRESHOLD
}

function macToLocationKey(mac) {
    return mac.replace(/:/g, '_')
}

export default function Badges() {
    const [badges, setBadges] = useState({});
    const [location, setLocation] = useState({});
    const [deletingBadge, setDeletingBadge] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingBadge, setEditingBadge] = useState(null);
    const [formMac, setFormMac] = useState('');
    const [formOwner, setFormOwner] = useState('');
    const [formLabel, setFormLabel] = useState('');
    const [deactivatingBadge, setDeactivatingBadge] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const badgesRef = ref(db, 'badges');
        const locationRef = ref(db, 'badge_location');

        const unsubBadges = onValue(badgesRef, (snapshot) => {
            setBadges(snapshot.val() || {});
        })
        const unsubLocations = onValue(locationRef, (snapshot) => {
            setLocation(snapshot.val() || {});
        })

        return () => {
            unsubBadges()
            unsubLocations()
        }
    }, [])

    async function handleAddBadge(mac, owner, label) {
        const cleanMac = mac.trim().toUpperCase();
        await set(ref(db, `badges/${cleanMac}`), {
            owner: owner.trim(),
            label: label.trim(),
            active: true,
        })
    }

    async function handleUpdateBadge(mac, fields) {
        await update(ref(db, `badges/${mac}`), fields)
    }

    async function handleDeleteBadge(mac) {
        await remove(ref(db, `badges/${mac}`))
    }

    function getBadgeStatus(mac) {
        const loc = location[macToLocationKey(mac)];
        const online = loc && isRecentlyOnline(loc.last_seen);
        return {
            online,
            room: loc?.room || null
        }
    }

    const badgeEntries = Object.entries(badges).filter(([mac, badge]) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
            badge.owner?.toLowerCase().includes(q) ||
            badge.label?.toLowerCase().includes(q) ||
            mac.toLowerCase().includes(q)
        )
    })

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    {/*<h1 className="text-white text-2xl font-bold">Badges</h1>*/}
                    <p className="text-white/40 text-sm mt-1">Manage registered badges</p>
                </div>


                <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="relative w-full max-w-xs">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"/>
                        </svg>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search Badges"
                            className="w-full pl-9 pr-9 py-2 bg-white/4 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                     strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-cyan-500 text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-cyan-400"
                    >
                        + Add badge
                    </button>
                </div>
            </div>


            <div className="bg-white/3 border border-white/8 rounded-xl overflow-x-auto">
                <table className="w-full text-sm min-w-160">
                    <thead>
                    <tr className="border-b border-white/8 text-white/40 text-xs uppercase tracking-wider">
                        <th className="text-left px-4 py-3">Owner</th>
                        <th className="text-left px-4 py-3">Label</th>
                        <th className="text-left px-4 py-3">MAC</th>
                        <th className="text-left px-4 py-3">Status</th>
                        <th className="text-left px-4 py-3">Room</th>
                        <th className="text-left px-4 py-3">Active</th>
                        <th className="text-right px-4 py-3">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {badgeEntries.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="text-center text-white/30 py-8">
                                No badges registered yet
                            </td>
                        </tr>
                    ) : (
                        badgeEntries.map(([mac, badge]) => {
                            const status = getBadgeStatus(mac)
                            return (
                                <tr key={mac} className="border-b border-white/4 last:border-0">
                                    <td className="px-4 py-3 text-white">{badge.owner}</td>
                                    <td className="px-4 py-3 text-white/70">{badge.label}</td>
                                    <td className="px-4 py-3 text-white/40 font-mono text-xs">{mac}</td>
                                    <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1.5 text-xs ${status.online ? 'text-green-400' : 'text-white/30'}`}>
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${status.online ? 'bg-green-400' : 'bg-white/20'}`}/>
                                                {status.online ? 'Online' : 'Offline'}
                                            </span>
                                    </td>
                                    <td className="px-4 py-3 text-white/60">{status.room || '—'}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => {
                                                if (badge.active) {
                                                    setDeactivatingBadge({mac, ...badge});
                                                } else {
                                                    handleUpdateBadge(mac, {active: true})
                                                }
                                            }}
                                            className={`relative w-9 h-5 rounded-full transition-colors ${badge.active ? 'bg-cyan-500' : 'bg-white/15'}`}
                                        >
                                            <span
                                                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${badge.active ? 'translate-x-4' : 'translate-x-0'}`}
                                            />
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => setEditingBadge({mac, ...badge})}
                                            className="text-cyan-400 hover:text-cyan-300 text-xs mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeletingBadge({mac, ...badge})}
                                            className="text-red-400 hover:text-red-300 text-xs"
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
                {deletingBadge && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.15}}
                        onClick={() => setDeletingBadge(null)}
                    >
                        <motion.div
                            className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6 max-w-sm w-full"
                            initial={{opacity: 0, scale: 0.95, y: 10}}
                            animate={{opacity: 1, scale: 1, y: 0}}
                            exit={{opacity: 0, scale: 0.95, y: 10}}
                            transition={{duration: 0.18, ease: 'easeOut'}}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-white text-lg font-semibold">DELETE BADGE?</h3>
                            <p className="text-white/50 text-sm mt-2">
                                This will remove <span className="text-white uppercase">{deletingBadge.owner}</span>'s
                                badge ({deletingBadge.label}).
                            </p>
                            <p className="text-red-400 text-sm font-semibold uppercase mt-1">
                                This can't be undone.
                            </p>
                            <div className="flex gap-3 mt-6 justify-end">
                                <button
                                    onClick={() => setDeletingBadge(null)}
                                    className="px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        await handleDeleteBadge(deletingBadge.mac)
                                        setDeletingBadge(null)
                                    }}
                                    className="px-4 py-2 rounded-lg text-sm bg-red-500 text-white font-semibold hover:bg-red-400"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {(showAddForm || editingBadge) && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.15}}
                        onClick={() => {
                            setShowAddForm(false);
                            setEditingBadge(null)
                        }}
                    >
                        <motion.div
                            className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6 max-w-sm w-full"
                            initial={{opacity: 0, scale: 0.95, y: 10}}
                            animate={{opacity: 1, scale: 1, y: 0}}
                            exit={{opacity: 0, scale: 0.95, y: 10}}
                            transition={{duration: 0.18, ease: 'easeOut'}}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-white text-lg font-semibold">
                                {editingBadge ? 'Edit Badge' : 'Add Badge'}
                            </h3>

                            <div className="mt-4 flex flex-col gap-3">
                                <div>
                                    <label className="text-white/40 text-xs"> Mac Address </label>
                                    <input
                                        value={formMac}
                                        onChange={(e) => setFormMac(e.target.value)}
                                        disabled={!!editingBadge}
                                        placeholder="Mac Address"
                                        className="w-full mt-1 px-3 py-2 bg-white/4 border border-white/10 rounded-lg text-white text-sm font-mono disabled:opacity-40 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="text-white/40 text-xs">Owner</label>
                                    <input
                                        value={formOwner}
                                        onChange={(e) => setFormOwner(e.target.value)}
                                        placeholder="Name"
                                        className="w-full mt-1 px-3 py-2 bg-white/4 border border-white/10 rounded-lg text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-white/40 text-xs">Label</label>
                                    <input
                                        value={formLabel}
                                        onChange={(e) => setFormLabel(e.target.value)}
                                        placeholder="Label"
                                        className="w-full mt-1 px-3 py-2 bg-white/4 border border-white/10 rounded-lg text-white text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 justify-end">
                                <button
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setEditingBadge(null)
                                    }}
                                    className="px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        if (editingBadge) {
                                            await handleUpdateBadge(editingBadge.mac, {
                                                owner: formOwner.trim(),
                                                label: formLabel.trim()
                                            })
                                        } else {
                                            await handleAddBadge(formMac, formOwner, formLabel)
                                        }
                                        setShowAddForm(false)
                                        setEditingBadge(null)
                                    }}
                                    className="px-4 py-2 rounded-lg text-sm bg-cyan-500 text-black font-semibold hover:bg-cyan-400"
                                >
                                    {editingBadge ? 'Save' : 'Add'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {deactivatingBadge && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.15}}
                        onClick={() => setDeactivatingBadge(null)}
                    >
                        <motion.div
                            className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6 max-w-sm w-full"
                            initial={{opacity: 0, scale: 0.95, y: 10}}
                            animate={{opacity: 1, scale: 1, y: 0}}
                            exit={{opacity: 0, scale: 0.95, y: 10}}
                            transition={{duration: 0.18, ease: 'easeOut'}}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-white text-lg font-semibold">Disable this badge?</h3>
                            <p className="text-white/50 text-sm mt-2">
                                <span className="text-white">{deactivatingBadge.owner}</span>'s badge
                                ({deactivatingBadge.label}) will be disabled.
                            </p>

                            <div
                                className="flex items-start gap-2 mt-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <span className="text-amber-400 text-xs">
                        While disabled, this badge won't be tracked and won't appear on the floor map.
                    </span>
                            </div>

                            <div className="flex gap-3 mt-6 justify-end">
                                <button
                                    onClick={() => setDeactivatingBadge(null)}
                                    className="px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        await handleUpdateBadge(deactivatingBadge.mac, {active: false})
                                        setDeactivatingBadge(null)
                                    }}
                                    className="px-4 py-2 rounded-lg text-sm bg-amber-500 text-black font-semibold hover:bg-amber-400"
                                >
                                    Disable
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}
