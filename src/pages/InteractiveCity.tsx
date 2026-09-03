import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useNavigate } from 'react-router'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Instance, Instances, useGLTF } from '@react-three/drei'
import {
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from '@react-three/rapier'
import {
  BufferGeometry,
  Float32BufferAttribute,
  MathUtils,
  Quaternion,
  Raycaster,
  Vector3,
} from 'three'
import type { Group, LineSegments, Object3D } from 'three'
import {
  cityDestinations,
  districtDefinitions,
  type CityDestination,
} from '../data/cityDestinations'
import graduationPhoto from '../assets/graduation.jpg'
import './InteractiveCity.css'

type BuildingProps = {
  position: [number, number, number]
  scale: [number, number, number]
  color?: string
  isOcclusionRoot?: boolean
}

const BUILDING_HEIGHT_MULTIPLIER = 1.4
const ROAD_COORDINATES = [-42, -21, 0, 21, 42]
const RAIN_DROP_COUNT = 1300

function Rain() {
  const rainRef = useRef<LineSegments>(null)
  const rainField = useMemo(() => {
    const positions = new Float32Array(RAIN_DROP_COUNT * 2 * 3)
    const speeds = new Float32Array(RAIN_DROP_COUNT)
    const lengths = new Float32Array(RAIN_DROP_COUNT)

    for (let index = 0; index < RAIN_DROP_COUNT; index += 1) {
      const vertexIndex = index * 6
      const x = MathUtils.randFloatSpread(116)
      const y = MathUtils.randFloat(1, 42)
      const z = MathUtils.randFloatSpread(116)
      const length = MathUtils.randFloat(0.7, 1.65)

      positions[vertexIndex] = x
      positions[vertexIndex + 1] = y
      positions[vertexIndex + 2] = z
      positions[vertexIndex + 3] = x
      positions[vertexIndex + 4] = y - length
      positions[vertexIndex + 5] = z
      speeds[index] = MathUtils.randFloat(18, 28)
      lengths[index] = length
    }

    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))

    return { geometry, lengths, speeds }
  }, [])

  useEffect(() => {
    return () => rainField.geometry.dispose()
  }, [rainField])

  useFrame((_, delta) => {
    const positionAttribute = rainRef.current?.geometry.getAttribute(
      'position',
    ) as Float32BufferAttribute | undefined

    if (!positionAttribute) {
      return
    }

    const positions = positionAttribute.array
    const frameDelta = Math.min(delta, 0.05)

    for (let index = 0; index < RAIN_DROP_COUNT; index += 1) {
      const vertexIndex = index * 6
      const fallDistance = rainField.speeds[index] * frameDelta

      positions[vertexIndex + 1] -= fallDistance
      positions[vertexIndex + 4] -= fallDistance

      if (positions[vertexIndex + 4] <= 0.12) {
        const x = MathUtils.randFloatSpread(116)
        const y = MathUtils.randFloat(32, 44)
        const z = MathUtils.randFloatSpread(116)

        positions[vertexIndex] = x
        positions[vertexIndex + 1] = y
        positions[vertexIndex + 2] = z
        positions[vertexIndex + 3] = x
        positions[vertexIndex + 4] = y - rainField.lengths[index]
        positions[vertexIndex + 5] = z
      }
    }

    positionAttribute.needsUpdate = true
  })

  return (
    <lineSegments
      ref={rainRef}
      geometry={rainField.geometry}
      frustumCulled={false}
    >
      <lineBasicMaterial
        color="#a7d8e4"
        transparent
        opacity={0.4}
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  )
}

type PedestrianDefinition = {
  id: string
  path: Array<[number, number]>
  coatColor: string
  umbrellaColor?: string
  speed: number
  phase: number
}

// This loop sits between the outer road and the tree belt, so pedestrians stay
// close to the landscaped perimeter without crossing any building footprints.
const perimeterPedestrianPath: Array<[number, number]> = [
  [-44.8, -44.8],
  [44.8, -44.8],
  [44.8, 44.8],
  [-44.8, 44.8],
]

const pedestrians: PedestrianDefinition[] = [
  {
    id: 'central-walker',
    path: [[-6.8, -6.8], [6.8, -6.8], [6.8, 6.8], [-6.8, 6.8]],
    coatColor: '#d76d91',
    umbrellaColor: '#ff9fc2',
    speed: 1.15,
    phase: 0.1,
  },
  {
    id: 'plaza-visitor',
    path: [[-4.6, 5.8]],
    coatColor: '#6e72b5',
    umbrellaColor: '#b6abff',
    speed: 0,
    phase: 0.3,
  },
  {
    id: 'perimeter-gold',
    path: perimeterPedestrianPath,
    coatColor: '#d3a64f',
    umbrellaColor: '#f0cf7e',
    speed: 1.02,
    phase: 0.03,
  },
  {
    id: 'perimeter-cyan',
    path: perimeterPedestrianPath,
    coatColor: '#3ca5b4',
    umbrellaColor: '#7be5ed',
    speed: 1.12,
    phase: 0.19,
  },
  {
    id: 'perimeter-pink',
    path: perimeterPedestrianPath,
    coatColor: '#a75077',
    umbrellaColor: '#ff79ac',
    speed: 0.92,
    phase: 0.36,
  },
  {
    id: 'perimeter-lavender',
    path: perimeterPedestrianPath,
    coatColor: '#7774b8',
    umbrellaColor: '#b9b3ff',
    speed: 1.07,
    phase: 0.52,
  },
  {
    id: 'perimeter-green',
    path: perimeterPedestrianPath,
    coatColor: '#477c73',
    umbrellaColor: '#83c9b8',
    speed: 0.96,
    phase: 0.7,
  },
  {
    id: 'perimeter-coral',
    path: perimeterPedestrianPath,
    coatColor: '#bd655c',
    umbrellaColor: '#ffab91',
    speed: 1.16,
    phase: 0.87,
  },
]

function Pedestrian({ definition }: { definition: PedestrianDefinition }) {
  const personRef = useRef<Group>(null)
  const leftLegRef = useRef<Group>(null)
  const rightLegRef = useRef<Group>(null)
  const leftArmRef = useRef<Group>(null)
  const rightArmRef = useRef<Group>(null)
  const routeOffset = definition.phase * definition.path.length
  const initialRouteSegment =
    Math.floor(routeOffset) % definition.path.length
  const routeSegment = useRef(initialRouteSegment)
  const routeProgress = useRef(routeOffset % 1)

  useFrame(({ clock }, delta) => {
    const person = personRef.current

    if (!person) {
      return
    }

    const isWalking = definition.path.length > 1 && definition.speed > 0

    if (isWalking) {
      let start = definition.path[routeSegment.current]
      let end = definition.path[(routeSegment.current + 1) % definition.path.length]
      const segmentLength = Math.hypot(end[0] - start[0], end[1] - start[1])

      routeProgress.current += (definition.speed * delta) / segmentLength

      while (routeProgress.current >= 1) {
        routeProgress.current -= 1
        routeSegment.current =
          (routeSegment.current + 1) % definition.path.length
        start = definition.path[routeSegment.current]
        end = definition.path[(routeSegment.current + 1) % definition.path.length]
      }

      person.position.set(
        MathUtils.lerp(start[0], end[0], routeProgress.current),
        0.16,
        MathUtils.lerp(start[1], end[1], routeProgress.current),
      )
      person.rotation.y = Math.atan2(end[0] - start[0], end[1] - start[1])

      const stride = Math.sin(
        clock.elapsedTime * definition.speed * 7 + definition.phase * Math.PI * 2,
      ) * 0.42

      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = stride
        rightLegRef.current.rotation.x = -stride
      }

      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -stride * 0.55
        rightArmRef.current.rotation.x = stride * 0.55
      }
    } else {
      person.rotation.y =
        definition.phase * Math.PI * 2 +
        Math.sin(clock.elapsedTime * 0.45 + definition.phase * 4) * 0.08
    }
  })

  const [initialX, initialZ] = definition.path[initialRouteSegment]

  return (
    <group ref={personRef} position={[initialX, 0.16, initialZ]} scale={0.62}>
      <group ref={leftLegRef} position={[-0.16, 0.68, 0]}>
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.18, 0.6, 0.2]} />
          <meshStandardMaterial color="#26354d" roughness={0.85} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.16, 0.68, 0]}>
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.18, 0.6, 0.2]} />
          <meshStandardMaterial color="#26354d" roughness={0.85} />
        </mesh>
      </group>

      <mesh position={[0, 1.18, 0]}>
        <capsuleGeometry args={[0.3, 0.62, 5, 10]} />
        <meshStandardMaterial color={definition.coatColor} roughness={0.8} />
      </mesh>

      <group ref={leftArmRef} position={[-0.38, 1.35, 0]}>
        <mesh position={[0, -0.27, 0]}>
          <boxGeometry args={[0.14, 0.56, 0.16]} />
          <meshStandardMaterial color={definition.coatColor} roughness={0.8} />
        </mesh>
      </group>
      <group ref={rightArmRef} position={[0.38, 1.35, 0]}>
        <mesh position={[0, -0.27, 0]}>
          <boxGeometry args={[0.14, 0.56, 0.16]} />
          <meshStandardMaterial color={definition.coatColor} roughness={0.8} />
        </mesh>
      </group>

      <mesh position={[0, 1.88, 0]}>
        <sphereGeometry args={[0.27, 12, 9]} />
        <meshStandardMaterial color="#c98f70" roughness={0.9} />
      </mesh>

      {definition.umbrellaColor && (
        <group position={[0.34, 2.02, 0]} rotation={[0, 0, -0.08]}>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 1.25, 8]} />
            <meshStandardMaterial color="#8995a4" metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <sphereGeometry args={[0.86, 18, 7, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color={definition.umbrellaColor}
              roughness={0.55}
              side={2}
            />
          </mesh>
        </group>
      )}
    </group>
  )
}

