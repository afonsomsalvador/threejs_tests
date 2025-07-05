"use client";
import { useState } from "react";
import ThreeScene from "@/components/ThreeScrene";
import VertexShadersScenes from "@/components/VertexShadersScenes";
import CombiningShaders from "@/components/CombiningShaders";

const scenes = [
  { name: "Cena 1", component: <ThreeScene /> },
  { name: "Cena 2", component: <VertexShadersScenes /> },
  { name: "Cena 3", component: <CombiningShaders /> },
  { name: "Cena 4", component: <CombiningShaders /> },
];

export default function ScenesSwitcher() {
  const [activeSceneIndex, setActiveSceneIndex] = useState(2);

  return (
    <>
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white/20">
        {scenes.map((scene, idx) => (
          <button
            key={scene.name}
            onClick={() => setActiveSceneIndex(idx)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              idx === activeSceneIndex
                ? "bg-white text-black shadow"
                : "text-white/80 hover:bg-white/20"
            }`}
          >
            {scene.name}
          </button>
        ))}
      </nav>
      <main className="w-screen h-screen">
        {scenes[activeSceneIndex].component}
      </main>
    </>
  );
}