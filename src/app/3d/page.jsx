"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    vec2 mouse = u_mouse / u_resolution;
    float time = u_time * 0.15;

    float wave1 = sin(uv.x * 8.0 + time * 2.0);
    float wave2 = sin(uv.y * 10.0 - time * 1.5);
    float wave3 = sin((uv.x + uv.y) * 12.0 + time);

    float glow = (wave1 + wave2 + wave3) / 3.0;

    float mouseDistance = distance(uv, mouse);
    float mouseGlow = smoothstep(0.5, 0.0, mouseDistance);

    vec3 darkBlue = vec3(0.02, 0.05, 0.12);
    vec3 blue = vec3(0.10, 0.35, 0.85);
    vec3 purple = vec3(0.45, 0.20, 0.75);

    vec3 color = mix(darkBlue, blue, glow * 0.5 + 0.5);
    color = mix(color, purple, mouseGlow * 0.35);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function ShaderBackground() {
  const materialRef = useRef();
  const { size } = useThree();

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMotion = () => {
      setReducedMotion(mediaQuery.matches);
    };

    updateMotion();
    mediaQuery.addEventListener("change", updateMotion);

    return () => {
      mediaQuery.removeEventListener("change", updateMotion);
    };
  }, []);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_resolution: { value: [size.width, size.height] },
      u_mouse: { value: [size.width / 2, size.height / 2] },
    }),
    []
  );

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_resolution.value = [
        size.width,
        size.height,
      ];
    }
  }, [size]);

  useFrame((state) => {
    if (!materialRef.current) return;

    if (!reducedMotion) {
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
    }

    materialRef.current.uniforms.u_mouse.value = [
      state.pointer.x * size.width * 0.5 + size.width * 0.5,
      state.pointer.y * size.height * 0.5 + size.height * 0.5,
    ];
  });

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function ThreeDPage() {
  return (
    <main
      style={{
        width: "100%",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "#020617",
      }}
    >
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
        }}
        dpr={[1, 2]}
      >
        <ShaderBackground />
      </Canvas>

      <section
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          textAlign: "center",
          color: "white",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            padding: "40px",
            borderRadius: "24px",
            background: "rgba(2, 6, 23, 0.55)",
            backdropFilter: "blur(10px)",
          }}
        >
          <p
            style={{
              marginBottom: "12px",
              color: "#93c5fd",
              fontSize: "14px",
              fontWeight: "600",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            Frontend AI Engineering
          </p>

          <h1
            style={{
              fontSize: "clamp(42px, 8vw, 80px)",
              lineHeight: 1,
              margin: "0 0 24px",
              fontWeight: 800,
            }}
          >
            Signature Hero
          </h1>

          <p
            style={{
              fontSize: "18px",
              lineHeight: 1.7,
              color: "#dbeafe",
              margin: 0,
            }}
          >
            A custom fullscreen GLSL shader experience built with
            React Three Fiber.
          </p>
        </div>
      </section>
    </main>
  );
}