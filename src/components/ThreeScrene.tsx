"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    const mount = mountRef.current!;
    mount.appendChild(renderer.domElement);

      const faceMaterials = [
      new THREE.MeshBasicMaterial({ color: 0xff0000 }), // frente
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // trás
      new THREE.MeshBasicMaterial({ color: 0x0000ff }), // topo
      new THREE.MeshBasicMaterial({ color: 0xffff00 }), // baixo
      new THREE.MeshBasicMaterial({ color: 0xff00ff }), // direita
      new THREE.MeshBasicMaterial({ color: 0x00ffff }), // esquerda
    ];
    
    // Exemplo: adiciona um cubo
    const geometry = new THREE.BoxGeometry();
    // const material = new THREE.MeshBasicMaterial();
    const cube = new THREE.Mesh(geometry, faceMaterials);
    scene.add(cube);
    
    const controls = new OrbitControls(camera, renderer.domElement); //Faz o controle da câmera

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    // Limpeza ao desmontar
    return () => {
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
}
