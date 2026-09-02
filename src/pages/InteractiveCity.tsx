import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import {
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from '@react-three/rapier'
import { MathUtils, Quaternion, Raycaster, Vector3 } from 'three'
import type { Group, Object3D } from 'three'
import {
  cityDestinations,
  districtDefinitions,
  type CityDestination,
} from '../data/cityDestinations'
import './InteractiveCity.css'

type BuildingProps = {
  position: [number, number, number]
  scale: [number, number, number]
  color?: string
  isOcclusionRoot?: boolean
}

type RoadProps = {
  position: [number, number]
  length: number
  orientation: 'horizontal' | 'vertical'
}

function Road({ position, length, orientation }: RoadProps) {
  const roadSize: [number, number] =
    orientation === 'horizontal' ? [length, 6] : [6, length]

  const lineSize: [number, number] =
    orientation === 'horizontal' ? [length, 0.08] : [0.08, length]

  return (
    <group>
      <mesh
        position={[position[0], 0.025, position[1]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={roadSize} />
        <meshStandardMaterial
          color="#080b15"
          roughness={0.42}
          metalness={0.18}
        />
      </mesh>

      <mesh
        position={[position[0], 0.035, position[1]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={lineSize} />
        <meshBasicMaterial color="#ba9b58" transparent opacity={0.55} />
      </mesh>
    </group>
  )
}

function Building({
  position,
  scale,
  color = '#17233f',
  isOcclusionRoot = true,
}: BuildingProps) {
  const building = (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh
        position={position}
        scale={scale}
        userData={{ cameraOccluder: true }}
      >
        <boxGeometry />
        <meshStandardMaterial
          color={color}
          roughness={0.75}
          metalness={0.15}
        />
      </mesh>
    </RigidBody>
  )

  if (!isOcclusionRoot) {
    return building
  }

  return (
    <group userData={{ cameraOccluderRoot: true }}>
      {building}
    </group>
  )
}

function FacadeWindow({
  position,
  color,
  width = 1.05,
  height = 1.3,
}: {
  position: [number, number, number]
  color: string
  width?: number
  height?: number
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, 0.08]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.75}
        roughness={0.25}
      />
    </mesh>
  )
}

function LitEntrance({
  position,
  color,
}: {
  position: [number, number, number]
  color: string
}) {
  return (
    <group>
      <mesh position={position}>
        <boxGeometry args={[1.45, 2.45, 0.12]} />
        <meshStandardMaterial
          color="#10182d"
          emissive={color}
          emissiveIntensity={0.38}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[position[0], position[1], position[2] + 0.08]}>
        <boxGeometry args={[1.05, 2.05, 0.08]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.1}
          roughness={0.18}
        />
      </mesh>
      <pointLight
        position={[position[0], position[1] + 0.2, position[2] + 1.1]}
        color={color}
        intensity={7}
        distance={5}
      />
    </group>
  )
}

function ArrivalMarker({
  position,
  color,
}: {
  position: [number, number, number]
  color: string
}) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.65, 1, 40]} />
      <meshBasicMaterial color={color} transparent opacity={0.7} />
    </mesh>
  )
}

function ResonanceDetails({ destination }: { destination: CityDestination }) {
  const [buildingX, buildingY, buildingZ] = destination.buildingPosition
  const [, buildingHeight, buildingDepth] = destination.buildingScale
  const facadeZ = buildingZ + buildingDepth / 2 + 0.06
  const roofY = buildingY + buildingHeight / 2
  const windowColumns = [-1.75, 0, 1.75]
  const windowRows = [2.35, 4.75, 7.15]
  const equalizerHeights = [0.65, 1.15, 0.85, 1.4, 0.75]

  return (
    <group>
      {windowRows.flatMap((row, rowIndex) =>
        windowColumns.map((column, columnIndex) => (
          <FacadeWindow
            position={[buildingX + column, row, facadeZ]}
            color={(rowIndex + columnIndex) % 2 === 0 ? '#65e6f3' : '#ff70a5'}
            key={`${row}-${column}`}
          />
        )),
      )}

      <LitEntrance
        position={[buildingX, 1.23, facadeZ + 0.02]}
        color="#65e6f3"
      />

      {equalizerHeights.map((height, index) => (
        <mesh
          position={[
            buildingX - 1.4 + index * 0.7,
            roofY + height / 2,
            buildingZ,
          ]}
          key={`${height}-${index}`}
        >
          <boxGeometry args={[0.28, height, 0.35]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? '#65e6f3' : '#ff70a5'}
            emissive={index % 2 === 0 ? '#65e6f3' : '#ff70a5'}
            emissiveIntensity={1.2}
          />
        </mesh>
      ))}

      <ArrivalMarker
        position={[
          destination.entrancePosition[0],
          0.07,
          destination.entrancePosition[2],
        ]}
        color="#65e6f3"
      />
    </group>
  )
}

