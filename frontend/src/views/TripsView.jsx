import { useState, useEffect } from 'react'
import { getTrips, deleteTrip, refreshTrip } from '../api'
import StatusBadge from '../components/StatusBadge'
import FlightCard from '../components/FlightCard'

export default function TripsView() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [refreshing, setRefreshing] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const data = await getTrips()
      setTrips(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTrip(id)
      setTrips((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleRefresh(id) {
    setRefreshing(id)
    try {
      const res = await refreshTrip(id)
      setTrips((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: res.status } : t))
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setRefreshing(null)
    }
  }

  if (loading) return <p className="text-gray-400">Loading trips…</p>
  if (error) return <p className="text-red-400">{error}</p>
  if (trips.length === 0) return <p className="text-gray-500">No trips saved yet. Search for a flight to get started.</p>

  return (
    <div className="space-y-3">
      {trips.map((trip) => (
        <div key={trip.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div
            className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-750"
            onClick={() => setExpanded(expanded === trip.id ? null : trip.id)}
          >
            <div className="flex items-center gap-4">
              <span className="text-white font-bold tracking-wide">{trip.flight_number}</span>
              <span className="text-gray-400 text-sm">{trip.origin} → {trip.destination}</span>
              <span className="text-gray-500 text-sm">{trip.date}</span>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={trip.status} />
              <button
                onClick={(e) => { e.stopPropagation(); handleRefresh(trip.id) }}
                disabled={refreshing === trip.id}
                className="text-gray-400 hover:text-blue-400 text-xs transition disabled:opacity-50"
              >
                {refreshing === trip.id ? 'Refreshing…' : '↻ Refresh'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(trip.id) }}
                className="text-gray-500 hover:text-red-400 text-xs transition"
              >
                Remove
              </button>
            </div>
          </div>

          {expanded === trip.id && (
            <div className="px-5 pb-5 border-t border-gray-700 pt-4">
              <FlightCard flight={trip} saved />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
