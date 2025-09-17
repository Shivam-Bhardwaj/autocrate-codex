'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box, Grid, Text } from '@react-three/drei'
import { NXBox } from '@/lib/nx-generator'
import { Suspense } from 'react'

interface CrateVisualizerProps {
  boxes: NXBox[]
  showGrid?: boolean
  showLabels?: boolean
}

// Component to render a single box from NX two-point definition
function NXBoxMesh({ box }: { box: NXBox }) {
  // Calculate center and size from two diagonal points
  const center = {
    x: (box.point1.x + box.point2.x) / 2,
    y: (box.point1.y + box.point2.y) / 2,
    z: (box.point1.z + box.point2.z) / 2,
  }

  const size = {
    x: Math.abs(box.point2.x - box.point1.x),
    y: Math.abs(box.point2.y - box.point1.y),
    z: Math.abs(box.point2.z - box.point1.z),
  }

  // Convert inches to display units (scale down for better viewing)
  const scale = 0.1

  return (
    <Box
      position={[center.x * scale, center.z * scale, -center.y * scale]}
      args={[size.x * scale, size.z * scale, size.y * scale]}
    >
      <meshStandardMaterial
        color={box.color || '#8B4513'}
        opacity={box.type === 'panel' ? 0.7 : 1}
        transparent={box.type === 'panel'}
      />
    </Box>
  )
}

export default function CrateVisualizer({ boxes, showGrid = true, showLabels = true }: CrateVisualizerProps) {
  return (
    <div className="w-full h-full bg-gray-100 rounded-lg">
      <Canvas
        camera={{
          position: [15, 10, 15],
          fov: 45,
          near: 0.1,
          far: 1000
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          {/* Grid for reference - Floor plane (horizontal) */}
          {showGrid && (
            <>
              {/* Main grid on floor */}
              <gridHelper args={[20, 20, '#444444', '#888888']} position={[0, 0, 0]} />
              {/* Alternative: using a plane mesh */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshBasicMaterial color="#f0f0f0" opacity={0.5} transparent />
              </mesh>
            </>
          )}

          {/* Coordinate axes - small reference arrows */}
          {showLabels && (
            <>
              {/* X axis - Red */}
              <mesh position={[0.5, 0.1, 0]}>
                <boxGeometry args={[1, 0.02, 0.02]} />
                <meshBasicMaterial color="red" />
              </mesh>
              <Text
                position={[1.2, 0.1, 0]}
                fontSize={0.2}
                color="red"
              >
                X
              </Text>

              {/* Y axis - Green (Z in NX) */}
              <mesh position={[0, 0.6, 0]}>
                <boxGeometry args={[0.02, 1, 0.02]} />
                <meshBasicMaterial color="green" />
              </mesh>
              <Text
                position={[0, 1.3, 0]}
                fontSize={0.2}
                color="green"
              >
                Z
              </Text>

              {/* Z axis - Blue (Y in NX) */}
              <mesh position={[0, 0.1, -0.5]}>
                <boxGeometry args={[0.02, 0.02, 1]} />
                <meshBasicMaterial color="blue" />
              </mesh>
              <Text
                position={[0, 0.1, -1.2]}
                fontSize={0.2}
                color="blue"
              >
                Y
              </Text>
            </>
          )}

          {/* Render all boxes */}
          {boxes.map((box, index) => (
            <NXBoxMesh key={`${box.name}-${index}`} box={box} />
          ))}

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxDistance={50}
            minDistance={2}
            target={[0, 3, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}