function CityPeople() {
  return (
    <group>
      {pedestrians.map((pedestrian) => (
        <Pedestrian definition={pedestrian} key={pedestrian.id} />
      ))}
    </group>
  )
}

type DogWalkerDefinition = {
  id: string
  coatColor: string
  umbrellaColor: string
  dogColor: string
  collarColor: string
  speed: number
  phase: number
  dogSide: -1 | 1
}

const dogWalkers: DogWalkerDefinition[] = [
  {
    id: 'coral-dog-walker',
    coatColor: '#bd655c',
    umbrellaColor: '#ffab91',
    dogColor: '#b98765',
    collarColor: '#65e6f3',
    speed: 0.88,
    phase: 0.27,
    dogSide: 1,
  },
  {
    id: 'lavender-dog-walker',
    coatColor: '#7774b8',
    umbrellaColor: '#b9b3ff',
    dogColor: '#d8c5a1',
    collarColor: '#ff70a5',
    speed: 0.96,
    phase: 0.77,
    dogSide: -1,
  },
]

function DogWalker({ definition }: { definition: DogWalkerDefinition }) {
  const walkerRef = useRef<Group>(null)
  const dogRef = useRef<Group>(null)
  const leftLegRef = useRef<Group>(null)
  const rightLegRef = useRef<Group>(null)
  const dogFrontLegsRef = useRef<Group>(null)
  const dogBackLegsRef = useRef<Group>(null)
  const routeOffset = definition.phase * perimeterPedestrianPath.length
  const initialRouteSegment =
    Math.floor(routeOffset) % perimeterPedestrianPath.length
  const routeSegment = useRef(initialRouteSegment)
  const routeProgress = useRef(routeOffset % 1)

  useFrame(({ clock }, delta) => {
    const walker = walkerRef.current

    if (!walker) {
      return
    }

    let start = perimeterPedestrianPath[routeSegment.current]
    let end =
      perimeterPedestrianPath[
        (routeSegment.current + 1) % perimeterPedestrianPath.length
      ]
    const segmentLength = Math.hypot(end[0] - start[0], end[1] - start[1])

    routeProgress.current += (definition.speed * delta) / segmentLength

    while (routeProgress.current >= 1) {
      routeProgress.current -= 1
      routeSegment.current =
        (routeSegment.current + 1) % perimeterPedestrianPath.length
      start = perimeterPedestrianPath[routeSegment.current]
      end =
        perimeterPedestrianPath[
          (routeSegment.current + 1) % perimeterPedestrianPath.length
        ]
    }

    walker.position.set(
      MathUtils.lerp(start[0], end[0], routeProgress.current),
      0.16,
      MathUtils.lerp(start[1], end[1], routeProgress.current),
    )
    walker.rotation.y = Math.atan2(end[0] - start[0], end[1] - start[1])

    const stride = Math.sin(
      clock.elapsedTime * definition.speed * 8 + definition.phase * Math.PI * 2,
    )

    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = stride * 0.42
      rightLegRef.current.rotation.x = -stride * 0.42
    }

    if (dogFrontLegsRef.current && dogBackLegsRef.current) {
      dogFrontLegsRef.current.rotation.x = stride * 0.5
      dogBackLegsRef.current.rotation.x = -stride * 0.5
    }

    if (dogRef.current) {
      dogRef.current.position.y =
        Math.abs(stride) * 0.035
    }
  })

  const [initialX, initialZ] = perimeterPedestrianPath[initialRouteSegment]
  const dogX = definition.dogSide * 0.88
  const leashRotationZ = definition.dogSide === 1 ? -0.72 : 0.72

  return (
    <group
      ref={walkerRef}
      position={[initialX, 0.16, initialZ]}
      scale={0.58}
    >
      <group position={[-definition.dogSide * 0.25, 0, 0]}>
        <group ref={leftLegRef} position={[-0.15, 0.72, 0]}>
          <mesh position={[0, -0.36, 0]}>
            <boxGeometry args={[0.15, 0.72, 0.18]} />
            <meshStandardMaterial color="#26354d" roughness={0.85} />
          </mesh>
        </group>
        <group ref={rightLegRef} position={[0.15, 0.72, 0]}>
          <mesh position={[0, -0.36, 0]}>
            <boxGeometry args={[0.15, 0.72, 0.18]} />
            <meshStandardMaterial color="#26354d" roughness={0.85} />
          </mesh>
        </group>
        <mesh position={[0, 1.18, 0]}>
          <capsuleGeometry args={[0.29, 0.6, 5, 9]} />
          <meshStandardMaterial color={definition.coatColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.88, 0]}>
          <sphereGeometry args={[0.26, 10, 8]} />
          <meshStandardMaterial color="#c98f70" roughness={0.9} />
        </mesh>
        <group position={[0.28, 2.02, 0]} rotation={[0, 0, -0.08]}>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.024, 0.024, 1.22, 7]} />
            <meshStandardMaterial color="#8995a4" metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.88, 0]}>
            <sphereGeometry args={[0.82, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color={definition.umbrellaColor}
              roughness={0.55}
              side={2}
            />
          </mesh>
        </group>
      </group>

      <mesh
        position={[definition.dogSide * 0.48, 0.94, 0.08]}
        rotation={[0, 0, leashRotationZ]}
      >
        <cylinderGeometry args={[0.018, 0.018, 1.08, 6]} />
        <meshStandardMaterial color={definition.collarColor} roughness={0.55} />
      </mesh>

      <group ref={dogRef} position={[dogX, 0, 0.12]}>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.48, 0.42, 0.78]} />
          <meshStandardMaterial color={definition.dogColor} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.66, 0.48]}>
          <boxGeometry args={[0.4, 0.4, 0.42]} />
          <meshStandardMaterial color={definition.dogColor} roughness={0.9} />
        </mesh>
        {[-0.15, 0.15].map((earX) => (
          <mesh position={[earX, 0.88, 0.48]} key={earX}>
            <coneGeometry args={[0.1, 0.28, 4]} />
            <meshStandardMaterial color={definition.dogColor} roughness={0.9} />
          </mesh>
        ))}
        <group ref={dogFrontLegsRef} position={[0, 0.31, 0.24]}>
          {[-0.16, 0.16].map((legX) => (
            <mesh position={[legX, -0.15, 0]} key={legX}>
              <boxGeometry args={[0.1, 0.32, 0.12]} />
              <meshStandardMaterial color={definition.dogColor} roughness={0.9} />
            </mesh>
          ))}
        </group>
        <group ref={dogBackLegsRef} position={[0, 0.31, -0.24]}>
          {[-0.16, 0.16].map((legX) => (
            <mesh position={[legX, -0.15, 0]} key={legX}>
              <boxGeometry args={[0.1, 0.32, 0.12]} />
              <meshStandardMaterial color={definition.dogColor} roughness={0.9} />
            </mesh>
          ))}
        </group>
        <mesh position={[0, 0.64, 0.28]}>
          <boxGeometry args={[0.5, 0.08, 0.08]} />
          <meshStandardMaterial
            color={definition.collarColor}
            emissive={definition.collarColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh position={[0, 0.61, -0.52]} rotation={[-0.6, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.075, 0.46, 6]} />
          <meshStandardMaterial color={definition.dogColor} roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

function CityDogWalkers() {
  return (
    <group>
      {dogWalkers.map((walker) => (
        <DogWalker definition={walker} key={walker.id} />
      ))}
    </group>
  )
}

type CyclistDefinition = {
  id: string
  frameColor: string
  riderColor: string
  speed: number
  phase: number
}

// Three simple, non-physics cyclists reuse the existing perimeter cycle path.
// Keeping them to primitive meshes avoids adding model downloads or collision work.
const perimeterCyclistPath: Array<[number, number]> = [
  [-48.35, -48.35],
  [48.35, -48.35],
  [48.35, 48.35],
  [-48.35, 48.35],
]

const cyclists: CyclistDefinition[] = [
  {
    id: 'cyan-cyclist',
    frameColor: '#65e6f3',
    riderColor: '#d76d91',
    speed: 3.05,
    phase: 0.08,
  },
  {
    id: 'gold-cyclist',
    frameColor: '#f3c969',
    riderColor: '#477c73',
    speed: 2.75,
    phase: 0.42,
  },
  {
    id: 'pink-cyclist',
    frameColor: '#ff70a5',
    riderColor: '#7774b8',
    speed: 3.2,
    phase: 0.74,
  },
]

function Cyclist({ definition }: { definition: CyclistDefinition }) {
  const cyclistRef = useRef<Group>(null)
  const routeOffset = definition.phase * perimeterCyclistPath.length
  const initialRouteSegment =
    Math.floor(routeOffset) % perimeterCyclistPath.length
  const routeSegment = useRef(initialRouteSegment)
  const routeProgress = useRef(routeOffset % 1)

  useFrame((_, delta) => {
    const cyclist = cyclistRef.current

    if (!cyclist) {
      return
    }

    let start = perimeterCyclistPath[routeSegment.current]
    let end =
      perimeterCyclistPath[(routeSegment.current + 1) % perimeterCyclistPath.length]
    const segmentLength = Math.hypot(end[0] - start[0], end[1] - start[1])

    routeProgress.current += (definition.speed * delta) / segmentLength

    while (routeProgress.current >= 1) {
      routeProgress.current -= 1
      routeSegment.current =
        (routeSegment.current + 1) % perimeterCyclistPath.length
      start = perimeterCyclistPath[routeSegment.current]
      end =
        perimeterCyclistPath[(routeSegment.current + 1) % perimeterCyclistPath.length]
    }

    cyclist.position.set(
      MathUtils.lerp(start[0], end[0], routeProgress.current),
      0.12,
      MathUtils.lerp(start[1], end[1], routeProgress.current),
    )
    cyclist.rotation.y = Math.atan2(end[0] - start[0], end[1] - start[1])
  })

  const [initialX, initialZ] = perimeterCyclistPath[initialRouteSegment]

  return (
    <group
      ref={cyclistRef}
      position={[initialX, 0.12, initialZ]}
      scale={0.72}
    >
      {[-0.72, 0.72].map((wheelZ) => (
        <mesh
          position={[0, 0.42, wheelZ]}
          rotation={[0, Math.PI / 2, 0]}
          key={wheelZ}
        >
          <torusGeometry args={[0.38, 0.055, 6, 14]} />
          <meshStandardMaterial color="#202a3d" roughness={0.72} />
        </mesh>
      ))}
      <mesh position={[0, 0.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 1.25, 8]} />
        <meshStandardMaterial
          color={definition.frameColor}
          emissive={definition.frameColor}
          emissiveIntensity={0.38}
        />
      </mesh>
      <mesh position={[0, 0.84, 0.04]} rotation={[0.15, 0, 0]}>
        <capsuleGeometry args={[0.2, 0.42, 4, 8]} />
        <meshStandardMaterial color={definition.riderColor} roughness={0.78} />
      </mesh>
      <mesh position={[0, 1.25, -0.08]}>
        <sphereGeometry args={[0.18, 9, 7]} />
        <meshStandardMaterial color="#c98f70" roughness={0.9} />
      </mesh>
    </group>
  )
}

function CityCyclists() {
  return (
    <group>
      {cyclists.map((cyclist) => (
        <Cyclist definition={cyclist} key={cyclist.id} />
      ))}
    </group>
  )
}

type RoadProps = {
  position: [number, number]
  length: number
  orientation: 'horizontal' | 'vertical'
}

function Road({ position, length, orientation }: RoadProps) {
  const roadSize: [number, number] =
    orientation === 'horizontal' ? [length, 6.5] : [6.5, length]
  const dashCount = Math.floor(length / 5)
  const dashOffsets = Array.from(
    { length: dashCount },
    (_, index) => -length / 2 + 2.5 + index * 5,
  ).filter((offset) =>
    ROAD_COORDINATES.every(
      (intersectionCoordinate) =>
        Math.abs(offset - intersectionCoordinate) > 4.4,
    ),
  )
  const dashSize: [number, number, number] =
    orientation === 'horizontal'
      ? [2.25, 0.025, 0.1]
      : [0.1, 0.025, 2.25]

  return (
    <group>
      <mesh
        position={[
          position[0],
          0.04,
          position[1],
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={roadSize} />
        <meshStandardMaterial
          color="#070a11"
          roughness={0.72}
          metalness={0.06}
        />
      </mesh>

      <Instances limit={dashOffsets.length}>
        <boxGeometry args={dashSize} />
        <meshBasicMaterial color="#d4b768" transparent opacity={0.68} />

        {dashOffsets.map((offset) => (
          <Instance
            position={
              orientation === 'horizontal'
                ? [position[0] + offset, 0.052, position[1]]
                : [position[0], 0.052, position[1] + offset]
            }
            key={offset}
          />
        ))}
      </Instances>
    </group>
  )
}

function CityBlock({ position }: { position: [number, number] }) {
  return (
    <mesh position={[position[0], 0.035, position[1]]}>
      <boxGeometry args={[14.5, 0.07, 14.5]} />
      <meshStandardMaterial color="#182033" roughness={0.82} metalness={0.04} />
    </mesh>
  )
}

function Crosswalk({
  position,
  orientation,
}: {
  position: [number, number]
  orientation: 'horizontal' | 'vertical'
}) {
  const stripeOffsets = [-1.2, -0.6, 0, 0.6, 1.2]

  return (
    <Instances limit={stripeOffsets.length}>
      <boxGeometry
        args={
          orientation === 'horizontal'
            ? [0.28, 0.025, 4.6]
            : [4.6, 0.025, 0.28]
        }
      />
      <meshBasicMaterial color="#d8dfdf" transparent opacity={0.46} />

      {stripeOffsets.map((offset) => (
        <Instance
          position={
            orientation === 'horizontal'
              ? [position[0] + offset, 0.067, position[1]]
              : [position[0], 0.067, position[1] + offset]
          }
          key={offset}
        />
      ))}
    </Instances>
  )
}

function Building({
  position,
  scale,
  color = '#17233f',
  isOcclusionRoot = true,
}: BuildingProps) {
  const elevatedPosition: [number, number, number] = [
    position[0],
    position[1] * BUILDING_HEIGHT_MULTIPLIER,
    position[2],
  ]
  const tallerScale: [number, number, number] = [
    scale[0],
    scale[1] * BUILDING_HEIGHT_MULTIPLIER,
    scale[2],
  ]
  const building = (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh
        position={elevatedPosition}
        scale={tallerScale}
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

function LitEntrance({
  position,
  color,
  rotationY = 0,
}: {
  position: [number, number, number]
  color: string
  rotationY?: number
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <boxGeometry args={[1.45, 2.45, 0.12]} />
        <meshStandardMaterial
          color="#10182d"
          emissive={color}
          emissiveIntensity={0.38}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[1.05, 2.05, 0.08]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.1}
          roughness={0.18}
        />
      </mesh>
    </group>
  )
}

function WindowGrid({
  position,
  rotationY,
  width,
  rows,
  color,
}: {
  position: [number, number, number]
  rotationY: number
  width: number
  rows: number[]
  color: string
}) {
  const columnCount = Math.max(2, Math.min(5, Math.floor(width / 1.65)))
  const usableWidth = Math.max(width - 1.4, 1.8)
  const columnSpacing = usableWidth / columnCount
  const paneWidth = Math.min(1.15, columnSpacing * 0.66)
  const columns = Array.from(
    { length: columnCount },
    (_, index) =>
      -usableWidth / 2 + columnSpacing / 2 + index * columnSpacing,
  )

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Instances limit={columns.length * rows.length}>
        <boxGeometry args={[paneWidth, 0.92, 0.08]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.52}
          roughness={0.28}
          metalness={0.12}
        />

        {rows.flatMap((row) =>
          columns.map((column) => (
            <Instance position={[column, row, 0]} key={`${row}-${column}`} />
          )),
        )}
      </Instances>
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
    <group position={position}>
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.82, 0.055, 14, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.35}
          roughness={0.3}
          metalness={0.18}
        />
      </mesh>
    </group>
  )
}

type BuildingMotif =
  | 'none'
  | 'steps'
  | 'orbit'
  | 'people'
  | 'terminal'
  | 'lab'
  | 'ticker'
  | 'yarn'
  | 'books'
  | 'bike'
  | 'dumbbell'
  | 'kitchen'
  | 'gallery'
  | 'graduation'
  | 'documents'
  | 'signal'

type DestinationVisual = {
  accent: string
  secondary: string
  motif: BuildingMotif
}

type DestinationMark = {
  label: string
}

const destinationVisuals: Record<string, DestinationVisual> = {
  'pmt-college': { accent: '#f2b95e', secondary: '#65e6f3', motif: 'steps' },
  'uw-research': { accent: '#65e6f3', secondary: '#9c87eb', motif: 'orbit' },
  'peer-mentor': { accent: '#ffbd72', secondary: '#ff70a5', motif: 'people' },
  resonance: { accent: '#65e6f3', secondary: '#ff70a5', motif: 'none' },
  codepilot: { accent: '#65e6f3', secondary: '#9c87eb', motif: 'terminal' },
  'clinical-analytics': { accent: '#72efc3', secondary: '#65e6f3', motif: 'lab' },
  ledgerpilot: { accent: '#e1ad59', secondary: '#65e6f3', motif: 'none' },
  'market-data-engine': { accent: '#65e6f3', secondary: '#72efc3', motif: 'ticker' },
  'cozy-corner-project': { accent: '#ff70a5', secondary: '#e1ad59', motif: 'yarn' },
  'crochet-shop': { accent: '#ff9dbd', secondary: '#bba1ff', motif: 'yarn' },
  library: { accent: '#f3c969', secondary: '#ff9dbd', motif: 'books' },
  'cycle-hub': { accent: '#65e6f3', secondary: '#e1ad59', motif: 'bike' },
  'music-room': { accent: '#ff70a5', secondary: '#65e6f3', motif: 'ticker' },
  gym: { accent: '#ff9e64', secondary: '#65e6f3', motif: 'dumbbell' },
  'night-kitchen': { accent: '#ffad7d', secondary: '#f3c969', motif: 'kitchen' },
  'about-gallery': { accent: '#bba1ff', secondary: '#65e6f3', motif: 'gallery' },
  'graduation-park': { accent: '#c84a63', secondary: '#f3c969', motif: 'graduation' },
  'resume-station': { accent: '#65e6f3', secondary: '#bba1ff', motif: 'documents' },
  'contact-kiosk': { accent: '#65e6f3', secondary: '#ff70a5', motif: 'signal' },
}

const destinationMarks: Record<string, DestinationMark> = {
  'pmt-college': { label: 'PMT College' },
  'uw-research': { label: 'UW Research' },
  'peer-mentor': { label: 'Peer Mentor' },
  resonance: { label: 'Resonance' },
  codepilot: { label: 'CodePilot' },
  'clinical-analytics': { label: 'Clinical Analytics' },
  ledgerpilot: { label: 'LedgerPilot' },
  'market-data-engine': { label: 'Market Data' },
  'cozy-corner-project': { label: "Anushka's Cozy Corner" },
  'crochet-shop': { label: 'Crochet Shop' },
  library: { label: 'After Hours Library' },
  'cycle-hub': { label: 'Cycle Hub' },
  'music-room': { label: 'Music Room' },
  gym: { label: 'Gym' },
  'night-kitchen': { label: 'Night Kitchen' },
  'about-gallery': { label: 'About Gallery' },
  'graduation-park': { label: 'Graduation Park' },
  'resume-station': { label: 'Résumé Station' },
  'contact-kiosk': { label: 'Contact Kiosk' },
}

function BuildingIdentitySign({
  destination,
  position,
  color,
}: {
  destination: CityDestination
  position: [number, number, number]
  color: string
}) {
  const mark = destinationMarks[destination.id]

  if (!mark) {
    return null
  }

  return (
    <Html
      position={position}
      center
      distanceFactor={15}
      occlude
      zIndexRange={[1, 0]}
    >
      <div
        className="city-building-sign"
        style={{ borderColor: color, color }}
      >
        <strong>{mark.label}</strong>
      </div>
    </Html>
  )
}

function GlowBox({
  position,
  scale,
  color,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number]
  scale: [number, number, number]
  color: string
  rotation?: [number, number, number]
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={scale} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.85}
        roughness={0.28}
      />
    </mesh>
  )
}

