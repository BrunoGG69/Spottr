import {motion} from 'framer-motion'
import AnimatedNumber from './AnimatedNumber.jsx'

const STATUS = {
    ok:   'var(--color-ok)',
    warn: 'var(--color-warn)',
    bad:  'var(--color-bad)',
}

export default function StatCard({label, value, sublabel, status}) {
    const color = STATUS[status]

    return (
        <div className="rounded-xl bg-surface-1 px-4 py-3">
            <div className="flex items-center gap-2">
                <motion.span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    animate={{backgroundColor: color || 'var(--color-text-3)'}}
                    transition={{duration: 0.3}}
                />
                <p className="label-mono">{label}</p>
            </div>

            <motion.p
                className="mt-1.5 text-3xl stat-numeral"
                animate={{color: color || 'var(--color-text)'}}
                transition={{duration: 0.3}}
            >
                <AnimatedNumber value={value}/>
            </motion.p>

            {sublabel && <p className="label-mono mt-1.5">{sublabel}</p>}
        </div>
    )
}