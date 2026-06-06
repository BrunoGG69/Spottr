import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei'
import BadgeModel from './BadgeModel'
import {createCanvasElement} from "three";

export default function BadgeCanvas() {
    return (
        <Canvas
            camera = {{ position: [0, 0, 8], fov: 45 }}
            style = {{ background: 'transparent' }}
        >
            <Suspense fallback={null}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
                <pointLight position={[-10, -5, -5]} intensity={0.5} color="#06B6D4" />
                <pointLight position={[5, -5, 5]} intensity={0.3} color="#F59E0B" />

                <BadgeModel />

                <ContactShadows
                    position={[0, -3, 0]}
                      opacity={0.4}
                      scale={10}
                      blur={2}
                      color="#06B6D4"
                />

                <OrbitControls
                  enableZoom={false}
                  enablePan={false}
                  autoRotate={false}
                />

                <Environment preset = "city" />
            </Suspense>
        </Canvas>
    )
}