function RoofMotif({
  motif,
  position,
  accent,
  secondary,
}: {
  motif: BuildingMotif
  position: [number, number, number]
  accent: string
  secondary: string
}) {
  if (motif === 'none') {
    return null
  }

  if (motif === 'steps' || motif === 'documents' || motif === 'books') {
    return (
      <group position={position}>
        {[0, 1, 2].map((level) => (
          <GlowBox
            position={[level * 0.18, 0.18 + level * 0.22, 0]}
            scale={[2.4 - level * 0.35, 0.24, 1.35]}
            color={level % 2 === 0 ? accent : secondary}
            rotation={[0, level % 2 === 0 ? 0.08 : -0.08, 0]}
            key={level}
          />
        ))}
      </group>
    )
  }

  if (motif === 'ticker') {
    const heights = [0.55, 0.9, 0.7, 1.25, 1.55]

    return (
      <group position={position}>
        {heights.map((height, index) => (
          <GlowBox
            position={[-1.2 + index * 0.6, height / 2, 0]}
            scale={[0.25, height, 0.4]}
            color={index % 2 === 0 ? accent : secondary}
            key={`${height}-${index}`}
          />
        ))}
      </group>
    )
  }

  if (motif === 'terminal' || motif === 'gallery') {
    return (
      <group position={position}>
        <GlowBox position={[-1, 0.65, 0]} scale={[0.2, 1.3, 0.35]} color={accent} />
        <GlowBox position={[0, 0.65, 0]} scale={[0.2, 1.3, 0.35]} color={secondary} />
        <GlowBox position={[1, 0.65, 0]} scale={[0.2, 1.3, 0.35]} color={accent} />
        <GlowBox position={[0, 1.35, 0]} scale={[2.25, 0.18, 0.35]} color={secondary} />
      </group>
    )
  }

  if (motif === 'orbit' || motif === 'yarn' || motif === 'lab') {
    return (
      <group position={[position[0], position[1] + 0.7, position[2]]}>
        <mesh>
          <sphereGeometry args={[0.46, 18, 18]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.75}
            wireframe={motif === 'yarn'}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <torusGeometry args={[0.82, 0.07, 10, 40]} />
          <meshStandardMaterial color={secondary} emissive={secondary} emissiveIntensity={1} />
        </mesh>
        {motif !== 'yarn' && (
          <mesh rotation={[0, Math.PI / 2.5, 0]}>
            <torusGeometry args={[0.82, 0.07, 10, 40]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1} />
          </mesh>
        )}
      </group>
    )
  }

  if (motif === 'people') {
    return (
      <group position={position}>
        {[-0.75, 0, 0.75].map((offset, index) => (
          <mesh position={[offset, index === 1 ? 0.82 : 0.58, 0]} key={offset}>
            <sphereGeometry args={[index === 1 ? 0.38 : 0.3, 16, 16]} />
            <meshStandardMaterial
              color={index === 1 ? secondary : accent}
              emissive={index === 1 ? secondary : accent}
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </group>
    )
  }

  if (motif === 'bike') {
    return (
      <group position={[position[0], position[1] + 0.7, position[2]]}>
        {[-0.75, 0.75].map((offset) => (
          <mesh position={[offset, 0, 0]} key={offset}>
            <torusGeometry args={[0.46, 0.09, 12, 36]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} />
          </mesh>
        ))}
        <GlowBox position={[0, 0.05, 0]} scale={[1.15, 0.1, 0.12]} color={secondary} rotation={[0, 0, 0.55]} />
      </group>
    )
  }

  if (motif === 'dumbbell') {
    return (
      <group position={[position[0], position[1] + 0.55, position[2]]} rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 1.8, 12]} />
          <meshStandardMaterial color={secondary} emissive={secondary} emissiveIntensity={0.8} />
        </mesh>
        {[-0.85, 0.85].map((offset) => (
          <GlowBox position={[0, offset, 0]} scale={[0.45, 0.28, 0.45]} color={accent} key={offset} />
        ))}
      </group>
    )
  }

  if (motif === 'kitchen') {
    return (
      <group position={position}>
        <GlowBox position={[-0.55, 0.6, 0]} scale={[0.55, 1.2, 0.65]} color={accent} />
        <GlowBox position={[0.55, 0.42, 0]} scale={[0.55, 0.84, 0.65]} color={secondary} />
        <GlowBox position={[-0.55, 1.27, 0]} scale={[0.82, 0.14, 0.82]} color={secondary} />
      </group>
    )
  }

  if (motif === 'graduation') {
    return (
      <group position={[position[0], position[1] + 0.65, position[2]]}>
        <mesh rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.85, 1.2, 4]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.75} />
        </mesh>
        <GlowBox position={[0, 0.65, 0]} scale={[1.5, 0.12, 1.5]} color={secondary} rotation={[0, 0.2, 0]} />
      </group>
    )
  }

  return (
    <group position={position}>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 1.7, 12]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} />
      </mesh>
      {[0.45, 0.75].map((radius, index) => (
        <mesh position={[0, 1.55, 0]} rotation={[Math.PI / 2, 0, 0]} key={radius}>
          <torusGeometry args={[radius, 0.05, 8, 32]} />
          <meshBasicMaterial color={index === 0 ? accent : secondary} />
        </mesh>
      ))}
    </group>
  )
}