function LedgerPilotDetails({ destination }: { destination: CityDestination }) {
  const [buildingX, buildingY, buildingZ] = destination.buildingPosition
  const [, buildingHeight, buildingDepth] = destination.buildingScale
  const facadeZ = buildingZ + buildingDepth / 2 + 0.06
  const roofY = buildingY + buildingHeight / 2
  const windowColumns = [-1.7, 0, 1.7]
  const windowRows = [2.25, 4.6]

  return (
    <group>
      {windowRows.flatMap((row) =>
        windowColumns.map((column) => (
          <FacadeWindow
            position={[buildingX + column, row, facadeZ]}
            color="#e1ad59"
            width={1.08}
            height={1.15}
            key={`${row}-${column}`}
          />
        )),
      )}

      {[1.55, 3.4, 5.75].map((row) => (
        <mesh position={[buildingX, row, facadeZ + 0.07]} key={row}>
          <boxGeometry args={[5.1, 0.07, 0.06]} />
          <meshBasicMaterial color="#65e6f3" />
        </mesh>
      ))}

      <LitEntrance
        position={[buildingX, 1.23, facadeZ + 0.12]}
        color="#e1ad59"
      />

      <mesh position={[buildingX, roofY + 0.85, buildingZ]}>
        <torusGeometry args={[0.72, 0.12, 14, 48]} />
        <meshStandardMaterial
          color="#e1ad59"
          emissive="#e1ad59"
          emissiveIntensity={1.15}
          metalness={0.45}
        />
      </mesh>

      <ArrivalMarker
        position={[
          destination.entrancePosition[0],
          0.07,
          destination.entrancePosition[2],
        ]}
        color="#e1ad59"
      />
    </group>
  )
}

function Landmark({ destination }: { destination: CityDestination }) {
  return (
    <group userData={{ cameraOccluderRoot: true }}>
      <Building
        position={destination.buildingPosition}
        scale={destination.buildingScale}
        color={destination.color}
        isOcclusionRoot={false}
      />

      {destination.id === 'resonance' && (
        <ResonanceDetails destination={destination} />
      )}

      {destination.id === 'ledgerpilot' && (
        <LedgerPilotDetails destination={destination} />
      )}
    </group>
  )
}

function StartPortal() {
  return (
    <group position={[0, 3.1, 54]}>
      <mesh>
        <torusGeometry args={[2.6, 0.2, 18, 72]} />
        <meshStandardMaterial
          color="#65e6f3"
          emissive="#287887"
          emissiveIntensity={2.8}
          roughness={0.2}
          metalness={0.45}
        />
      </mesh>
      <pointLight color="#65e6f3" intensity={20} distance={12} />
      <pointLight
        position={[0, -1.2, 0.5]}
        color="#ff70a5"
        intensity={12}
        distance={9}
      />
    </group>
  )
}

type DirectionSignProps = {
  position: [number, number, number]
  title: string
  directions: Array<{
    arrow: string
    label: string
  }>
}

function DirectionSign({
  position,
  title,
  directions,
}: DirectionSignProps) {
  return (
    <group position={position}>
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 2.3, 12]} />
        <meshStandardMaterial
          color="#78869a"
          roughness={0.45}
          metalness={0.65}
        />
      </mesh>

      <Html position={[0, 2.45, 0]} center distanceFactor={13}>
        <div className="city-direction-sign">
          <span>{title}</span>
          {directions.map((direction) => (
            <div
              className="city-direction-row"
              key={`${direction.arrow}-${direction.label}`}
            >
              <b aria-hidden="true">{direction.arrow}</b>
              <strong>{direction.label}</strong>
            </div>
          ))}
        </div>
      </Html>
    </group>
  )
}

