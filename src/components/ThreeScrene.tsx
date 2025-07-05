"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true}); // Ativa o antialiasing e o alpha para fundo transparente
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

    // geometrias

    const geometry = new THREE.BoxGeometry();

    const sphere = new THREE.SphereGeometry(0.2, 3, 3);

    const plane = new THREE.PlaneGeometry(0.5, 0.5);


    // materiais
    const lamber = new THREE.MeshLambertMaterial(); // Material que reflete a luz~

    const material = new THREE.MeshNormalMaterial(); // Material que muda de cor automaticamente

    const material2 = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
        resolution: {
          value: new THREE.Vector2(),
        },
      },
      vertexShader: `
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
        `,
      fragmentShader: `
      void main() {
          gl_FragColor = vec4(1.0, 0., 0., 1.);
      }`,
    });

    const cube = new THREE.Mesh(geometry, material); // Cria o cubo com a geometria e material
    scene.add(cube);

    const controls = new OrbitControls(camera, renderer.domElement); //Faz o controle da câmera

    camera.position.z = 2; //Posiciona a longitude da câmera

    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01; //Faz o cubo girar
      cube.rotation.y += 0.01; //Faz o cubo girar
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
