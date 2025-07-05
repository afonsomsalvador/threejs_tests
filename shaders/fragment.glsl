void main() {
    gl_FragColor = vec4(0.,0.,1., 1.);
}

/// <reference types="vite/client" />
declare module '*.glsl' {
  const value: string;
  export default value;
}