const backgroundBuildings: BuildingProps[] = [
  { position: [-53, 4, -42], scale: [8, 8, 8] },
  { position: [-53, 6, -20], scale: [8, 12, 10], color: '#162541' },
  { position: [-53, 3.5, 3], scale: [8, 7, 10] },
  { position: [-53, 7, 25], scale: [8, 14, 10], color: '#1a2948' },
  { position: [-53, 4.5, 47], scale: [8, 9, 8] },
  { position: [53, 6.5, -42], scale: [8, 13, 8], color: '#172845' },
  { position: [53, 4, -20], scale: [8, 8, 10] },
  { position: [53, 7.5, 3], scale: [8, 15, 10], color: '#1a2b4b' },
  { position: [53, 4.5, 25], scale: [8, 9, 10] },
  { position: [53, 6, 47], scale: [8, 12, 8], color: '#182743' },
  { position: [-42, 5, -53], scale: [8, 10, 8] },
  { position: [-20, 7, -53], scale: [10, 14, 8], color: '#1a2948' },
  { position: [3, 4, -53], scale: [10, 8, 8] },
  { position: [25, 6, -53], scale: [10, 12, 8], color: '#172845' },
  { position: [47, 4.5, -53], scale: [8, 9, 8] },
]

type CarProps = {
  onNearbyDestinationChange: (destination: CityDestination | null) => void
  onExploreDestination: (destination: CityDestination) => void
  onCurrentAreaChange: (area: string) => void
  isDestinationOpen: boolean
  onCloseDestination: () => void
}

function getCurrentArea(x: number, z: number) {
  if (z > 43 && Math.abs(x) < 8) {
    return 'Portal Gate'
  }

  if (Math.abs(x) < 7 && Math.abs(z) < 7) {
    return 'Central Plaza'
  }

  if (Math.abs(x) < 4) {
    return 'Central Avenue'
  }

  if (Math.abs(z) < 4) {
    return 'Central Crossroads'
  }

  if (x < 0 && z < 0) {
    return 'Experience District'
  }

  if (x >= 0 && z < 0) {
    return 'Projects District'
  }

  if (x < 0) {
    return 'Hobbies District'
  }

  return 'About District'
}

