import { useState } from 'react'
import SearchView from './views/SearchView'
import TripsView from './views/TripsView'
import GlobeView from './views/GlobeView'

export default function App() {
  const [view, setView] = useState('search')

  const navBtn = (id, label) => (
    <button
      onClick={() => setView(id)}
      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
        view === id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight">✈ Skylog</span>
        <nav className="flex gap-1">
          {navBtn('search', 'Search')}
          {navBtn('trips', 'My Trips')}
          {navBtn('map', 'Map')}
        </nav>
      </header>

      {view === 'map' ? (
        <main className="max-w-3xl mx-auto px-6 py-8">
          <GlobeView />
        </main>
      ) : (
        <main className="max-w-2xl mx-auto px-6 py-8">
          {view === 'search' ? <SearchView /> : <TripsView />}
        </main>
      )}
    </div>
  )
}