function BuildingShellDetails({ destination }: { destination: CityDestination }) {
  const visual = destinationVisuals[destination.id]

  if (!visual) {
    return null
  }

  const [buildingX, originalBuildingY, buildingZ] = destination.buildingPosition
  const [buildingWidth, originalBuildingHeight, buildingDepth] = destination.buildingScale
  const buildingY = originalBuildingY * BUILDING_HEIGHT_MULTIPLIER
  const buildingHeight = originalBuildingHeight * BUILDING_HEIGHT_MULTIPLIER
  const [entranceX, , entranceZ] = destination.entrancePosition
  const entranceDeltaX = entranceX - buildingX
  const entranceDeltaZ = entranceZ - buildingZ
  const entranceIsOnSide = Math.abs(entranceDeltaX) > Math.abs(entranceDeltaZ)
  const entranceDirection = entranceIsOnSide
    ? Math.sign(entranceDeltaX)
    : Math.sign(entranceDeltaZ)
  const entranceRotation = entranceIsOnSide
    ? entranceDirection > 0
      ? Math.PI / 2
      : -Math.PI / 2
    : entranceDirection > 0
      ? 0
      : Math.PI
  const entrancePosition: [number, number, number] = entranceIsOnSide
    ? [
        buildingX + entranceDirection * (buildingWidth / 2 + 0.08),
        1.23,
        buildingZ,
      ]
    : [
        buildingX,
        1.23,
        buildingZ + entranceDirection * (buildingDepth / 2 + 0.08),
      ]
  const rowCount = Math.max(1, Math.min(4, Math.floor(buildingHeight / 2.2)))
  const windowRows = Array.from({ length: rowCount }, (_, index) => {
    if (rowCount === 1) {
      return Math.min(2.35, buildingHeight * 0.62)
    }

    return 2.35 + index * ((buildingHeight - 3.2) / (rowCount - 1))
  })

  return (
    <group>
      <WindowGrid
        position={[buildingX, 0, buildingZ + buildingDepth / 2 + 0.06]}
        rotationY={0}
        width={buildingWidth}
        rows={windowRows}
        color={visual.accent}
      />
      <WindowGrid
        position={[buildingX, 0, buildingZ - buildingDepth / 2 - 0.06]}
        rotationY={Math.PI}
        width={buildingWidth}
        rows={windowRows}
        color={visual.accent}
      />
      <WindowGrid
        position={[buildingX + buildingWidth / 2 + 0.06, 0, buildingZ]}
        rotationY={Math.PI / 2}
        width={buildingDepth}
        rows={windowRows}
        color={visual.accent}
      />
      <WindowGrid
        position={[buildingX - buildingWidth / 2 - 0.06, 0, buildingZ]}
        rotationY={-Math.PI / 2}
        width={buildingDepth}
        rows={windowRows}
        color={visual.accent}
      />

      <mesh
        position={[buildingX, Math.max(1.8, buildingHeight * 0.68), buildingZ]}
        scale={[buildingWidth + 0.1, 0.09, buildingDepth + 0.1]}
      >
        <boxGeometry />
        <meshBasicMaterial color={visual.secondary} />
      </mesh>

      <LitEntrance
        position={entrancePosition}
        color={visual.accent}
        rotationY={entranceRotation}
      />

      <BuildingIdentitySign
        destination={destination}
        position={[entrancePosition[0], 3.05, entrancePosition[2]]}
        color={visual.accent}
      />

      <ArrivalMarker
        position={[entranceX, 0.07, entranceZ]}
        color={visual.accent}
      />

      <RoofMotif
        motif={visual.motif}
        position={[buildingX, buildingY + buildingHeight / 2 + 0.08, buildingZ]}
        accent={visual.accent}
        secondary={visual.secondary}
      />
    </group>
  )
}

