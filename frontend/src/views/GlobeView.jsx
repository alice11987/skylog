import { useState, useEffect, useRef, useCallback } from 'react'
import Globe from 'react-globe.gl'
import { getTrips } from '../api'

// Fallback coordinates for common airports
const AIRPORT_COORDS = {
  LHR: { lat: 51.477, lng: -0.461 }, CDG: { lat: 49.013, lng: 2.550 },
  JFK: { lat: 40.640, lng: -73.779 }, LAX: { lat: 33.943, lng: -118.408 },
  SIN: { lat: 1.359, lng: 103.989 }, DXB: { lat: 25.253, lng: 55.366 },
  HKG: { lat: 22.308, lng: 113.915 }, NRT: { lat: 35.765, lng: 140.386 },
  SYD: { lat: -33.946, lng: 151.177 }, AMS: { lat: 52.310, lng: 4.768 },
  FRA: { lat: 50.033, lng: 8.571 },  MAD: { lat: 40.472, lng: -3.561 },
  BCN: { lat: 41.297, lng: 2.078 },  FCO: { lat: 41.804, lng: 12.251 },
  MUC: { lat: 48.354, lng: 11.786 }, ZRH: { lat: 47.464, lng: 8.549 },
  VIE: { lat: 48.110, lng: 16.570 }, BRU: { lat: 50.902, lng: 4.484 },
  CPH: { lat: 55.618, lng: 12.656 }, OSL: { lat: 60.194, lng: 11.100 },
  ARN: { lat: 59.652, lng: 17.919 }, HEL: { lat: 60.317, lng: 24.963 },
  IST: { lat: 40.977, lng: 28.815 }, DOH: { lat: 25.273, lng: 51.608 },
  AUH: { lat: 24.433, lng: 54.651 }, BOM: { lat: 19.089, lng: 72.868 },
  DEL: { lat: 28.556, lng: 77.100 }, BKK: { lat: 13.681, lng: 100.747 },
  KUL: { lat: 2.746, lng: 101.710 }, CGK: { lat: -6.126, lng: 106.656 },
  ICN: { lat: 37.463, lng: 126.440 }, PEK: { lat: 40.080, lng: 116.585 },
  PVG: { lat: 31.143, lng: 121.805 }, GRU: { lat: -23.432, lng: -46.469 },
  EZE: { lat: -34.822, lng: -58.536 }, MEX: { lat: 19.436, lng: -99.072 },
  YYZ: { lat: 43.677, lng: -79.631 }, ORD: { lat: 41.978, lng: -87.905 },
  ATL: { lat: 33.641, lng: -84.427 }, DFW: { lat: 32.897, lng: -97.038 },
  MIA: { lat: 25.796, lng: -80.287 }, SFO: { lat: 37.619, lng: -122.375 },
  SEA: { lat: 47.450, lng: -122.309 }, BOS: { lat: 42.365, lng: -71.010 },
  IAD: { lat: 38.944, lng: -77.456 }, BUD: { lat: 47.437, lng: 19.261 },
  WAW: { lat: 52.166, lng: 20.967 }, PRG: { lat: 50.100, lng: 14.260 },
  LIS: { lat: 38.774, lng: -9.134 }, ATH: { lat: 37.936, lng: 23.944 },
  DUB: { lat: 53.421, lng: -6.270 }, MAN: { lat: 53.354, lng: -2.275 },
  EDI: { lat: 55.950, lng: -3.373 }, GVA: { lat: 46.238, lng: 6.109 },
}

function getCoords(airport) {
  if (!airport) return null
  const pos = airport.position
  if (pos?.lat && pos?.lon) return { lat: pos.lat, lng: pos.lon }
  const fallback = AIRPORT_COORDS[airport.iata]
  return fallback || null
}

export default function GlobeView() {
  const globeRef = useRef()
  const [arcs, setArcs] = useState([])
  const [points, setPoints] = useState([])
  const [hovered, setHovered] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
            status: trip.status,
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

  // Auto-rotate
  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return
    globe.controls().autoRotate = true
    globe.controls().autoRotateSpeed = 0.4
  }, [loading])

  const arcColor = useCallback(
    (arc) => hovered?.id === arc.id ? '#60a5fa' : '#3b82f6',
    [hovered]
  )

  if (loading) return <p className="text-gray-400 text-center py-20">Loading globe…</p>
  if (error) return <p className="text-red-400 text-center py-20">{error}</p>
  if (arcs.length === 0) return (
    <p className="text-gray-500 text-center py-20">No trips saved yet — save a flight to see it on the map.</p>
  )

  return (
    <div className="relative">
      {hovered && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white shadow-lg pointer-events-none">
          {hovered.label}
        </div>
      )}
      <div className="rounded-xl overflow-hidden">
        <Globe
          ref={globeRef}
          width={672}
          height={500}
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
    </div>
  )
}
