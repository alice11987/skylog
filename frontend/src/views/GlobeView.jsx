import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import AIRPORT_COORDS from '../data/airportCoords'
import { getTrips } from '../api'

function latLngToVec3(lat, lng, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  )
}

function buildArc(fromCoords, toCoords) {
  const start = latLngToVec3(fromCoords.lat, fromCoords.lng, 1.001)
  const end   = latLngToVec3(toCoords.lat,   toCoords.lng,   1.001)
  const mid   = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
  const dist  = start.distanceTo(end)
  mid.normalize().multiplyScalar(1 + dist * 0.35)
  const curve    = new THREE.QuadraticBezierCurve3(start, mid, end)
  const points   = curve.getPoints(60)
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({ color: 0x3b82f6 })
  return new THREE.Line(geometry, material)
}

function buildDot(lat, lng) {
  const geo = new THREE.SphereGeometry(0.009, 8, 8)
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const dot = new THREE.Mesh(geo, mat)
  dot.position.copy(latLngToVec3(lat, lng, 1.012))
  return dot
}

function getCoords(airport) {
  if (!airport) return null
  if (airport.position?.lat && airport.position?.lon)
    return { lat: airport.position.lat, lng: airport.position.lon }
  return AIRPORT_COORDS[airport.iata] || null
}

export default function GlobeView() {
  const mountRef = useRef()
  const [status, setStatus] = useState('loading') // loading | empty | ready | error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let animId
    let cancelled = false
    const container = mountRef.current
    if (!container) return

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, 500)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Scene & camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / 500, 0.1, 100)
    camera.position.z = 2.6

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.4
    controls.minDistance = 1.4
    controls.maxDistance = 5

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const sun = new THREE.DirectionalLight(0xffffff, 0.8)
    sun.position.set(5, 3, 5)
    scene.add(sun)

    // Globe
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('//unpkg.com/three-globe/example/img/earth-night.jpg'),
      })
    )
    scene.add(sphere)

    // Animate loop
    const animate = () => {
      animId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Load trips and add arcs
    getTrips()
      .then((trips) => {
        if (cancelled) return
        const valid = trips.filter((t) => {
          const from = getCoords(t.raw_data?.departure?.airport)
          const to   = getCoords(t.raw_data?.arrival?.airport)
          return from && to
        })
        if (valid.length === 0) { setStatus('empty'); return }
        const seen = new Set()
        valid.forEach((trip) => {
          const from = getCoords(trip.raw_data.departure.airport)
          const to   = getCoords(trip.raw_data.arrival.airport)
          scene.add(buildArc(from, to))
          if (!seen.has(trip.origin))      { scene.add(buildDot(from.lat, from.lng)); seen.add(trip.origin) }
          if (!seen.has(trip.destination)) { scene.add(buildDot(to.lat,   to.lng));   seen.add(trip.destination) }
        })
        setStatus('ready')
      })
      .catch((err) => { if (!cancelled) { setErrorMsg(err.message); setStatus('error') } })

    return () => {
      cancelled = true
      cancelAnimationFrame(animId)
      controls.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div>
      {status === 'loading' && <p className="text-gray-400 text-center py-6">Loading globe…</p>}
      {status === 'error'   && <p className="text-red-400 text-center py-6">{errorMsg}</p>}
      {status === 'empty'   && <p className="text-gray-500 text-center py-6">No trips saved yet — save a flight to see it on the map.</p>}
      <div ref={mountRef} className="rounded-xl overflow-hidden" />
    </div>
  )
}
