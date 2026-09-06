const colours = {
  'On Time': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Delayed': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Cancelled': 'bg-red-500/20 text-red-400 border-red-500/30',
  'In Flight': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Landed': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

export default function StatusBadge({ status }) {
  const cls = colours[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {status || 'Unknown'}
    </span>
  )
}
