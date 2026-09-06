import { useState } from 'react'
import { searchFlight, saveTrip } from '../api'
import FlightCard from '../components/FlightCard'

export default function SearchView() {
  const [flightNumber, setFlightNumber] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    setSaved(false)
    try {
      const data = await searchFlight(flightNumber.trim().toUpperCase(), date)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(flight) {
    try {
      await saveTrip(flight)
      setSaved(true)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          placeholder="Flight number (e.g. SQ321)"
          value={flightNumber}
          onChange={(e) => setFlightNumber(e.target.value)}
          required
          className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {result && (
        <div>
          <FlightCard flight={result} onSave={handleSave} saved={saved} />
          {saved && <p className="text-green-400 text-sm mt-2">Saved to My Trips.</p>}
        </div>
      )}
    </div>
  )
}
