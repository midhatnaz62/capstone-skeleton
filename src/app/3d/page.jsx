"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";

function Cube({ color, reducedMotion }) {
  const meshRef = useRef();
  const [active, setActive] = useState(false);

  useFrame(() => {
    if (meshRef.current && !reducedMotion) {
      meshRef.current.rotation.x += active ? 0.03 : 0.01;
      meshRef.current.rotation.y += active ? 0.03 : 0.01;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 1.5, 0]}
      scale={active ? 1.2 : 1}
      onClick={() => setActive(!active)}
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial
        color={color}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
}

function Platform() {
  return (
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[8, 8]} />
      <meshStandardMaterial color="#171a24" />
    </mesh>
  );
}

export default function ThreeDPage() {
  const [color, setColor] = useState("#3b82f6");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMotionPreference = () => {
      setReducedMotion(mediaQuery.matches);
    };

    updateMotionPreference();

    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  return (
    <main
      style={{
        width: "100%",
        height: "100vh",
        background: "#0d0f12",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "30px",
          left: "30px",
          zIndex: 10,
          color: "white",
          maxWidth: "600px",
        }}
      >
        <h1>Interactive 3D Experience</h1>

        <p>
          Drag to rotate • Scroll to zoom • Change the cube color
        </p>

        <p>
          Keyboard users can use the controls, and the color buttons provide
          accessible labels for the 3D interaction.
        </p>

        <p>
          {reducedMotion
            ? "Reduced motion is enabled, so automatic animation is disabled."
            : "Automatic animation is enabled."}
        </p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "15px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setColor("#3b82f6")}
            style={{
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            Blue
          </button>

          <button
            onClick={() => setColor("#a78bfa")}
            style={{
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            Purple
          </button>

          <button
            onClick={() => setColor("#3fb8af")}
            style={{
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            Teal
          </button>
        </div>
      </div>

      <Canvas camera={{ position: [4, 4, 6], fov: 50 }}>
        <ambientLight intensity={0.8} />

        <directionalLight
          position={[5, 8, 5]}
          intensity={2}
        />

        <pointLight
          position={[-4, 4, -4]}
          intensity={1}
        />

        <Cube
          color={color}
          reducedMotion={reducedMotion}
        />

        <Platform />

        <OrbitControls
          enablePan={false}
          minDistance={4}
          maxDistance={10}
        />

        <gridHelper args={[8, 8]} />
      </Canvas>
    </main>
  );
}