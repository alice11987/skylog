import { useState } from 'react'
import SearchView from './views/SearchView'
import TripsView from './views/TripsView'

export default function App() {
  const [view, setView] = useState('search')

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">✈ Skylog</span>
        </div>
        <nav className="flex gap-1">
          <button
            onClick={() => setView('search')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              view === 'search'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setView('trips')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              view === 'trips'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Trips
          </button>
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {view === 'search' ? <SearchView /> : <TripsView />}
      </main>
    </div>
  )
}