function ResonanceDetails({ destination }: { destination: CityDestination }) {
  const [buildingX, originalBuildingY, buildingZ] = destination.buildingPosition
  const [, originalBuildingHeight] = destination.buildingScale
  const buildingY = originalBuildingY * BUILDING_HEIGHT_MULTIPLIER
  const buildingHeight = originalBuildingHeight * BUILDING_HEIGHT_MULTIPLIER
  const roofY = buildingY + buildingHeight / 2
  const equalizerHeights = [0.65, 1.15, 0.85, 1.4, 0.75]

  return (
    <group>
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
    </group>
  )
}

function LedgerPilotDetails({ destination }: { destination: CityDestination }) {
  const [buildingX, originalBuildingY, buildingZ] = destination.buildingPosition
  const [, originalBuildingHeight, buildingDepth] = destination.buildingScale
  const buildingY = originalBuildingY * BUILDING_HEIGHT_MULTIPLIER
  const buildingHeight = originalBuildingHeight * BUILDING_HEIGHT_MULTIPLIER
  const facadeZ = buildingZ + buildingDepth / 2 + 0.06
  const roofY = buildingY + buildingHeight / 2

  return (
    <group>
      {[1.55, 3.4, 5.75].map((row) => (
        <mesh position={[buildingX, row, facadeZ + 0.07]} key={row}>
          <boxGeometry args={[5.1, 0.07, 0.06]} />
          <meshBasicMaterial color="#65e6f3" />
        </mesh>
      ))}

      <mesh position={[buildingX, roofY + 0.85, buildingZ]}>
        <torusGeometry args={[0.72, 0.12, 14, 48]} />
        <meshStandardMaterial
          color="#e1ad59"
          emissive="#e1ad59"
          emissiveIntensity={1.15}
          metalness={0.45}
        />
      </mesh>
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

      <BuildingShellDetails destination={destination} />

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
        <torusGeometry args={[2.6, 0.2, 32, 128]} />
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

      <Html
        position={[0, 2.45, 0]}
        center
        distanceFactor={13}
        zIndexRange={[1, 0]}
      >
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

const centralDistrictDirections = [
  { arrow: '↖', label: 'Experience', district: 'experience' },
  { arrow: '↗', label: 'Projects', district: 'projects' },
  { arrow: '↙', label: 'Hobbies', district: 'hobbies' },
  { arrow: '↘', label: 'About', district: 'about' },
]

function CentralDistrictSignpost() {
  return (
    <group position={[0, 0.35, 0]}>
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 3.6, 12]} />
        <meshStandardMaterial
          color="#8390a2"
          roughness={0.35}
          metalness={0.72}
        />
      </mesh>

      <mesh position={[0, 3.65, 0]}>
        <sphereGeometry args={[0.18, 12, 8]} />
        <meshStandardMaterial
          color="#65e6f3"
          emissive="#287887"
          emissiveIntensity={1.8}
        />
      </mesh>

      <Html
        position={[0, 3.05, 0]}
        center
        distanceFactor={10}
        zIndexRange={[1, 0]}
      >
        <div className="city-central-signpost">
          <span>Central Plaza</span>
          <div>
            {centralDistrictDirections.map((direction) => (
              <p
                className={`city-central-direction city-central-direction--${direction.district}`}
                key={direction.district}
              >
                <b aria-hidden="true">{direction.arrow}</b>
                <strong>{direction.label}</strong>
              </p>
            ))}
          </div>
        </div>
      </Html>
    </group>
  )
}

type CityMiniMapProps = {
  carPosition: [number, number]
  isOpen: boolean
  onToggle: () => void
}

const miniMapDistricts = [
  { id: 'experience', label: 'Experience', x: -45, y: -45 },
  { id: 'projects', label: 'Projects', x: 3.25, y: -45 },
  { id: 'hobbies', label: 'Hobbies', x: -45, y: 3.25 },
  { id: 'about', label: 'About', x: 3.25, y: 3.25 },
]

