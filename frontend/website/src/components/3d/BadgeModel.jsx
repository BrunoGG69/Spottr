import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export default function BadgeModel() {
  const { scene } = useGLTF('/Spottr.glb')
  const groupRef = useRef()

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const center = box.getCenter(new THREE.Vector3())
    scene.position.sub(center)

    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.transparent = true
        child.material.opacity = 0.7
        child.material.roughness = 0.3
        child.material.metalness = 0.1
        child.castShadow = true
      }
    })
  }, [scene])

  useFrame((state, delta) => {
    groupRef.current.rotation.y += delta * 0.5
  })

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        scale={0.05}
      />
    </group>
  )
}