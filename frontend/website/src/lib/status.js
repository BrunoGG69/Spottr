export const BADGE_TIMEOUT = 90

export function isBadgeOnline(badge) {
    if (!badge?.last_seen) return false
    return (Date.now() / 1000) - badge.last_seen < BADGE_TIMEOUT
}

export function isScannerOnline(scanner) {
    return scanner?.status === 'ONLINE'
}