function CityMiniMap({ carPosition, isOpen, onToggle }: CityMiniMapProps) {
  return (
    <aside
      className={`interactive-city-minimap${isOpen ? '' : ' is-collapsed'}`}
      aria-label="City minimap"
    >
      <div className="city-minimap-heading">
        <div>
          <span>Navigation</span>
          <strong>City map</strong>
        </div>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Collapse minimap' : 'Open minimap'}
          onClick={onToggle}
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>

      {isOpen && (
        <>
          <svg
            className="city-minimap-map"
            viewBox="-55 -55 110 110"
            role="img"
            aria-label="Map showing the four city districts and your current position"
          >
            <rect className="city-minimap-ground" x="-52" y="-52" width="104" height="104" rx="4" />

            {miniMapDistricts.map((district) => (
              <g className={`city-minimap-district city-minimap-district--${district.id}`} key={district.id}>
                <rect x={district.x} y={district.y} width="41.75" height="41.75" rx="3" />
                <text x={district.x + 20.875} y={district.y + 22.5} textAnchor="middle">
                  {district.label}
                </text>
              </g>
            ))}

            <g className="city-minimap-roads" aria-hidden="true">
              {ROAD_COORDINATES.map((coordinate) => (
                <line x1={coordinate} y1="-45" x2={coordinate} y2="45" key={`map-v-${coordinate}`} />
              ))}
              {ROAD_COORDINATES.map((coordinate) => (
                <line x1="-45" y1={coordinate} x2="45" y2={coordinate} key={`map-h-${coordinate}`} />
              ))}
            </g>

            <rect className="city-minimap-cycle-path" x="-48.35" y="-48.35" width="96.7" height="96.7" rx="2" />
            <circle className="city-minimap-plaza" cx="0" cy="0" r="4" />

            <g className="city-minimap-destinations">
              {cityDestinations.map((destination) => (
                <circle
                  cx={destination.buildingPosition[0]}
                  cy={destination.buildingPosition[2]}
                  r="1.45"
                  key={`map-${destination.id}`}
                >
                  <title>{destination.name}</title>
                </circle>
              ))}
            </g>

            <g className="city-minimap-player" transform={`translate(${carPosition[0]} ${carPosition[1]})`}>
              <circle className="city-minimap-player-pulse" r="4" />
              <circle r="2.15" />
            </g>
          </svg>

          <div className="city-minimap-key" aria-hidden="true">
            <span><i className="experience" />Experience</span>
            <span><i className="projects" />Projects</span>
            <span><i className="hobbies" />Hobbies</span>
            <span><i className="about" />About</span>
          </div>
        </>
      )}
    </aside>
  )
}

type PerimeterTree = {
  position: [number, number, number]
  scale: number
}

const perimeterBlockCenters = [-31.5, -10.5, 10.5, 31.5]
const perimeterTreeOffsets = perimeterBlockCenters.flatMap((center) => [
  center - 4,
  center + 4,
])

const perimeterTrees: PerimeterTree[] = [
  ...perimeterTreeOffsets.map((z, index) => ({
    position: [-47.4, 0.1, z] as [number, number, number],
    scale: 0.82 + (index % 4) * 0.09,
  })),
  ...perimeterTreeOffsets.map((z, index) => ({
    position: [47.4, 0.1, z] as [number, number, number],
    scale: 0.88 + ((index + 2) % 4) * 0.08,
  })),
  ...perimeterTreeOffsets.map((x, index) => ({
    position: [x, 0.1, -47.4] as [number, number, number],
    scale: 0.84 + ((index + 1) % 4) * 0.09,
  })),
  ...perimeterTreeOffsets.map((x, index) => ({
    position: [x, 0.1, 47.4] as [number, number, number],
    scale: 0.86 + ((index + 3) % 4) * 0.08,
  })),
]

const perimeterLamps: Array<[number, number, number]> = [
  ...perimeterBlockCenters.map(
    (z) => [-46.6, 0.12, z] as [number, number, number],
  ),
  ...perimeterBlockCenters.map(
    (z) => [46.6, 0.12, z] as [number, number, number],
  ),
  ...perimeterBlockCenters.map(
    (x) => [x, 0.12, -46.6] as [number, number, number],
  ),
  ...perimeterBlockCenters.map(
    (x) => [x, 0.12, 46.6] as [number, number, number],
  ),
]

const perimeterGrassSections = [
  { position: [-49, 0.012, 0], size: [6, 0.02, 104] },
  { position: [49, 0.012, 0], size: [6, 0.02, 104] },
  { position: [0, 0.013, -49], size: [104, 0.02, 6] },
  { position: [0, 0.013, 49], size: [104, 0.02, 6] },
] satisfies Array<{
  position: [number, number, number]
  size: [number, number, number]
}>

// These narrower strips sit above the roads along the outside edge. They keep
// the landscaped perimeter visually connected without closing the driveable
// street entrances on the city-facing side.
const perimeterOuterRibbons = [
  { position: [-51, 0.046, 0], size: [2, 0.012, 104] },
  { position: [51, 0.046, 0], size: [2, 0.012, 104] },
  { position: [0, 0.047, -51], size: [104, 0.012, 2] },
  { position: [0, 0.047, 51], size: [104, 0.012, 2] },
] satisfies Array<{
  position: [number, number, number]
  size: [number, number, number]
}>

const perimeterPathSections = [
  { position: [-48.35, 0.054, 0], size: [1.55, 0.012, 104] },
  { position: [48.35, 0.054, 0], size: [1.55, 0.012, 104] },
  { position: [0, 0.055, -48.35], size: [104, 0.012, 1.55] },
  { position: [0, 0.055, 48.35], size: [104, 0.012, 1.55] },
] satisfies Array<{
  position: [number, number, number]
  size: [number, number, number]
}>

