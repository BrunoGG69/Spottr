import {ref, set, update, remove} from 'firebase/database'
import {db} from '../firebase.js'

export function normalizeMac(mac) {
    return mac.trim().toLowerCase()
}

export function macToLocationKey(mac) {
    return normalizeMac(mac).replaceAll(':', '_')
}

export async function addBadge(mac, owner, label) {
    await set(ref(db, `badges/${normalizeMac(mac)}`), {
        owner: owner.trim(),
        label: label.trim(),
        active: true,
    })
}

export async function updateBadge(mac, fields) {
    await update(ref(db, `badges/${mac}`), fields)
}

export async function deleteBadge(mac) {
    await remove(ref(db, `badges/${mac}`))
    await remove(ref(db, `badge_location/${macToLocationKey(mac)}`))
}

export function matchesQuery(mac, badge, query) {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return [badge.owner, badge.label, mac].some(v =>
        String(v || '').toLowerCase().includes(q)
    )
}