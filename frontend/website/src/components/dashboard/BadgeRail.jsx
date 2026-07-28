import {useState} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {isBadgeOnline} from '@/lib/status.js'
import {macToLocationKey, updateBadge, deleteBadge, matchesQuery} from '@/lib/badges.js'
import {scannerToRoomName} from './FloorMap.jsx'

function timeAgo(ts) {
    if (!ts) return 'never'
    const s = Math.floor(Date.now() / 1000 - ts)
    if (s < 60) return `${s}s`
    if (s < 3600) return `${Math.floor(s / 60)}m`
    if (s < 86400) return `${Math.floor(s / 3600)}h`
    return `${Math.floor(s / 86400)}d`
}

export default function BadgeRail({registry = {}, locations = {}}) {
    const [query, setQuery] = useState('')
    const [editing, setEditing] = useState(null)
    const [deactivating, setDeactivating] = useState(null)
    const [deleting, setDeleting] = useState(null)

    const rows = Object.entries(registry)
        .filter(([mac, badge]) => matchesQuery(mac, badge, query))
        .map(([mac, badge]) => {
            const loc = locations[macToLocationKey(mac)] || {}
            return {mac, ...badge, ...loc, live: Boolean(badge.active) && isBadgeOnline(loc)}
        })
        .sort((a, b) => {
            if (a.live !== b.live) return a.live ? -1 : 1
            return (a.owner || '').localeCompare(b.owner || '')
        })

    const totalCount = Object.keys(registry).length
    const onlineCount = Object.entries(registry).filter(([mac, badge]) =>
        badge.active && isBadgeOnline(locations[macToLocationKey(mac)])
    ).length

    async function saveEdit(e) {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        await updateBadge(editing.mac, {
            owner: form.get('owner').trim(),
            label: form.get('label').trim(),
        })
        setEditing(null)
    }

    return (
        <>
            <div className="flex min-h-0 flex-col rounded-xl bg-surface-1">
                <div className="shrink-0 border-b border-line py-3 pl-7 pr-4">
                    <div className="flex items-baseline justify-between">
                        <p className="label-mono">Badges</p>
                        <p className="font-mono text-xs tabular-nums text-text-3">
                            {onlineCount}/{totalCount}
                        </p>
                    </div>
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search name, label, MAC"
                        className="mono-caps mt-3 w-full rounded-lg border border-line bg-bg px-3 py-2 text-xs
                                   text-text placeholder:text-text-3 focus:border-line-strong focus:outline-none"
                    />
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {rows.length === 0 && (
                        <p className="py-3 pl-7 pr-4 text-sm text-text-3">
                            {totalCount === 0 ? 'No badges registered' : 'No matches'}
                        </p>
                    )}

                    <AnimatePresence initial={false}>
                        {rows.map(row => (
                            <motion.div
                                key={row.mac}
                                layout
                                initial={{opacity: 0, height: 0}}
                                animate={{opacity: 1, height: 'auto'}}
                                exit={{opacity: 0, height: 0}}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 38,
                                    opacity: {duration: 0.15},
                                }}
                                className="group relative overflow-hidden border-b border-line py-3 pl-7 pr-4 last:border-b-0"
                            >
                                <motion.span
                                    className="absolute left-3.5 top-4.5 h-1.5 w-1.5 rounded-full"
                                    animate={{backgroundColor: row.live ? 'var(--color-ok)' : 'var(--color-text-3)'}}
                                    transition={{duration: 0.3}}
                                />

                                <div className="flex items-start gap-3">
                                    <button
                                        onClick={() => row.active
                                            ? setDeactivating(row)
                                            : updateBadge(row.mac, {active: true})}
                                        role="switch"
                                        aria-checked={Boolean(row.active)}
                                        aria-label={row.active ? 'Disable badge' : 'Enable badge'}
                                        className="mt-0.5 shrink-0"
                                    >
                                        <motion.span
                                            className="relative block h-[14px] w-[26px] rounded-full"
                                            animate={{backgroundColor: row.active ? 'var(--color-brand)' : 'rgba(255,255,255,0.09)'}}
                                            transition={{duration: 0.2}}
                                        >
                                            <motion.span
                                                className="absolute top-[3px] h-2 w-2 rounded-full"
                                                animate={{
                                                    left: row.active ? 15 : 3,
                                                    backgroundColor: row.active ? '#0a0a0a' : 'rgba(255,255,255,0.4)',
                                                }}
                                                transition={{type: 'spring', stiffness: 600, damping: 34}}
                                            />
                                        </motion.span>
                                    </button>

                                    <div className="min-w-0 flex-1">
                                        <p className={`mono-caps truncate text-sm leading-tight ${row.active ? 'text-text' : 'text-text-3'}`}>
                                            {row.owner || 'Unassigned'}
                                        </p>
                                        <p className="mt-1.5 truncate font-mono text-xs leading-tight text-text-3">
                                            {row.mac}
                                        </p>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <p className="mono-caps text-xs leading-tight text-text-2">
                                            {!row.active ? 'Disabled'
                                                : row.live ? scannerToRoomName(row.room)
                                                    : 'Not detected'}
                                        </p>
                                        <p className="mt-1.5 font-mono text-xs tabular-nums leading-tight text-text-3">
                                            {row.live
                                                ? (row.rssi != null ? `now · ${row.rssi}` : 'now')
                                                : timeAgo(row.last_seen)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-2 flex justify-end gap-4 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                                    <button onClick={() => setEditing(row)}
                                            className="text-xs text-text-3 hover:text-brand">
                                        Edit
                                    </button>
                                    <button onClick={() => setDeleting(row)}
                                            className="text-xs text-text-3 hover:text-bad">
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence>
                {editing && (
                    <Overlay onClose={() => setEditing(null)}>
                        <form onSubmit={saveEdit}>
                            <p className="label-mono">Edit badge</p>
                            <p className="mt-2 font-mono text-xs text-text-3">{editing.mac}</p>

                            <label className="label-mono mt-5 block">Owner</label>
                            <input
                                name="owner"
                                defaultValue={editing.owner || ''}
                                autoFocus
                                className="mt-2 w-full rounded-lg border border-line bg-bg px-3 py-2 text-base text-text focus:border-line-strong focus:outline-none"
                            />

                            <label className="label-mono mt-4 block">Label</label>
                            <input
                                name="label"
                                defaultValue={editing.label || ''}
                                className="mt-2 w-full rounded-lg border border-line bg-bg px-3 py-2 text-base text-text focus:border-line-strong focus:outline-none"
                            />

                            <div className="mt-6 flex justify-end gap-2">
                                <button type="button" onClick={() => setEditing(null)}
                                        className="rounded-lg px-4 py-2.5 text-sm text-text-2 transition-colors hover:text-text">
                                    Cancel
                                </button>
                                <button type="submit"
                                        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-black">
                                    Save
                                </button>
                            </div>
                        </form>
                    </Overlay>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deactivating && (
                    <Overlay onClose={() => setDeactivating(null)}>
                        <p className="label-mono">Disable badge</p>
                        <p className="mt-4 text-base text-text">
                            {deactivating.owner}'s badge ({deactivating.label}) will be disabled.
                        </p>
                        <p className="mt-2 text-sm" style={{color: 'var(--color-warn)'}}>
                            While disabled it won't be tracked or shown on the floor map.
                        </p>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setDeactivating(null)}
                                    className="rounded-lg px-4 py-2.5 text-sm text-text-2 transition-colors hover:text-text">
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    await updateBadge(deactivating.mac, {active: false})
                                    setDeactivating(null)
                                }}
                                className="rounded-lg px-4 py-2.5 text-sm font-medium text-black"
                                style={{background: 'var(--color-warn)'}}
                            >
                                Disable
                            </button>
                        </div>
                    </Overlay>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deleting && (
                    <Overlay onClose={() => setDeleting(null)}>
                        <p className="label-mono">Delete badge</p>
                        <p className="mt-4 text-base text-text">
                            Remove {deleting.owner}'s badge ({deleting.label})?
                        </p>
                        <p className="mt-2 text-sm" style={{color: 'var(--color-bad)'}}>
                            This can't be undone. To stop tracking without losing the record, disable it instead.
                        </p>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setDeleting(null)}
                                    className="rounded-lg px-4 py-2.5 text-sm text-text-2 transition-colors hover:text-text">
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    await deleteBadge(deleting.mac)
                                    setDeleting(null)
                                }}
                                className="rounded-lg px-4 py-2.5 text-sm font-medium text-white"
                                style={{background: 'var(--color-bad)'}}
                            >
                                Delete
                            </button>
                        </div>
                    </Overlay>
                )}
            </AnimatePresence>
        </>
    )
}

function Overlay({children, onClose}) {
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
                className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-xl border border-line bg-surface-1 p-5"
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