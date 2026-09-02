import { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { MathUtils, Vector3 } from 'three'
import type { Group, Object3D } from 'three'
import './InteractiveCity.css'

type BuildingProps = {
  position: [number, number, number]
  scale: [number, number, number]
  color?: string
}

function Building({
  position,
  scale,
  color = '#17233f',
}: BuildingProps) {
  return (
    <mesh position={position} scale={scale}>
      <boxGeometry />
      <meshStandardMaterial
        color={color}
        roughness={0.75}
        metalness={0.15}
      />
    </mesh>
  )
}

function Car() {
  const carRef = useRef<Group>(null)
  const pressedKeys = useRef(new Set<string>())
  const currentSpeed = useRef(0)
  const wheels = useRef<Object3D[]>([])
  const desiredCameraPosition = useRef(new Vector3())
  const { scene } = useGLTF('/models/vehicle-speedster.glb')

  useEffect(() => {
    const wheelNames = ['wheel-fl', 'wheel-fr', 'wheel-bl', 'wheel-br']

    wheels.current = wheelNames
      .map((wheelName) => scene.getObjectByName(wheelName))
      .filter((wheel): wheel is Object3D => wheel !== undefined)
  }, [scene])

  useEffect(() => {
    const movementKeys = [
      'arrowup',
      'arrowdown',
      'arrowleft',
      'arrowright',
      'w',
      'a',
      's',
      'd',
    ]

    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase()

      if (movementKeys.includes(key)) {
        event.preventDefault()
        pressedKeys.current.add(key)
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      pressedKeys.current.delete(event.key.toLowerCase())
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(({ camera }, delta) => {
    const car = carRef.current

    if (!car) {
      return
    }

    const movingLeft =
      pressedKeys.current.has('arrowleft') ||
      pressedKeys.current.has('a')

    const movingRight =
      pressedKeys.current.has('arrowright') ||
      pressedKeys.current.has('d')

    const movingForward =
      pressedKeys.current.has('arrowup') ||
      pressedKeys.current.has('w')

    const movingBackward =
      pressedKeys.current.has('arrowdown') ||
      pressedKeys.current.has('s')

    const throttleDirection =
      Number(movingForward) - Number(movingBackward)

    const steeringDirection =
      Number(movingLeft) - Number(movingRight)

    const maxForwardSpeed = 5.5
    const maxReverseSpeed = 2.4
    const acceleration = 4.5
    const reverseAcceleration = 3.2
    const braking = 8
    const rollingResistance = 2.2
    const turningSpeed = 1.9

    let targetSpeed = 0
    let speedChange = rollingResistance

    if (throttleDirection > 0) {
      targetSpeed = maxForwardSpeed
      speedChange = currentSpeed.current < 0 ? braking : acceleration
    } else if (throttleDirection < 0) {
      targetSpeed = -maxReverseSpeed
      speedChange =
        currentSpeed.current > 0 ? braking : reverseAcceleration
    }

    const speedDifference = targetSpeed - currentSpeed.current
    const maximumSpeedChange = speedChange * delta

    currentSpeed.current += MathUtils.clamp(
      speedDifference,
      -maximumSpeedChange,
      maximumSpeedChange,
    )

    const absoluteSpeed = Math.abs(currentSpeed.current)

    if (absoluteSpeed > 0.01) {
      const speedRatio = MathUtils.clamp(
        absoluteSpeed / maxForwardSpeed,
        0,
        1,
      )
      const steeringResponse = MathUtils.lerp(0.35, 1, speedRatio)
      const travelDirection = Math.sign(currentSpeed.current)

      car.rotation.y +=
        steeringDirection *
        turningSpeed *
        delta *
        travelDirection *
        steeringResponse

      const forwardX = Math.cos(car.rotation.y)
      const forwardZ = -Math.sin(car.rotation.y)

      car.position.x +=
        forwardX * currentSpeed.current * delta

      car.position.z +=
        forwardZ * currentSpeed.current * delta

      const wheelRotation = (currentSpeed.current * delta) / 0.275

      wheels.current.forEach((wheel) => {
        wheel.rotation.x -= wheelRotation
      })
    }

    car.position.x = MathUtils.clamp(car.position.x, -8, 8)
    car.position.z = MathUtils.clamp(car.position.z, -8, 8)

    const forwardX = Math.cos(car.rotation.y)
    const forwardZ = -Math.sin(car.rotation.y)

    desiredCameraPosition.current.set(
      car.position.x - forwardX * 6,
      car.position.y + 3.2,
      car.position.z - forwardZ * 6,
    )

    camera.position.lerp(
      desiredCameraPosition.current,
      1 - Math.pow(0.001, delta),
    )

    camera.lookAt(
      car.position.x,
      car.position.y + 0.5,
      car.position.z,
    )
  })

  return (
    <group
      ref={carRef}
      position={[0, 0.02, 2]}
      rotation={[0, Math.PI / 2, 0]}
    >
      <primitive
        object={scene}
        scale={2.2}
        rotation={[0, -Math.PI / 2, 0]}
      />
    </group>
  )
}

useGLTF.preload('/models/vehicle-speedster.glb')

function CityScene() {
  return (
    <>
      <color attach="background" args={['#080c1d']} />
      <fog attach="fog" args={['#080c1d', 8, 28]} />

      <ambientLight intensity={0.7} />

      <directionalLight
        position={[5, 9, 5]}
        intensity={2}
        color="#b8dfff"
      />

      <pointLight
        position={[-4, 3, 2]}
        intensity={18}
        distance={12}
        color="#ff789f"
      />

      <pointLight
        position={[4, 3, -2]}
        intensity={18}
        distance={12}
        color="#65e6f3"
      />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial
          color="#0e1428"
          roughness={0.3}
          metalness={0.25}
        />
      </mesh>

      {/* Placeholder city buildings */}
      <Building position={[-4, 1.5, -3]} scale={[2, 3, 2]} />
      <Building
        position={[-1.5, 2.5, -5]}
        scale={[2, 5, 2]}
        color="#1b2949"
      />
      <Building position={[1.5, 1.8, -4]} scale={[2, 3.6, 2]} />
      <Building
        position={[4, 3, -6]}
        scale={[2.2, 6, 2.2]}
        color="#192844"
      />

      <Car />

    </>
  )
}

function InteractiveCity() {
  return (
    <main className="interactive-city-page">
      <div className="interactive-city-canvas">
        <Canvas camera={{ position: [0, 5, 10], fov: 48 }}>
          <CityScene />
        </Canvas>
      </div>
    </main>
  )
}

export default InteractiveCity
