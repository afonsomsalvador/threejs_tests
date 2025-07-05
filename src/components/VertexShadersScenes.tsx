"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import testTexture from "@/assets/texture.jpg";
import testTexture2 from "@/assets/water.jpg";
import testTexture3 from "@/assets/teste1234.png";

export default function vertexShadersScenes() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Ativa o antialiasing e o alpha para fundo transparente
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

    const plane = new THREE.PlaneGeometry(0.5, 0.5, 100, 100);

    // materiais
    const lamber = new THREE.MeshLambertMaterial(); // Material que reflete a luz

    const material = new THREE.MeshNormalMaterial(); // Material que muda de cor automaticamente

    const material2 = new THREE.ShaderMaterial({
      // wireframe: true, // Ativa o modo wireframe
      uniforms: {
        time: { value: 1.0 },
        uTexture: { value: new THREE.TextureLoader().load(testTexture2.src) }, // Carrega uma textura, se tirar aperece só a cor
        resolution: {
          value: new THREE.Vector2(),
        },
      },
      vertexShader: `
      uniform float time;
      varying float pulse;

      varying vec2 vUv;
      
      void main() {
            vUv = uv;
            vec3 newPosition = position;
            newPosition.z = 0.15*sin(length(position) * 30. + time);    //  newPosition.z = 0.5*sin(newPosition.x * 30. + time);
            pulse = 2.*newPosition.z;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 0.5); // vec4(newPosition, 1.0);
            // a diferença entre o newPosition e position é que o newPosition é modificado para criar o efeito de pulso
        }
        `,
      fragmentShader: `
      uniform float time;
      uniform sampler2D uTexture;

      varying float pulse;
      varying vec2 vUv;

      void main() {
          //vec4 myimage = texture2D(uTexture, vUv);   
          vec4 myimage = texture2D(uTexture, vUv + 0.01*sin(vUv * 20. + time)); // Obtém a textura

          // float sinePulse = (1. + sin(vUv.x * 10.)) * 0.5;
          float sinePulse = (1. + sin(vUv.x * 50. + time)) * 0.5; // o + time faz mexer as barras, se for - time faz o efeito contrário
          
          gl_FragColor = vec4(vUv, 0., 1.);
          gl_FragColor = vec4(sinePulse, 0., 0., 1.);
          // gl_FragColor = vec4(1., pulse, 0., 1.); Define a cor do fragmento
          // gl_FragColor = vec4(1., 1., 0., 1.); Define a cor do fragmento

          gl_FragColor = myimage;
      }`,
    });

    // o vUv faz com que a textura se mova
    //vec2 = vetor de ponto flutuante de 2 componentes
    //vec4 = vetor de ponto flutuante de 4 componentes

    const cube = new THREE.Mesh(plane, material2); // Cria o cubo com a geometria e material
    scene.add(cube);

    const controls = new OrbitControls(camera, renderer.domElement); //Faz o controle da câmera

    camera.position.z = 1; //Posiciona a longitude da câmera

    const animate = () => {
      requestAnimationFrame(animate);
      // cube.rotation.x += 0.01; //Faz o cubo girar
      // cube.rotation.y += 0.01; //Faz o cubo girar
      material2.uniforms.time.value += 0.01; // Atualiza o valor de time, o que faz o efeito do objeto mover
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