function Car({
  onNearbyDestinationChange,
  onExploreDestination,
  onCurrentAreaChange,
  isDestinationOpen,
  onCloseDestination,
}: CarProps) {
  const carRef = useRef<RapierRigidBody>(null)
  const carVisualRef = useRef<Group>(null)
  const pressedKeys = useRef(new Set<string>())
  const currentSpeed = useRef(0)
  const heading = useRef(Math.PI / 2)
  const wheels = useRef<Object3D[]>([])
  const nearbyDestination = useRef<CityDestination | null>(null)
  const currentArea = useRef('Portal Gate')
  const desiredCameraPosition = useRef(new Vector3())
  const desiredCameraTarget = useRef(new Vector3())
  const cameraTarget = useRef(new Vector3())
  const renderedCarPosition = useRef(new Vector3())
  const cameraRayOrigin = useRef(new Vector3())
  const cameraRayDirection = useRef(new Vector3())
  const cameraRaycaster = useRef(new Raycaster())
  const hiddenOccluders = useRef<Object3D[]>([])
  const desiredCarRotation = useRef(new Quaternion())
  const upAxis = useRef(new Vector3(0, 1, 0))
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

      if ((key === 'e' || key === 'escape') && isDestinationOpen) {
        event.preventDefault()
        onCloseDestination()
        return
      }

      if (key === 'e' && nearbyDestination.current) {
        event.preventDefault()
        onExploreDestination(nearbyDestination.current)
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
  }, [isDestinationOpen, onCloseDestination, onExploreDestination])

  useFrame(({ camera, scene: cityScene }, delta) => {
    const carBody = carRef.current

    if (!carBody) {
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

    const maxForwardSpeed = 8
    const maxReverseSpeed = 3.2
    const acceleration = 5.5
    const reverseAcceleration = 3.8
    const braking = 9
    const rollingResistance = 8
    const turningSpeed = 1.75

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

    if (throttleDirection === 0 && Math.abs(currentSpeed.current) < 0.12) {
      currentSpeed.current = 0
    }

    const absoluteSpeed = Math.abs(currentSpeed.current)

    if (absoluteSpeed > 0.01) {
      const speedRatio = MathUtils.clamp(
        absoluteSpeed / maxForwardSpeed,
        0,
        1,
      )
      const steeringResponse = MathUtils.lerp(0.35, 1, speedRatio)
      const travelDirection = Math.sign(currentSpeed.current)

      heading.current +=
        steeringDirection *
        turningSpeed *
        delta *
        travelDirection *
        steeringResponse

      const forwardX = Math.cos(heading.current)
      const forwardZ = -Math.sin(heading.current)
      const verticalSpeed = carBody.linvel().y

      carBody.setLinvel(
        {
          x: forwardX * currentSpeed.current,
          y: verticalSpeed,
          z: forwardZ * currentSpeed.current,
        },
        true,
      )

      desiredCarRotation.current.setFromAxisAngle(
        upAxis.current,
        heading.current,
      )
      carBody.setRotation(desiredCarRotation.current, true)

      const wheelRotation = (currentSpeed.current * delta) / 0.275

      wheels.current.forEach((wheel) => {
        wheel.rotation.x -= wheelRotation
      })
    } else {
      const verticalSpeed = carBody.linvel().y
      carBody.setLinvel({ x: 0, y: verticalSpeed, z: 0 }, true)
    }

    const carPosition = carBody.translation()
    const boundedX = MathUtils.clamp(carPosition.x, -52, 52)
    const boundedZ = MathUtils.clamp(carPosition.z, -52, 52)

    if (boundedX !== carPosition.x || boundedZ !== carPosition.z) {
      carBody.setTranslation(
        { x: boundedX, y: carPosition.y, z: boundedZ },
        true,
      )
      currentSpeed.current = 0
    }

    let closestDestination: CityDestination | null = null
    let closestDistanceSquared = 4.2 ** 2

    for (const destination of cityDestinations) {
      const deltaX = carPosition.x - destination.entrancePosition[0]
      const deltaZ = carPosition.z - destination.entrancePosition[2]
      const distanceSquared = deltaX ** 2 + deltaZ ** 2

      if (distanceSquared < closestDistanceSquared) {
        closestDestination = destination
        closestDistanceSquared = distanceSquared
      }
    }

    if (nearbyDestination.current?.id !== closestDestination?.id) {
      nearbyDestination.current = closestDestination
      onNearbyDestinationChange(closestDestination)
    }

    const nextArea = getCurrentArea(carPosition.x, carPosition.z)

    if (currentArea.current !== nextArea) {
      currentArea.current = nextArea
      onCurrentAreaChange(nextArea)
    }

    const forwardX = Math.cos(heading.current)
    const forwardZ = -Math.sin(heading.current)

    const carVisual = carVisualRef.current

    if (carVisual) {
      carVisual.getWorldPosition(renderedCarPosition.current)

      desiredCameraPosition.current.set(
        renderedCarPosition.current.x - forwardX * 12,
        renderedCarPosition.current.y + 7.34,
        renderedCarPosition.current.z - forwardZ * 12,
      )
      desiredCameraTarget.current.set(
        renderedCarPosition.current.x + forwardX * 3.5,
        renderedCarPosition.current.y + 0.74,
        renderedCarPosition.current.z + forwardZ * 3.5,
      )

      const cameraFollowAmount = 1 - Math.pow(0.001, delta)
      const cameraLookAmount = 1 - Math.pow(0.0001, delta)

      camera.position.lerp(
        desiredCameraPosition.current,
        cameraFollowAmount,
      )
      cameraTarget.current.lerp(
        desiredCameraTarget.current,
        cameraLookAmount,
      )
      camera.lookAt(cameraTarget.current)

      hiddenOccluders.current.forEach((occluder) => {
        occluder.visible = true
      })
      hiddenOccluders.current = []

      cameraRayOrigin.current.set(
        renderedCarPosition.current.x,
        renderedCarPosition.current.y + 0.84,
        renderedCarPosition.current.z,
      )
      cameraRayDirection.current
        .copy(camera.position)
        .sub(cameraRayOrigin.current)

      const cameraDistance = cameraRayDirection.current.length()

      cameraRayDirection.current.normalize()
      cameraRaycaster.current.set(
        cameraRayOrigin.current,
        cameraRayDirection.current,
      )
      cameraRaycaster.current.far = Math.max(cameraDistance - 0.5, 0)

      const intersections = cameraRaycaster.current.intersectObjects(
        cityScene.children,
        true,
      )
      const occludersToHide = new Set<Object3D>()

      intersections.forEach((intersection) => {
        if (!intersection.object.userData.cameraOccluder) {
          return
        }

        let occluderRoot: Object3D | null = intersection.object

        while (
          occluderRoot.parent &&
          !occluderRoot.userData.cameraOccluderRoot
        ) {
          occluderRoot = occluderRoot.parent
        }

        if (occluderRoot.userData.cameraOccluderRoot) {
          occludersToHide.add(occluderRoot)
        }
      })

      occludersToHide.forEach((occluder) => {
        occluder.visible = false
        hiddenOccluders.current.push(occluder)
      })
    }
  })

  return (
    <RigidBody
      ref={carRef}
      position={[0, 0.42, 48]}
      rotation={[0, Math.PI / 2, 0]}
      colliders={false}
      enabledRotations={[false, false, false]}
      linearDamping={1.2}
      canSleep={false}
    >
      <CuboidCollider args={[0.52, 0.3, 0.9]} position={[0, 0.28, 0]} />

      <group ref={carVisualRef} position={[0, -0.34, 0]}>
        <primitive
          object={scene}
          scale={2.2}
          rotation={[0, -Math.PI / 2, 0]}
        />
      </group>
    </RigidBody>
  )
}

