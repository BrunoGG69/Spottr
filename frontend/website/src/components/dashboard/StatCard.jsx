export default function StatCard({label, value, sublabel, accent = 'cyan'}) {
    const accentClasses = {
        cyan: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
        purple: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
        amber: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
        green: 'text-green-400 border-green-500/20 bg-green-500/5',
    }

    return (
        <div className="bg-white/3 border border-white/8 rounded-xl p-4">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{label}</p>
            <p className="text-white text-2xl font-bold">{value}</p>
            {sublabel && (
                <p className={`text-[11px] mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${accentClasses[accent]}`}>
                    {sublabel}
                </p>
            )}
        </div>
    )
}