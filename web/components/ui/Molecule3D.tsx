"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

function DNA({ count = 20, radius = 2.5 }) {
    const { theme } = useTheme();
    const group = useRef<THREE.Group>(null);
    const isDark = theme === 'dark';

    // Generate DNA helix positions
    const { atoms, bonds } = useMemo(() => {
        const atoms = [];
        const bonds = [];

        // Height and twist params
        const height = 15;
        const twist = Math.PI * 4; // 2 full turns

        for (let i = 0; i <= count; i++) {
            const t = i / count;
            const angle = t * twist;
            const y = (t - 0.5) * height;

            // Strand 1 Position
            const x1 = Math.cos(angle) * radius;
            const z1 = Math.sin(angle) * radius;
            const pos1 = new THREE.Vector3(x1, y, z1);

            // Strand 2 Position (Offset by PI)
            const x2 = Math.cos(angle + Math.PI) * radius;
            const z2 = Math.sin(angle + Math.PI) * radius;
            const pos2 = new THREE.Vector3(x2, y, z2);

            // Add Atoms
            atoms.push({ position: pos1, color: isDark ? "#6366f1" : "#3b82f6" }); // Indigo/Blue
            atoms.push({ position: pos2, color: isDark ? "#d946ef" : "#ec4899" }); // Fuchsia/Pink

            // Add Bond between strands (Base pair)
            bonds.push({ start: pos1, end: pos2, type: 'basepair' });

            // Add Backbone bonds (connect to previous)
            if (i > 0) {
                const prevT = (i - 1) / count;
                const prevAngle = prevT * twist;
                const prevY = (prevT - 0.5) * height;

                const prevX1 = Math.cos(prevAngle) * radius;
                const prevZ1 = Math.sin(prevAngle) * radius;
                const prevPos1 = new THREE.Vector3(prevX1, prevY, prevZ1);

                const prevX2 = Math.cos(prevAngle + Math.PI) * radius;
                const prevZ2 = Math.sin(prevAngle + Math.PI) * radius;
                const prevPos2 = new THREE.Vector3(prevX2, prevY, prevZ2);

                bonds.push({ start: prevPos1, end: pos1, type: 'backbone' });
                bonds.push({ start: prevPos2, end: pos2, type: 'backbone' });
            }
        }
        return { atoms, bonds };
    }, [count, radius, isDark]);

    useFrame((state) => {
        if (group.current) {
            // Gentle floating rotation
            group.current.rotation.y += 0.003;
            // Slight tilt sway
            group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
        }
    });

    // Physical Material Props for "Realistic" look
    const atomMaterialProps = isDark
        ? {
            // Dark Mode: Glowing, Metallic
            roughness: 0.2,
            metalness: 0.8,
            emissiveIntensity: 0.4,
            toneMapped: false
        }
        : {
            // Light Mode: Glassy, Water-like, Clean
            roughness: 0.1,
            metalness: 0.1,
            transmission: 0.6,
            thickness: 0.5,
            clearcoat: 1,
            transparent: true,
            opacity: 0.9
        };

    return (
        <group ref={group}>
            {/* Render Atoms */}
            {atoms.map((atom, i) => (
                <mesh key={`atom-${i}`} position={atom.position} castShadow receiveShadow>
                    <sphereGeometry args={[0.35, 32, 32]} />
                    <meshPhysicalMaterial
                        color={atom.color}
                        emissive={isDark ? atom.color : undefined}
                        {...atomMaterialProps}
                    />
                </mesh>
            ))}

            {/* Render Bonds */}
            {bonds.map((bond, i) => {
                const start = bond.start;
                const end = bond.end;
                const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
                const len = start.distanceTo(end);

                // Quaternion for cylinder rotation
                const direction = new THREE.Vector3().subVectors(end, start).normalize();
                const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

                const isBasePair = bond.type === 'basepair';
                const thickness = isBasePair ? 0.1 : 0.15; // Backbone is slightly thicker
                const color = isBasePair
                    ? (isDark ? "#94a3b8" : "#cbd5e1")
                    : (isDark ? "#475569" : "#94a3b8");

                return (
                    <mesh key={`bond-${i}`} position={mid} quaternion={quaternion} castShadow>
                        <cylinderGeometry args={[thickness, thickness, len, 16]} />
                        <meshPhysicalMaterial
                            color={color}
                            roughness={0.4}
                            metalness={0.5}
                            transmission={isDark ? 0 : 0.2}
                            transparent={!isDark}
                        />
                    </mesh>
                )
            })}
        </group>
    );
}

export function Molecule3D({ className }: { className?: string }) {
    return (
        <div className={className}>
            <Canvas
                camera={{ position: [0, 0, 14], fov: 40 }}
                gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
                dpr={[1, 2]} // Handle high-DPI screens
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-10, -5, -10]} intensity={1} color="#3b82f6" />
                <Environment preset="city" />

                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    <DNA count={18} />
                </Float>
            </Canvas>
        </div>
    );
}
