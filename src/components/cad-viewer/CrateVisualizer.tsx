'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Suspense } from 'react'
import { CrateConfiguration } from '@/types/cad'

interface CrateVisualizerProps {
  config: CrateConfiguration
  showPMI?: boolean
  showDimensions?: boolean
}

function LightingRig() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[10, 12, 8]} intensity={1.1} castShadow />
      <pointLight position={[-6, -8, -10]} intensity={0.6} />
    </>
  )
}

function CrateAssemblyPlaceholder({ config }: { config: CrateConfiguration }) {
  const { length, width, height } = config.product
  return (
    <mesh position={[0, height / 24, 0]}>
      <boxGeometry args={[length / 12, height / 12, width / 12]} />
      <meshStandardMaterial color="#1f60ff" opacity={0.4} transparent />
    </mesh>
  )
}

function PMIOverlay() {
  return null
}

function DimensionOverlay() {
  return null
}

export function CrateVisualizer({ config, showPMI, showDimensions }: CrateVisualizerProps) {
  return (
    <div className="h-[480px] w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
      <Canvas shadows camera={{ position: [14, 12, 14], fov: 45 }}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[14, 12, 14]} />
          <LightingRig />
          <CrateAssemblyPlaceholder config={config} />
          {showPMI ? <PMIOverlay /> : null}
          {showDimensions ? <DimensionOverlay /> : null}
          <OrbitControls enablePan enableRotate enableZoom maxDistance={50} minDistance={4} />
        </Suspense>
      </Canvas>
    </div>
  )
}
