import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeHeroCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Group for primary luxury abstract geometry
    const group = new THREE.Group();
    scene.add(group);

    // Outer architectural lattice - icosahedron
    const outerGeo = new THREE.IcosahedronGeometry(2.4, 1);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0xc9a84c,
      metalness: 0.85,
      roughness: 0.2,
      transparent: true,
      opacity: 0.22,
      emissive: 0x3d3010,
      emissiveIntensity: 0.35,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    group.add(outerMesh);

    // Outer wireframe cage
    const wireGeo = new THREE.IcosahedronGeometry(2.42, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xf3e2a9,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    group.add(wireMesh);

    // Mid-level geometric octahedron ring
    const midGeo = new THREE.OctahedronGeometry(1.8, 1);
    const midMat = new THREE.MeshStandardMaterial({
      color: 0xe6cf8b,
      metalness: 0.9,
      roughness: 0.15,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const midMesh = new THREE.Mesh(midGeo, midMat);
    group.add(midMesh);

    // Core luminous core jewel
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xfaf6ed,
      metalness: 0.95,
      roughness: 0.1,
      transparent: true,
      opacity: 0.18,
      emissive: 0xc9a84c,
      emissiveIntensity: 0.25
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // Floating gold particles / stars
    const particleCount = 240;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 22;
      posArray[i + 1] = (Math.random() - 0.5) * 14;
      posArray[i + 2] = (Math.random() - 0.5) * 12 - 2;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xc9a84c,
      size: 0.035,
      transparent: true,
      opacity: 0.65,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Refined warm lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(6, 8, 8);
    scene.add(dirLight1);

    const goldPointLight = new THREE.PointLight(0xc9a84c, 2.0, 30);
    goldPointLight.position.set(-5, -3, 5);
    scene.add(goldPointLight);

    const subtleFillLight = new THREE.PointLight(0x7090b0, 1.0, 20);
    subtleFillLight.position.set(4, -4, -3);
    scene.add(subtleFillLight);

    // Position offset on desktop (right side of hero)
    const updatePosition = () => {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        group.position.set(0, 0.5, 0);
        group.scale.set(0.85, 0.85, 0.85);
      } else {
        group.position.set(2.4, 0.1, 0);
        group.scale.set(1.05, 1.05, 1.05);
      }
    };
    updatePosition();

    // Parallax mouse control
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      targetX = (e.clientX / innerWidth - 0.5) * 0.8;
      targetY = (e.clientY / innerHeight - 0.5) * 0.5;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ResizeObserver for perfect fluid responsiveness
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !canvas) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      updatePosition();
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera/object parallax dampening
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;

      group.rotation.y = elapsedTime * 0.14 + currentX;
      group.rotation.x = elapsedTime * 0.06 + currentY;
      
      wireMesh.rotation.y = -elapsedTime * 0.09;
      wireMesh.rotation.z = elapsedTime * 0.05;

      midMesh.rotation.x = -elapsedTime * 0.12;
      midMesh.rotation.y = elapsedTime * 0.16;

      coreMesh.rotation.y = elapsedTime * 0.22;
      coreMesh.rotation.x = elapsedTime * 0.15;

      particleSystem.rotation.y = elapsedTime * 0.015;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      renderer.dispose();
      outerGeo.dispose();
      wireGeo.dispose();
      midGeo.dispose();
      coreGeo.dispose();
      particleGeo.dispose();
      outerMat.dispose();
      wireMat.dispose();
      midMat.dispose();
      coreMat.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      id="hero-3d-container"
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <canvas 
        ref={canvasRef} 
        id="hero-canvas-element"
        className="w-full h-full block opacity-85"
      />
    </div>
  );
};
