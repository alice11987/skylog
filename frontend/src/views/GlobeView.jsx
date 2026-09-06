import { useState, useEffect, useRef, useCallback } from 'react'
import Globe from 'react-globe.gl'
import AIRPORT_COORDS from '../data/airportCoords'
import { getTrips } from '../api'

function getCoords(airport) {
  if (!airport) return null
  const pos = airport.position
  if (pos?.lat && pos?.lon) return { lat: pos.lat, lng: pos.lon }
  return AIRPORT_COORDS[airport.iata] || null
}

export default function GlobeView() {
  const globeRef = useRef()
  const containerRef = useRef()
  const [arcs, setArcs] = useState([])
  const [points, setPoints] = useState([])
  const [hovered, setHovered] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 })

  // Measure container so globe fills available width
  useEffect(() => {
    if (!containerRef.current) return
    const { offsetWidth } = containerRef.current
    setDimensions({ width: offsetWidth || 600, height: 500 })
  }, [])

  useEffect(() => {
    getTrips()
      .then((trips) => {
        const arcData = []
        const pointMap = {}

        trips.forEach((trip) => {
          const dep = trip.raw_data?.departure?.airport
          const arr = trip.raw_data?.arrival?.airport
          const from = getCoords(dep)
          const to = getCoords(arr)
          if (!from || !to) return

          arcData.push({
            id: trip.id,
            label: `${trip.flight_number}  ${trip.origin} → ${trip.destination}`,
            startLat: from.lat, startLng: from.lng,
            endLat: to.lat, endLng: to.lng,
          })

          pointMap[trip.origin] = { lat: from.lat, lng: from.lng, iata: trip.origin }
          pointMap[trip.destination] = { lat: to.lat, lng: to.lng, iata: trip.destination }
        })

        setArcs(arcData)
        setPoints(Object.values(pointMap))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Enable auto-rotate after globe mounts
  useEffect(() => {
    if (loading || arcs.length === 0) return
    const timer = setTimeout(() => {
      const globe = globeRef.current
      if (!globe) return
      globe.controls().autoRotate = true
      globe.controls().autoRotateSpeed = 0.4
    }, 500)
    return () => clearTimeout(timer)
  }, [loading, arcs])

  const arcColor = useCallback(
    (arc) => hovered?.id === arc.id ? '#60a5fa' : '#3b82f6',
    [hovered]
  )

  return (
    <div ref={containerRef} className="w-full">
      {loading && <p className="text-gray-400 text-center py-20">Loading globe…</p>}
      {error && <p className="text-red-400 text-center py-20">{error}</p>}
      {!loading && !error && arcs.length === 0 && (
        <p className="text-gray-500 text-center py-20">
          No trips with known coordinates yet — save a flight first.
        </p>
      )}
      {!loading && !error && arcs.length > 0 && (
        <div className="relative rounded-xl overflow-hidden">
          {hovered && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white shadow-lg pointer-events-none">
              {hovered.label}
            </div>
          )}
          <Globe
            ref={globeRef}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor="rgba(17,24,39,1)"
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            arcsData={arcs}
            arcColor={arcColor}
            arcAltitude={0.3}
            arcStroke={1.5}
            arcDashLength={0.6}
            arcDashGap={0.2}
            arcDashAnimateTime={2000}
            onArcHover={setHovered}
            pointsData={points}
            pointColor={() => '#ffffff'}
            pointAltitude={0.01}
            pointRadius={0.3}
            pointLabel="iata"
          />
        </div>
      )}
    </div>
  )
}
