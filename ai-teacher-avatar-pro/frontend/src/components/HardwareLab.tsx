import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface HardwareComponent {
  id: string;
  name: string;
  type: 'resistor' | 'led' | 'arduino' | 'wire' | 'breadboard';
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  value?: string;
}

export function HardwareLab() {
  const [components, setComponents] = useState<HardwareComponent[]>([
    {
      id: 'arduino',
      name: 'Arduino Uno',
      type: 'arduino',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      color: '#005792'
    },
    {
      id: 'breadboard',
      name: 'Breadboard',
      type: 'breadboard',
      position: [0, -2, 0],
      rotation: [0, 0, 0],
      color: '#ffffff'
    },
    {
      id: 'led1',
      name: 'LED Red',
      type: 'led',
      position: [-2, 0, 0],
      rotation: [0, 0, 0],
      color: '#ff0000'
    },
    {
      id: 'resistor1',
      name: '220Ω Resistor',
      type: 'resistor',
      position: [2, 0, 0],
      rotation: [0, 0, 0],
      color: '#8b4513',
      value: '220Ω'
    }
  ]);

  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentFlow, setCurrentFlow] = useState(false);

  const handleComponentClick = (componentId: string) => {
    setSelectedComponent(componentId);
  };

  const startSimulation = () => {
    setIsSimulating(true);
    setCurrentFlow(true);
    setTimeout(() => {
      setCurrentFlow(false);
    }, 3000);
  };

  const renderComponent = (component: HardwareComponent) => {
    switch (component.type) {
      case 'arduino':
        return (
          <Box
            key={component.id}
            position={component.position}
            rotation={component.rotation}
            args={[4, 1, 2]}
            onClick={() => handleComponentClick(component.id)}
          >
            <meshStandardMaterial color={component.color} />
            <Text
              position={[0, 0.6, 0]}
              fontSize={0.3}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {component.name}
            </Text>
          </Box>
        );
      
      case 'breadboard':
        return (
          <Box
            key={component.id}
            position={component.position}
            rotation={component.rotation}
            args={[6, 0.5, 4]}
            onClick={() => handleComponentClick(component.id)}
          >
            <meshStandardMaterial color={component.color} />
            <Text
              position={[0, 0.3, 0]}
              fontSize={0.2}
              color="black"
              anchorX="center"
              anchorY="middle"
            >
              {component.name}
            </Text>
          </Box>
        );
      
      case 'led':
        return (
          <group key={component.id} position={component.position}>
            <Sphere
              args={[0.3]}
              onClick={() => handleComponentClick(component.id)}
            >
              <meshStandardMaterial 
                color={currentFlow ? '#00ff00' : component.color}
                emissive={currentFlow ? '#00ff00' : '#ff0000'}
                emissiveIntensity={currentFlow ? 0.5 : 0.2}
              />
            </Sphere>
            <Text
              position={[0, 0.5, 0]}
              fontSize={0.2}
              color="black"
              anchorX="center"
              anchorY="middle"
            >
              {component.name}
            </Text>
          </group>
        );
      
      case 'resistor':
        return (
          <group key={component.id} position={component.position}>
            <Box
              args={[1, 0.2, 0.2]}
              onClick={() => handleComponentClick(component.id)}
            >
              <meshStandardMaterial color={component.color} />
            </Box>
            <Text
              position={[0, 0.3, 0]}
              fontSize={0.15}
              color="black"
              anchorX="center"
              anchorY="middle"
            >
              {component.value}
            </Text>
          </group>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold">🔧 Hardware Laboratory</h1>
        <p className="text-gray-600">Interactive 3D electronics simulation</p>
      </div>

      {/* Controls */}
      <div className="bg-gray-50 border-b p-4">
        <div className="flex gap-4 items-center">
          <button
            onClick={startSimulation}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {isSimulating ? 'Simulating...' : 'Start Simulation'}
          </button>
          <button
            onClick={() => setIsSimulating(false)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Stop
          </button>
          
          {selectedComponent && (
            <div className="bg-white p-3 rounded border">
              <strong>Selected:</strong> {selectedComponent}
            </div>
          )}
        </div>
      </div>

      {/* 3D Scene */}
      <div className="flex-1">
        <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          {components.map(renderComponent)}
          
          {/* Connection wires */}
          {currentFlow && (
            <>
              <Box
                position={[1, 0, 0]}
                args={[2, 0.05, 0.05]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
              </Box>
              <Box
                position={[-1, 0, 0]}
                args={[2, 0.05, 0.05]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <meshStandardMaterial color="#0000ff" emissive="#0000ff" emissiveIntensity={0.5} />
              </Box>
            </>
          )}
          
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          
          {/* Grid */}
          <gridHelper args={[20, 20]} />
        </Canvas>
      </div>

      {/* Instructions */}
      <div className="bg-white border-t p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>🖱️ Controls:</strong> Click components to select, drag to rotate view
          </div>
          <div>
            <strong>⚡ Current Project:</strong> Arduino LED Circuit with Resistor
          </div>
          <div>
            <strong>🔬 Status:</strong> {isSimulating ? 'Simulating current flow' : 'Ready to simulate'}
          </div>
        </div>
      </div>
    </div>
  );
}
