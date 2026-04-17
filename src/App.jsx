import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import iconCaffeine from './assets/images/Icon Caffeine.png'
import iconBrain from './assets/images/Icon L-T + Alpha GPC.png'
import iconA from './assets/images/a.png'
import iconB from './assets/images/b.png'
import iconC from './assets/images/c.png'
import iconMushroom from './assets/images/Icon Mushroom.png'
import boxImg from './assets/images/box.png'
import wastePlaceImg from './assets/images/wastePlace.png'
import labelImg from './assets/images/label.png'
import veloImg from './assets/images/velo.png'

function CanScene({ progressRef }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let width = mount.clientWidth
    let height = mount.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100)
    camera.position.set(0, 0, 10)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const loader = new THREE.TextureLoader()
    const makeLayer = (url, baseHeight = 3.2) => {
      const mat = new THREE.MeshBasicMaterial({
        transparent: true,
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat)
      loader.load(url, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        const aspect = tex.image.width / tex.image.height
        mesh.scale.set(baseHeight * aspect, baseHeight, 1)
        mat.map = tex
        mat.needsUpdate = true
      })
      return mesh
    }

    const box = makeLayer(boxImg)
    scene.add(box)

    const waste = makeLayer(wastePlaceImg)
    waste.position.z = 0.01
    scene.add(waste)

    const label = makeLayer(labelImg)
    label.position.z = 0.02
    scene.add(label)

    const velo = makeLayer(veloImg, 1.5)
    velo.position.set(0, -2.2, 0.05)
    velo.material.opacity = 0
    velo.material.depthTest = false
    velo.renderOrder = 10
    scene.add(velo)

    const easeInOut = (t) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

    let raf
    const tick = () => {
      const p = progressRef.current || 0

      const p1 = Math.min(1, p / 0.25)
      const eased = easeInOut(p1)

      const p2 = Math.max(0, Math.min(1, (p - 0.25) / 0.15))
      const eased2 = easeInOut(p2)

      const tilt = -eased * 0.7

      const labelAngle = eased * Math.PI * 0.5
      label.position.y = Math.sin(labelAngle) * 0.9
      label.position.z = 0.02 + (1 - Math.cos(labelAngle)) * 0.5
      label.rotation.x = tilt - eased * 0.1

      const wasteAngle = eased * Math.PI * 0.4
      waste.position.y = Math.sin(wasteAngle) * 0.4
      waste.position.z = 0.01 + (1 - Math.cos(wasteAngle)) * 0.3
      waste.rotation.x = tilt

      const boxAngle = eased * Math.PI * 0.45
      box.position.y = -Math.sin(boxAngle) * 2.2
      box.position.z = -(1 - Math.cos(boxAngle)) * 0.4
      box.rotation.x = tilt

      const boxFinalY = -Math.sin(Math.PI * 0.45) * 2.2
      const veloTargetY = -0.9
      velo.position.y = boxFinalY + eased2 * (veloTargetY - boxFinalY)
      velo.position.z = 0.05
      velo.rotation.x = tilt
      velo.material.opacity = eased2

      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    const onResize = () => {
      width = mount.clientWidth
      height = mount.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [progressRef])

  return <div ref={mountRef} className="w-full h-full" />
}