function PerimeterGreenBelt() {
  return (
    <group>
      {perimeterGrassSections.map((strip) => (
        <mesh
          position={strip.position}
          key={`green-${strip.position.join('-')}`}
        >
          <boxGeometry args={strip.size} />
          <meshStandardMaterial color="#102c2a" roughness={0.96} />
        </mesh>
      ))}

      {perimeterOuterRibbons.map((ribbon) => (
        <mesh
          position={ribbon.position}
          key={`green-ribbon-${ribbon.position.join('-')}`}
        >
          <boxGeometry args={ribbon.size} />
          <meshStandardMaterial color="#102c2a" roughness={0.96} />
        </mesh>
      ))}

      {perimeterPathSections.map((path) => (
        <mesh
          position={path.position}
          key={`path-${path.position.join('-')}`}
        >
          <boxGeometry args={path.size} />
          <meshStandardMaterial color="#26353b" roughness={0.88} />
        </mesh>
      ))}

      <RigidBody type="fixed" colliders={false}>
        {perimeterTrees.map((tree) => (
          <CuboidCollider
            args={[0.24 * tree.scale, 1.15 * tree.scale, 0.24 * tree.scale]}
            position={[
              tree.position[0],
              tree.position[1] + 1.15 * tree.scale,
              tree.position[2],
            ]}
            key={`tree-collider-${tree.position[0]}-${tree.position[2]}`}
          />
        ))}
      </RigidBody>

      <Instances limit={perimeterTrees.length}>
        <cylinderGeometry args={[0.22, 0.3, 2.3, 7]} />
        <meshStandardMaterial color="#5a4238" roughness={0.95} />
        {perimeterTrees.map((tree) => (
          <Instance
            position={[
              tree.position[0],
              tree.position[1] + 1.15 * tree.scale,
              tree.position[2],
            ]}
            scale={tree.scale}
            key={`tree-trunk-${tree.position[0]}-${tree.position[2]}`}
          />
        ))}
      </Instances>

      <Instances limit={perimeterTrees.length}>
        <coneGeometry args={[1.2, 2.2, 7]} />
        <meshStandardMaterial color="#173f3b" roughness={0.9} />
        {perimeterTrees.map((tree) => (
          <Instance
            position={[
              tree.position[0],
              tree.position[1] + 2.7 * tree.scale,
              tree.position[2],
            ]}
            scale={tree.scale}
            key={`tree-lower-${tree.position[0]}-${tree.position[2]}`}
          />
        ))}
      </Instances>

      <Instances limit={perimeterTrees.length}>
        <coneGeometry args={[0.9, 1.8, 7]} />
        <meshStandardMaterial color="#245a50" roughness={0.88} />
        {perimeterTrees.map((tree) => (
          <Instance
            position={[
              tree.position[0],
              tree.position[1] + 3.65 * tree.scale,
              tree.position[2],
            ]}
            scale={tree.scale}
            key={`tree-upper-${tree.position[0]}-${tree.position[2]}`}
          />
        ))}
      </Instances>

      <Instances limit={perimeterLamps.length}>
        <cylinderGeometry args={[0.065, 0.1, 4.8, 10]} />
        <meshStandardMaterial color="#65717f" roughness={0.35} metalness={0.7} />
        {perimeterLamps.map(([x, y, z]) => (
          <Instance position={[x, y + 2.4, z]} key={`lamp-pole-${x}-${z}`} />
        ))}
      </Instances>

      <Instances limit={perimeterLamps.length}>
        <sphereGeometry args={[0.23, 12, 8]} />
        <meshStandardMaterial
          color="#ffe3a1"
          emissive="#ffc96b"
          emissiveIntensity={2.2}
          roughness={0.25}
        />
        {perimeterLamps.map(([x, y, z]) => (
          <Instance position={[x, y + 4.85, z]} key={`lamp-bulb-${x}-${z}`} />
        ))}
      </Instances>

      <Instances limit={perimeterLamps.length}>
        <circleGeometry args={[2.8, 28]} />
        <meshBasicMaterial
          color="#d69b49"
          transparent
          opacity={0.11}
          depthWrite={false}
        />
        {perimeterLamps.map(([x, , z]) => (
          <Instance
            position={[x, 0.135, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            key={`lamp-glow-${x}-${z}`}
          />
        ))}
      </Instances>
    </group>
  )
}

type CarProps = {
  onNearbyDestinationChange: (destination: CityDestination | null) => void
  onExploreDestination: (destination: CityDestination) => void
  onCurrentAreaChange: (area: string) => void
  onMapPositionChange: (position: [number, number]) => void
  isDestinationOpen: boolean
  onCloseDestination: () => void
  mobileControls: React.RefObject<MobileControlState>
}

type MobileControlState = {
  throttle: number
  steering: number
}

function getCurrentArea(x: number, z: number) {
  if (z > 40 && Math.abs(x) < 8) {
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
  onMapPositionChange,
  isDestinationOpen,
  onCloseDestination,
  mobileControls,
}: CarProps) {
  const carRef = useRef<RapierRigidBody>(null)
  const carVisualRef = useRef<Group>(null)
  const pressedKeys = useRef(new Set<string>())
  const currentSpeed = useRef(0)
  const heading = useRef(Math.PI / 2)
  const wheels = useRef<Object3D[]>([])
  const nearbyDestination = useRef<CityDestination | null>(null)
  const currentArea = useRef('Portal Gate')
  const mapUpdateElapsed = useRef(0)
  const desiredCameraPosition = useRef(new Vector3())
  const desiredCameraTarget = useRef(new Vector3())
  const cameraTarget = useRef(new Vector3())
  const renderedCarPosition = useRef(new Vector3())
  const cameraRayOrigin = useRef(new Vector3())
  const cameraRayDirection = useRef(new Vector3())
  const cameraRaycaster = useRef(new Raycaster())
  const cachedOcclusionScene = useRef<Object3D | null>(null)
  const occlusionCandidates = useRef<Object3D[]>([])
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
      const isExploreKey = key === ' ' || key === 'spacebar'

      if (movementKeys.includes(key)) {
        event.preventDefault()
        pressedKeys.current.add(key)
      }

      if ((isExploreKey || key === 'escape') && isDestinationOpen) {
        event.preventDefault()
        onCloseDestination()
        return
      }

      if (isExploreKey && nearbyDestination.current) {
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

    const keyboardThrottle =
      Number(
        pressedKeys.current.has('arrowup') ||
          pressedKeys.current.has('w'),
      ) -
      Number(
        pressedKeys.current.has('arrowdown') ||
          pressedKeys.current.has('s'),
      )

    const keyboardSteering =
      Number(
        pressedKeys.current.has('arrowleft') ||
          pressedKeys.current.has('a'),
      ) -
      Number(
        pressedKeys.current.has('arrowright') ||
          pressedKeys.current.has('d'),
      )

    const throttleDirection =
      keyboardThrottle || mobileControls.current.throttle

    const steeringDirection =
      keyboardSteering || mobileControls.current.steering
    const mobileAccelerationScale = keyboardThrottle
      ? 1
      : MathUtils.lerp(0.45, 0.82, Math.abs(throttleDirection))

    const maxForwardSpeed = 12
    const maxReverseSpeed = 3.2
    const acceleration = 9
    const reverseAcceleration = 5
    const braking = 9
    const rollingResistance = 8
    const turningSpeed = 1.75

    let targetSpeed = 0
    let speedChange = rollingResistance

    if (throttleDirection > 0) {
      targetSpeed = maxForwardSpeed * throttleDirection
      speedChange =
        currentSpeed.current < 0
          ? braking
          : acceleration * mobileAccelerationScale
    } else if (throttleDirection < 0) {
      targetSpeed = maxReverseSpeed * throttleDirection
      speedChange =
        currentSpeed.current > 0
          ? braking
          : reverseAcceleration * mobileAccelerationScale
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

    mapUpdateElapsed.current += delta
    if (mapUpdateElapsed.current >= 0.125) {
      mapUpdateElapsed.current = 0
      onMapPositionChange([boundedX, boundedZ])
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

      if (cachedOcclusionScene.current !== cityScene) {
        cachedOcclusionScene.current = cityScene
        occlusionCandidates.current = []

        cityScene.traverse((object) => {
          if (object.userData.cameraOccluder) {
            occlusionCandidates.current.push(object)
          }
        })
      }

      const intersections = cameraRaycaster.current.intersectObjects(
        occlusionCandidates.current,
        false,
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
      position={[0, 0.42, 43]}
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
  onMapPositionChange: (position: [number, number]) => void
  isDestinationOpen: boolean
  onCloseDestination: () => void
  mobileControls: React.RefObject<MobileControlState>
}

function CityScene({
  onNearbyDestinationChange,
  onExploreDestination,
  onCurrentAreaChange,
  onMapPositionChange,
  isDestinationOpen,
  onCloseDestination,
  mobileControls,
}: CitySceneProps) {
  const blockCoordinates = [-31.5, -10.5, 10.5, 31.5]

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

      <Rain />
      <CityPeople />
      <CityDogWalkers />
      <CityCyclists />

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

      {/* Raised blocks separate the buildings from the asphalt like sidewalks. */}
      {blockCoordinates.flatMap((blockX) =>
        blockCoordinates.map((blockZ) => (
          <CityBlock
            position={[blockX, blockZ]}
            key={`block-${blockX}-${blockZ}`}
          />
        )),
      )}

      {/* Five north-south and five east-west streets form four districts. */}
      {ROAD_COORDINATES.map((coordinate) => (
        <Road
          position={[coordinate, 0]}
          length={90}
          orientation="vertical"
          key={`vertical-${coordinate}`}
        />
      ))}
      {ROAD_COORDINATES.map((coordinate) => (
        <Road
          position={[0, coordinate]}
          length={90}
          orientation="horizontal"
          key={`horizontal-${coordinate}`}
        />
      ))}

      <Crosswalk position={[7, 0]} orientation="horizontal" />
      <Crosswalk position={[-7, 0]} orientation="horizontal" />
      <Crosswalk position={[0, 7]} orientation="vertical" />
      <Crosswalk position={[0, -7]} orientation="vertical" />

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

      {/* A lightweight landscaped boundary softens all four city edges. */}
      <PerimeterGreenBelt />

      <StartPortal />

      <DirectionSign
        position={[3.2, 0, 43]}
        title="Portal Avenue"
        directions={[{ arrow: '↑', label: 'Central Plaza' }]}
      />

      <CentralDistrictSignpost />

      <Car
        onNearbyDestinationChange={onNearbyDestinationChange}
        onExploreDestination={onExploreDestination}
        onCurrentAreaChange={onCurrentAreaChange}
        onMapPositionChange={onMapPositionChange}
        isDestinationOpen={isDestinationOpen}
        onCloseDestination={onCloseDestination}
        mobileControls={mobileControls}
      />

    </>
  )
}

const MemoizedCityScene = memo(CityScene)

const CITY_MUSIC_SRC = `${import.meta.env.BASE_URL}audio/velvet-rain.mp3`
const CITY_MUSIC_VOLUME_KEY = 'anushka-city-music-volume'
const DEFAULT_CITY_MUSIC_VOLUME = 0.28

function getSavedMusicVolume() {
  const savedVolume = window.localStorage.getItem(CITY_MUSIC_VOLUME_KEY)
  const parsedVolume = savedVolume === null ? NaN : Number(savedVolume)

  return Number.isFinite(parsedVolume)
    ? MathUtils.clamp(parsedVolume, 0, 1)
    : DEFAULT_CITY_MUSIC_VOLUME
}

function InteractiveCity() {
  const navigate = useNavigate()
  const [nearbyDestination, setNearbyDestination] =
    useState<CityDestination | null>(null)
  const [activeDestination, setActiveDestination] =
    useState<CityDestination | null>(null)
  const [currentArea, setCurrentArea] = useState('Portal Gate')
  const [carPosition, setCarPosition] = useState<[number, number]>([0, 43])
  const [isMapOpen, setIsMapOpen] = useState(true)
  const [musicVolume, setMusicVolume] = useState(getSavedMusicVolume)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const musicRef = useRef<HTMLAudioElement>(null)
  const hasStartedMusicRef = useRef(false)
  const mobileControls = useRef<MobileControlState>({
    throttle: 0,
    steering: 0,
  })
  const mobileJoystickOrigin = useRef<{ x: number; y: number } | null>(null)
  const [mobileJoystickPosition, setMobileJoystickPosition] = useState({
    x: 0,
    y: 0,
  })
  const closeDestination = useCallback(() => {
    setActiveDestination(null)
  }, [])
  const resetMobileControls = useCallback(() => {
    mobileControls.current.throttle = 0
    mobileControls.current.steering = 0
  }, [])
  const resetMobileJoystick = useCallback(() => {
    resetMobileControls()
    mobileJoystickOrigin.current = null
    setMobileJoystickPosition({ x: 0, y: 0 })
  }, [resetMobileControls])
  const updateMobileJoystick = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const origin = mobileJoystickOrigin.current

      if (!origin) {
        return
      }

      const bounds = event.currentTarget.getBoundingClientRect()
      const dragDistance = Math.min(bounds.width, bounds.height) * 0.55
      const x = MathUtils.clamp(
        (event.clientX - origin.x) / dragDistance,
        -1,
        1,
      )
      const y = MathUtils.clamp(
        (event.clientY - origin.y) / dragDistance,
        -1,
        1,
      )
      const deadZone = 0.18
      const applyDeadZone = (value: number) => {
        const magnitude = Math.abs(value)

        if (magnitude <= deadZone) {
          return 0
        }

        return (
          Math.sign(value) *
          ((magnitude - deadZone) / (1 - deadZone))
        )
      }

      mobileControls.current.throttle = -applyDeadZone(y) * 0.58
      mobileControls.current.steering = -applyDeadZone(x) * 0.62
      setMobileJoystickPosition({ x, y })
    },
    [],
  )
  const startMobileJoystick = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      mobileJoystickOrigin.current = {
        x: event.clientX,
        y: event.clientY,
      }
      resetMobileControls()
      setMobileJoystickPosition({ x: 0, y: 0 })
    },
    [resetMobileControls],
  )
  const moveMobileJoystick = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        updateMobileJoystick(event)
      }
    },
    [updateMobileJoystick],
  )
  const stopMobileJoystick = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      resetMobileJoystick()

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
    },
    [resetMobileJoystick],
  )
  const exploreFromMobile = useCallback(() => {
    resetMobileJoystick()

    if (activeDestination) {
      closeDestination()
      return
    }

    if (nearbyDestination) {
      setActiveDestination(nearbyDestination)
    }
  }, [activeDestination, closeDestination, nearbyDestination, resetMobileJoystick])

  const startMusic = useCallback(async () => {
    const music = musicRef.current

    if (!music) {
      return false
    }

    music.volume = musicVolume

    if (!music.paused) {
      return true
    }

    try {
      await music.play()
      hasStartedMusicRef.current = true
      return true
    } catch {
      setIsMusicPlaying(false)
      return false
    }
  }, [musicVolume])

  const toggleMusic = useCallback(async () => {
    const music = musicRef.current

    if (!music) {
      return
    }

    if (music.paused) {
      await startMusic()
      return
    }

    music.pause()
    music.volume = musicVolume
  }, [musicVolume, startMusic])

  const updateMusicVolume = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextVolume = Number(event.target.value)
      setMusicVolume(nextVolume)
      window.localStorage.setItem(CITY_MUSIC_VOLUME_KEY, String(nextVolume))

      if (musicRef.current) {
        musicRef.current.volume = nextVolume
      }
    },
    [],
  )

  useEffect(() => {
    if (hasStartedMusicRef.current) {
      return
    }

    const removeStartListeners = () => {
      window.removeEventListener('pointerdown', startAfterInteraction)
      window.removeEventListener('keydown', startAfterInteraction)
    }
    const attemptAutomaticStart = async () => {
      const started = await startMusic()

      if (started) {
        removeStartListeners()
      }
    }
    function startAfterInteraction(event: Event) {
      if (
        event.target instanceof Element &&
        event.target.closest('.interactive-city-audio')
      ) {
        return
      }

      void attemptAutomaticStart()
    }

    window.addEventListener('pointerdown', startAfterInteraction)
    window.addEventListener('keydown', startAfterInteraction)
    void attemptAutomaticStart()

    return removeStartListeners
  }, [startMusic])

  useEffect(() => {
    const music = musicRef.current
    const pauseMusic = () => {
      if (!music || music.paused) {
        return
      }

      music.pause()
      music.volume = musicVolume
    }
    const pauseMusicWhenHidden = () => {
      if (document.hidden) {
        pauseMusic()
      }
    }

    document.addEventListener('visibilitychange', pauseMusicWhenHidden)
    window.addEventListener('blur', pauseMusic)

    return () => {
      document.removeEventListener('visibilitychange', pauseMusicWhenHidden)
      window.removeEventListener('blur', pauseMusic)
      music?.pause()
    }
  }, [musicVolume])

  useEffect(() => {
    window.addEventListener('blur', resetMobileJoystick)

    return () => {
      window.removeEventListener('blur', resetMobileJoystick)
    }
  }, [resetMobileJoystick])

  return (
    <main className="interactive-city-page">
      <audio
        ref={musicRef}
        src={CITY_MUSIC_SRC}
        autoPlay
        loop
        preload="auto"
        onPlay={() => setIsMusicPlaying(true)}
        onPause={() => setIsMusicPlaying(false)}
      />

      <div className="interactive-city-canvas">
        <Canvas camera={{ position: [0, 8, 14], fov: 55 }}>
          <Physics gravity={[0, -9.81, 0]}>
            <MemoizedCityScene
              onNearbyDestinationChange={setNearbyDestination}
              onExploreDestination={setActiveDestination}
              onCurrentAreaChange={setCurrentArea}
              onMapPositionChange={setCarPosition}
              isDestinationOpen={activeDestination !== null}
              onCloseDestination={closeDestination}
              mobileControls={mobileControls}
            />
          </Physics>
        </Canvas>
      </div>

      <div className="interactive-city-area" role="status" aria-live="polite">
        <span>Current area</span>
        <strong>{currentArea}</strong>
      </div>

      <button
        type="button"
        className="interactive-city-exit"
        onClick={() => navigate('/', { replace: true })}
      >
        <span aria-hidden="true">←</span>
        Exit city
      </button>

      <div className="interactive-city-audio" aria-label="City soundtrack">
        <button
          type="button"
          className="interactive-city-audio-toggle"
          aria-label={isMusicPlaying ? 'Stop city music' : 'Resume city music'}
          aria-pressed={isMusicPlaying}
          onClick={toggleMusic}
        >
          <span aria-hidden="true">{isMusicPlaying ? '■' : '▶'}</span>
        </button>

        <div className="interactive-city-audio-title">
          <strong>Music</strong>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={musicVolume}
          aria-label="City music volume"
          onChange={updateMusicVolume}
        />
      </div>

      <CityMiniMap
        carPosition={carPosition}
        isOpen={isMapOpen}
        onToggle={() => setIsMapOpen((isOpen) => !isOpen)}
      />

      <div className="interactive-city-mobile-controls" aria-label="Driving controls">
        <button
          type="button"
          className="mobile-drive-trackpad"
          aria-label="Drag to drive and steer"
          onPointerDown={startMobileJoystick}
          onPointerMove={moveMobileJoystick}
          onPointerUp={stopMobileJoystick}
          onPointerCancel={stopMobileJoystick}
          onLostPointerCapture={resetMobileJoystick}
        >
          <span className="mobile-drive-trackpad-label">Drag to drive</span>
          <span
            className="mobile-drive-trackpad-knob"
            aria-hidden="true"
            style={{
              transform: `translate(calc(-50% + ${mobileJoystickPosition.x * 2.15}rem), calc(-50% + ${mobileJoystickPosition.y * 2.15}rem))`,
            }}
          />
        </button>

        <button
          type="button"
          className="mobile-explore-button"
          disabled={!nearbyDestination && !activeDestination}
          onClick={exploreFromMobile}
        >
          <span>Explore</span>
          <small>{nearbyDestination?.name ?? 'Move closer'}</small>
        </button>
      </div>

      {nearbyDestination && !activeDestination && (
        <div className="interactive-city-prompt" role="status">
          <kbd>Space</kbd>
          <span>
            Explore <strong>{nearbyDestination.name}</strong>
          </span>
        </div>
      )}

      {activeDestination && (
        <aside className="interactive-city-location-panel">
          <p className="city-location-category">
            {
              districtDefinitions.find(
                (district) => district.id === activeDestination.district,
              )?.name
            }
            {' · '}
            {activeDestination.category}
          </p>
          <h1>{activeDestination.name}</h1>

          {activeDestination.context && (
            <p className="city-location-context">
              {activeDestination.context}
            </p>
          )}

          <p className="city-location-summary">
            {activeDestination.description}
          </p>

          {activeDestination.id === 'graduation-park' && (
            <img
              className="city-location-photo"
              src={graduationPhoto}
              alt="Anushka in her graduation gown at UW–Madison"
            />
          )}

          {activeDestination.details && (
            <div className="city-location-details">
              {activeDestination.details.map((paragraph, index) => (
                <p key={`${activeDestination.id}-detail-${index}`}>
                  {paragraph}
                </p>
              ))}
            </div>
          )}

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
            Continue driving · Space or Esc
          </button>
        </aside>
      )}
    </main>
  )
}
export default InteractiveCity
