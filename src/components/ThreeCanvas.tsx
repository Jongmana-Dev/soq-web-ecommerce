'use client'

import React, { useRef, Suspense, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber' // <-- เพิ่ม useThree
import { OrbitControls, Environment, useFBX } from '@react-three/drei'
import * as THREE from 'three'

interface ProductModelProps {
  scrollProgress: number;
}

function FBXModel({ scrollProgress }: ProductModelProps) {
  const fbx = useFBX('/waterbottle.fbx');

  const meshRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // หมุนตาม scroll
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2; 
      
      // ขยับขึ้นลงเล็กน้อยตาม scroll
      meshRef.current.position.y = Math.sin(scrollProgress * Math.PI * 2) * 0.1;

      // ===========================================
      // ปรับขนาดและการวางตำแหน่งของโมเดลให้เหมาะสม
      // คุณต้องปรับค่าเหล่านี้ตามโมเดลของคุณเอง
      meshRef.current.scale.set(0.015, 0.015, 0.015); // ตัวอย่าง: เพิ่มขนาดเล็กน้อย
      meshRef.current.position.set(0, -0.5, 0); // ตัวอย่าง: เลื่อนโมเดลลงมาให้อยู่บนพื้น
      meshRef.current.rotation.set(0, 0, 0); // รีเซ็ต rotation เริ่มต้น (ถ้าจำเป็น)
      // ===========================================
    }
  });

  useEffect(() => {
    if (fbx) {
      fbx.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#ffffff'), // สีขาว
            metalness: 0.8,
            roughness: 0.2,
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [fbx]);

  return <primitive object={fbx} ref={meshRef} />;
}

// ==============================================
//           ใหม่: พื้นสำหรับโมเดล
// ==============================================
function Ground() {
  const { scene } = useThree();
  useEffect(() => {
    // ปรับสีพื้นหลังของ Three.js scene ให้เป็นสีขาว/เทาอ่อน
    // เพื่อให้เข้ากับภาพตัวอย่าง
    scene.background = new THREE.Color(0xf6f6f6); // สีเทาอ่อนมาก
  }, [scene]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow> {/* เลื่อนพื้นลงมา */}
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color={0xf0f0f0} roughness={0.8} metalness={0.1} /> {/* สีเทาอ่อน */}
    </mesh>
  );
}
// ==============================================

interface ThreeCanvasProps {
  scrollProgress: number; // 0-1
}

export function ThreeCanvas({ scrollProgress }: ThreeCanvasProps) {
  const [hasWebGL, setHasWebGL] = useState(false);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    setHasWebGL(!!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  }, []);

  if (!hasWebGL) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100 text-gray-500">
        WebGL not supported. Displaying static image.
      </div>
    );
  }

  return (
    <Canvas 
      camera={{ position: [0, 2, 5], fov: 60 }} // ปรับตำแหน่งกล้องให้มุมกว้างขึ้นและมองลงมา
      shadows
    >
      {/* แสงโดยรอบ (Ambient Light) */}
      <ambientLight intensity={0.4} /> 
      {/* แสงหลักจากด้านบนขวา (เหมือนแสงใน studio) */}
      <directionalLight position={[3, 5, 2]} intensity={1.5} castShadow /> 
      {/* แสงเสริมจากอีกฝั่ง */}
      <directionalLight position={[-3, 2, -2]} intensity={0.6} /> 
      {/* แสงด้านบน */}
      <directionalLight position={[0, 5, 0]} intensity={0.8} />

      {/* ปรับแต่งเงา */}
      <spotLight
        position={[0, 5, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />

      <Environment preset="studio" /> {/* ใช้ preset 'studio' เพื่อแสงที่นุ่มนวลขึ้น */}
      
      <Suspense fallback={null}>
        <FBXModel scrollProgress={scrollProgress} />
        <Ground /> {/* เพิ่มพื้น */}
      </Suspense>

      {/* <OrbitControls enableZoom={false} enablePan={false} /> */}
    </Canvas>
  )
}