function App() {
  const progressRef = useRef(0)
  const sectionRef = useRef(null)
  const [textPhase, setTextPhase] = useState(0)
  const [stage, setStage] = useState(0)
  const [stage2, setStage2] = useState(0)

  const tab1 = stage < 0.5
  const tab2 = stage >= 0.5 && stage2 < 0.5
  const tab3 = stage2 >= 0.5

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current
      if (!el) return
      const total = el.offsetHeight - window.innerHeight
      const scrolled = -el.getBoundingClientRect().top
      const p = Math.max(0, Math.min(1, scrolled / total))
      progressRef.current = p
      setTextPhase(Math.max(0, Math.min(1, (p - 0.4) / 0.1)))
      setStage(Math.max(0, Math.min(1, (p - 0.5) / 0.25)))
      setStage2(Math.max(0, Math.min(1, (p - 0.75) / 0.25)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div ref={sectionRef} className="relative" style={{ height: '500vh' }}>
      <div className="sticky top-0 h-screen w-full bg-white px-16 py-6 flex flex-col box-border overflow-hidden">
        <h1 className="font-anton text-4xl tracking-wide text-black">
          WHAT&rsquo;S INSIDE THE PUK
        </h1>

        <div className="flex-1 grid grid-cols-2 items-center gap-4">
          <div className="relative flex flex-col gap-6 pl-4">
            <div
              className="relative"
              style={{ height: tab1 ? '220px' : '90px' }}
            >
              <div className="relative w-[90px] h-[90px] shrink-0">
                <img
                  src={iconCaffeine}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ opacity: tab1 ? 1 : 0 }}
                />
                <img
                  src={iconA}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ opacity: tab1 ? 0 : 1 }}
                />
              </div>
              <div
                className="absolute left-[110px] top-0 font-lato max-w-md text-xs leading-relaxed text-neutral-800 pointer-events-none"
                style={{ opacity: tab1 ? 1 : 0 }}
              >
                <h2 className="font-bold text-[13px] mb-1 text-black">
                  ENDURA SURGE
                </h2>
                <p className="mb-2">The OG of energy - but smarter.</p>
                <p className="mb-2">
                  <span className="font-bold">The Science of It:</span>{' '}
                  Caffeine sharpens your alertness, boosts your mood, and gives
                  you that &ldquo;let&rsquo;s go&rdquo; energy without needing a
                  giant sugary drink.
                </p>
                <p>
                  <span className="font-bold">What&rsquo;s in It for You:</span>{' '}
                  It kicks in fast and gets you focused. 30mg is the sweet spot
                  - enough to feel it, not enough to fry your brain.
                </p>
              </div>
            </div>

            <div
              className="relative"
              style={{ height: tab2 ? '220px' : '90px' }}
            >
              <div className="relative w-[90px] h-[90px] shrink-0">
                <img
                  src={iconBrain}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ opacity: tab1 ? 1 : 0 }}
                />
                <img
                  src={iconB}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ opacity: tab1 ? 0 : 1 }}
                />
              </div>
              <div
                className="absolute left-[110px] top-0 font-lato max-w-md text-xs leading-relaxed text-neutral-800 pointer-events-none"
                style={{ opacity: tab2 ? 1 : 0 }}
              >
                <h2 className="font-bold text-[13px] mb-1 text-black">
                  ENDURA IQ
                </h2>
                <p className="mb-2">The OG of energy - but smarter.</p>
                <p className="mb-2">
                  <span className="font-bold">The Science of It:</span>{' '}
                  Alpha GPC is a natural compound that helps your brain make
                  more acetylcholine (a neurotransmitter that helps you think
                  fast and learn better). Premium fuel for your mental engine.
                </p>
                <p>
                  <span className="font-bold">What&rsquo;s in It for You:</span>{' '}
                  Boosts cognitive performance and helps you stay mentally
                  dialed in.
                </p>
              </div>
            </div>

            <div
              className="relative"
              style={{ height: tab3 ? '220px' : '90px' }}
            >
              <div className="relative w-[90px] h-[90px] shrink-0">
                <img
                  src={iconMushroom}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ opacity: tab3 ? 0 : 1 }}
                />
                <img
                  src={iconC}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ opacity: tab3 ? 1 : 0 }}
                />
              </div>
              <div
                className="absolute left-[110px] top-0 font-lato max-w-md text-xs leading-relaxed text-neutral-800 pointer-events-none"
                style={{ opacity: tab3 ? 1 : 0 }}
              >
                <h2 className="font-bold text-[13px] mb-1 text-black">
                  ENDURA FLOW
                </h2>
                <p className="mb-2">The OG of energy - but smarter.</p>
                <p className="mb-2">
                  <span className="font-bold">The Science of It:</span>{' '}
                  Caffeine sharpens your alertness, boosts your mood, and gives
                  you that &ldquo;let&rsquo;s go&rdquo; energy without needing a
                  giant sugary drink.
                </p>
                <p>
                  <span className="font-bold">What&rsquo;s in It for You:</span>{' '}
                  It kicks in fast and gets you focused. 30mg is the sweet spot
                  - enough to feel it, not enough to fry your brain.
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-[60vh] w-full">
            <CanScene progressRef={progressRef} />
            <div
              className="absolute inset-0 pointer-events-none font-lato text-sm text-neutral-800"
              style={{ opacity: textPhase }}
            >
              <div style={{ opacity: tab1 ? 1 : 0 }}>
                <span
                  className="absolute left-9 top-72 whitespace-nowrap"
                  style={{
                    transform: `translateY(-50%) translateX(${(1 - textPhase) * -20}px)`,
                  }}
                >
                  50mg Caffeine Anhydrous
                </span>
                <span
                  className="absolute right-49 top-[58%] whitespace-nowrap"
                  style={{ transform: `translateX(${(1 - textPhase) * 20}px)` }}
                >
                  No Sugar
                </span>
                <span
                  className="absolute right-34 top-[68%] whitespace-nowrap"
                  style={{ transform: `translateX(${(1 - textPhase) * 20}px)` }}
                >
                  No Crash
                </span>
              </div>
              <div style={{ opacity: tab2 ? 1 : 0 }}>
                <span
                  className="absolute left-9 top-72 whitespace-nowrap"
                  style={{
                    transform: `translateY(-50%) translateX(${(1 - textPhase) * -20}px)`,
                  }}
                >
                  50mg Caffeine
                </span>
                <span
                  className="absolute right-49 top-[58%] whitespace-nowrap"
                  style={{ transform: `translateX(${(1 - textPhase) * 20}px)` }}
                >
                  50mg Alpha GPC
                </span>
                <span
                  className="absolute right-34 top-[68%] whitespace-nowrap"
                  style={{ transform: `translateX(${(1 - textPhase) * 20}px)` }}
                >
                  50mg L-Theanine
                </span>
              </div>
              <div style={{ opacity: tab3 ? 1 : 0 }}>
                <span
                  className="absolute left-9 top-64 whitespace-nowrap"
                  style={{ transform: `translateY(-50%) translateX(${(1 - textPhase) * -20}px)` }}
                >
                  50mg Alpha GPC
                </span>
                <span
                  className="absolute left-9 top-80 whitespace-nowrap"
                  style={{ transform: `translateY(-50%) translateX(${(1 - textPhase) * -20}px)` }}
                >
                  10mg Lion&rsquo;s Mane
                </span>
                <span
                  className="absolute right-16 top-[54%] whitespace-nowrap"
                  style={{ transform: `translateX(${(1 - textPhase) * 20}px)` }}
                >
                  2mg Vitamin B6
                </span>
                <span
                  className="absolute right-8 top-[66%] whitespace-nowrap"
                  style={{ transform: `translateX(${(1 - textPhase) * 20}px)` }}
                >
                  100mcg Vitamin B12
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