useGLTF.preload('/models/vehicle-speedster.glb')

type CitySceneProps = {
  onNearbyDestinationChange: (destination: CityDestination | null) => void
  onExploreDestination: (destination: CityDestination) => void
  onCurrentAreaChange: (area: string) => void
  isDestinationOpen: boolean
  onCloseDestination: () => void
}

function CityScene({
  onNearbyDestinationChange,
  onExploreDestination,
  onCurrentAreaChange,
  isDestinationOpen,
  onCloseDestination,
}: CitySceneProps) {
  const roadCoordinates = [-42, -21, 0, 21, 42]

  return (
    <>
      <color attach="background" args={['#080c1d']} />
      <fog attach="fog" args={['#080c1d', 34, 105]} />

      <ambientLight intensity={0.85} />

      <directionalLight
        position={[12, 18, 10]}
        intensity={2.4}
        color="#b8dfff"
      />

      <pointLight
        position={[-25, 8, -25]}
        intensity={34}
        distance={36}
        color="#e1ad59"
      />
      <pointLight
        position={[25, 8, -25]}
        intensity={34}
        distance={36}
        color="#65e6f3"
      />
      <pointLight
        position={[-25, 8, 25]}
        intensity={32}
        distance={36}
        color="#ff70a5"
      />
      <pointLight
        position={[25, 8, 25]}
        intensity={30}
        distance={36}
        color="#9c87eb"
      />

      {/* The visible ground and its invisible physics floor */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[59, 0.05, 59]} position={[0, -0.05, 0]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[118, 118]} />
          <meshStandardMaterial
            color="#10172b"
            roughness={0.72}
            metalness={0.08}
          />
        </mesh>
      </RigidBody>

      {/* Five north-south and five east-west streets form four districts. */}
      {roadCoordinates.map((coordinate) => (
        <Road
          position={[coordinate, 0]}
          length={110}
          orientation="vertical"
          key={`vertical-${coordinate}`}
        />
      ))}
      {roadCoordinates.map((coordinate) => (
        <Road
          position={[0, coordinate]}
          length={90}
          orientation="horizontal"
          key={`horizontal-${coordinate}`}
        />
      ))}

      {/* The central plaza is the navigation landmark between all districts. */}
      <mesh position={[0, 0.055, 0]}>
        <cylinderGeometry args={[5, 5, 0.08, 64]} />
        <meshStandardMaterial color="#1d2940" roughness={0.65} />
      </mesh>
      <RigidBody type="fixed" colliders="hull">
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[1.35, 1.55, 0.36, 40]} />
          <meshStandardMaterial color="#263754" roughness={0.8} />
        </mesh>
      </RigidBody>
      {/* Every real portfolio entry is now its own interactive building. */}
      {cityDestinations.map((destination) => (
        <Landmark destination={destination} key={destination.id} />
      ))}

      {/* These blocks make the playable city continue beyond the four districts. */}
      {backgroundBuildings.map((building, index) => (
        <Building {...building} key={`background-building-${index}`} />
      ))}

      <StartPortal />

      <DirectionSign
        position={[3.2, 0, 43]}
        title="Portal Avenue"
        directions={[{ arrow: '↑', label: 'Central Plaza' }]}
      />

      <DirectionSign
        position={[4.8, 0, 4.8]}
        title="Central Plaza"
        directions={[
          { arrow: '↖', label: 'Experience' },
          { arrow: '↗', label: 'Projects' },
          { arrow: '↙', label: 'Hobbies' },
          { arrow: '↘', label: 'About' },
        ]}
      />

      <Car
        onNearbyDestinationChange={onNearbyDestinationChange}
        onExploreDestination={onExploreDestination}
        onCurrentAreaChange={onCurrentAreaChange}
        isDestinationOpen={isDestinationOpen}
        onCloseDestination={onCloseDestination}
      />

    </>
  )
}

