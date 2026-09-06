import StatusBadge from './StatusBadge'

function formatTime(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function FlightCard({ flight, onSave, saved = false }) {
  const dep = flight.raw_data?.departure || {}
  const arr = flight.raw_data?.arrival || {}
  const aircraft = flight.raw_data?.aircraft?.model || null
  const delay = dep.delay ? `+${dep.delay} min` : null

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-white font-bold text-lg tracking-wide">{flight.flight_number}</span>
          {aircraft && <span className="ml-2 text-gray-400 text-sm">{aircraft}</span>}
        </div>
        <StatusBadge status={flight.status} />
      </div>

      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{flight.origin}</p>
          <p className="text-gray-400 text-sm">{formatTime(dep.scheduledTime)}</p>
          {dep.gate && <p className="text-gray-500 text-xs">Gate {dep.gate}</p>}
          {dep.terminal && <p className="text-gray-500 text-xs">T{dep.terminal}</p>}
        </div>

        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 border-t border-gray-600" />
          <span className="text-gray-500 text-xs">✈</span>
          <div className="flex-1 border-t border-gray-600" />
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-white">{flight.destination}</p>
          <p className="text-gray-400 text-sm">{formatTime(arr.scheduledTime)}</p>
          {arr.gate && <p className="text-gray-500 text-xs">Gate {arr.gate}</p>}
          {arr.terminal && <p className="text-gray-500 text-xs">T{arr.terminal}</p>}
        </div>
      </div>

      {delay && (
        <p className="text-yellow-400 text-sm">Delayed by {delay}</p>
      )}

      {!saved && onSave && (
        <button
          onClick={() => onSave(flight)}
          className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-lg transition"
        >
          Save to My Trips
        </button>
      )}
    </div>
  )
}
