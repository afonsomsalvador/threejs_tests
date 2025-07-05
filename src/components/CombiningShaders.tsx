"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import testTexture from "@/assets/texture.jpg";
import testTexture2 from "@/assets/water.jpg";

export default function combiningShaders() {
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

    // geometrias

    const sphere = new THREE.SphereGeometry(0.5, 160, 160);

    // materiais

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
      varying vec3 vNormal;

      //	Simplex 4D Noise 
      //	by Ian McEwan, Stefan Gustavson (https://github.com/stegu/webgl-noise)
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}

vec4 grad4(float j, vec4 ip){
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 

  return p;
}

float snoise(vec4 v){
  const vec2  C = vec2( 0.138196601125010504,  // (5 - sqrt(5))/20  G4
                        0.309016994374947451); // (sqrt(5) - 1)/4   F4
// First corner
  vec4 i  = floor(v + dot(v, C.yyyy) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;

  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;

//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;

  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C 
  vec4 x1 = x0 - i1 + 1.0 * C.xxxx;
  vec4 x2 = x0 - i2 + 2.0 * C.xxxx;
  vec4 x3 = x0 - i3 + 3.0 * C.xxxx;
  vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;

// Permutations
  i = mod(i, 289.0); 
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
// Gradients
// ( 7*7*6 points uniformly over a cube, mapped onto a 4-octahedron.)
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.

  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

}

      void main() {
            vUv = uv;
            vNormal = normal; // Normal do vértice
            vec3 newPosition = position;

            float noise = snoise(vec4(normal * 40., time * 0.5)); // chama a função snoise com o vetor de 4 componentes

            //colei la em cima o codigo no simplex 4d noise daqui https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
            //o que interessa é a função snoise, vetor de 4 componentes
           
            // newPosition.z = 0.15*sin(length(position) * 30. + time);    //  newPosition.z = 0.5*sin(newPosition.x * 30. + time);
            // pulse = 2.*newPosition.z;

            // newPosition = newPosition + 0.1*normal * snoise (vec4(normal * 30., time * 0.1)); // * 0.1 vai reduzir a velocidade de animação


            newPosition = newPosition + 0.4 * normal * noise;
            pulse = noise;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 0.5); // vec4(newPosition, 1.0);
            
            // a diferença entre o newPosition e position é que o newPosition é modificado para criar o efeito de pulso
        }
        `,
      fragmentShader: `
      uniform float time;
      uniform sampler2D uTexture;

      varying float pulse;
      varying vec2 vUv;
      varying vec3 vNormal;

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
          //   gl_FragColor = vec4(vNormal, 1.);
          gl_FragColor = vec4(pulse, 0., 0., 1.);
      }`,
    });

    // o vUv faz com que a textura se mova
    //vec2 = vetor de ponto flutuante de 2 componentes
    //vec4 = vetor de ponto flutuante de 4 componentes

    const cube = new THREE.Mesh(sphere, material2); // Cria o cubo com a geometria e material
    scene.add(cube);

    const controls = new OrbitControls(camera, renderer.domElement); //Faz o controle da câmera

    camera.position.z = 3; //Posiciona a longitude da câmera

    const animate = () => {
      requestAnimationFrame(animate);
      // cube.rotation.x += 0.01; //Faz o cubo girar
      // cube.rotation.y += 0.01; //Faz o cubo girar
      material2.uniforms.time.value += 0.01; // Atualiza o valor de time, o que faz o efeito do objeto mover
      renderer.render(scene, camera);
    };
    
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    animate();

    window.addEventListener("resize", handleResize);
    // Limpeza ao desmontar
    return () => {
      mount.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <div ref={mountRef} />;
}
