'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Decorative particle field behind the hero text. Not interactive.
// Only ever mounted via next/dynamic with ssr:false  see app/page.tsx.
export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !canvasRef.current) {
      setUseFallback(true);
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
      });
    } catch {
      setUseFallback(true);
      return;
    }

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      canvas.clientWidth / Math.max(canvas.clientHeight, 1),
      0.1,
      100
    );
    camera.position.z = 20;

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particleCount = 120;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x059669,
      size: 0.12,
      transparent: true,
      opacity: 0.5,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let animationId = 0;
    const animate = () => {
      points.rotation.y += 0.0006;
      points.rotation.x += 0.0002;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!canvasRef.current) return;
      camera.aspect = canvas.clientWidth / Math.max(canvas.clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <>
      {/* Always-on soft gradient so the hero never looks blank */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(5,150,105,0.18), transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(4,120,87,0.12), transparent 50%), linear-gradient(180deg, #F0FDF4 0%, #ECFDF5 100%)',
        }}
      />
      {!useFallback && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden
        />
      )}
      {/* Scrim for readable text over particles */}
      <div className="absolute inset-0 bg-bgAlt/40 pointer-events-none" aria-hidden />
    </>
  );
}