function InteractiveCity() {
  const [nearbyDestination, setNearbyDestination] =
    useState<CityDestination | null>(null)
  const [activeDestination, setActiveDestination] =
    useState<CityDestination | null>(null)
  const [currentArea, setCurrentArea] = useState('Portal Gate')
  const closeDestination = useCallback(() => {
    setActiveDestination(null)
  }, [])

  return (
    <main className="interactive-city-page">
      <div className="interactive-city-canvas">
        <Canvas camera={{ position: [0, 8, 14], fov: 55 }}>
          <Physics gravity={[0, -9.81, 0]}>
            <CityScene
              onNearbyDestinationChange={setNearbyDestination}
              onExploreDestination={setActiveDestination}
              onCurrentAreaChange={setCurrentArea}
              isDestinationOpen={activeDestination !== null}
              onCloseDestination={closeDestination}
            />
          </Physics>
        </Canvas>
      </div>

      <div className="interactive-city-area" role="status" aria-live="polite">
        <span>Current area</span>
        <strong>{currentArea}</strong>
      </div>

      <div className="interactive-city-hud">
        <strong>Anushka City</strong>
        <span>WASD or arrows to drive · E to explore</span>
        <small>Portal Gate → Central Plaza → choose a district</small>
      </div>

      {nearbyDestination && !activeDestination && (
        <div className="interactive-city-prompt" role="status">
          <kbd>E</kbd>
          <span>
            Explore <strong>{nearbyDestination.name}</strong>
          </span>
        </div>
      )}

      {activeDestination && (
        <aside className="interactive-city-location-panel">
          <p>
            {
              districtDefinitions.find(
                (district) => district.id === activeDestination.district,
              )?.name
            }
            {' · '}
            {activeDestination.category}
          </p>
          <h1>{activeDestination.name}</h1>
          <span>{activeDestination.description}</span>

          {activeDestination.metric && (
            <div className="city-location-metric">
              <strong>{activeDestination.metric}</strong>
              <span>{activeDestination.metricLabel}</span>
            </div>
          )}

          {activeDestination.skills && (
            <div className="city-location-skills">
              {activeDestination.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          )}

          {activeDestination.links && (
            <div className="city-location-links">
              {activeDestination.links.map((link) => (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  key={link.url}
                >
                  {link.label} →
                </a>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={closeDestination}
          >
            Continue driving · E or Esc
          </button>
        </aside>
      )}
    </main>
  )
}
export default InteractiveCity
