import React, { useState, useEffect } from 'react';

interface ScienceExperiment {
  id: string;
  title: string;
  subject: 'physics' | 'chemistry' | 'biology';
  description: string;
  materials: string[];
  steps: string[];
  currentStep: number;
  isRunning: boolean;
}

export function ScienceSimulation() {
  const [selectedExperiment, setSelectedExperiment] = useState<ScienceExperiment | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const experiments: ScienceExperiment[] = [
    {
      id: 'pendulum',
      title: 'Simple Pendulum',
      subject: 'physics',
      description: 'Explore the relationship between length and period',
      materials: ['String', 'Weight', 'Support stand', 'Timer', 'Ruler'],
      steps: [
        'Attach the weight to the string',
        'Measure the length of the string',
        'Pull the weight to a small angle',
        'Release and start the timer',
        'Measure the period for 10 oscillations',
        'Calculate the average period'
      ],
      currentStep: 0,
      isRunning: false
    },
    {
      id: 'acid-base',
      title: 'Acid-Base Reaction',
      subject: 'chemistry',
      description: 'Observe pH changes during neutralization',
      materials: ['Hydrochloric acid', 'Sodium hydroxide', 'pH indicator', 'Beaker', 'Stirring rod'],
      steps: [
        'Add pH indicator to acid solution',
        'Slowly add base solution',
        'Observe color change',
        'Test pH at different stages',
        'Record observations'
      ],
      currentStep: 0,
      isRunning: false
    },
    {
      id: 'osmosis',
      title: 'Osmosis in Potato Cells',
      subject: 'biology',
      description: 'Demonstrate water movement across cell membranes',
      materials: ['Potato', 'Salt', 'Water', 'Knife', 'Beakers', 'Timer'],
      steps: [
        'Cut potato into equal pieces',
        'Prepare salt and fresh water solutions',
        'Place potato pieces in solutions',
        'Observe changes over time',
        'Record results'
      ],
      currentStep: 0,
      isRunning: false
    }
  ];

  const startExperiment = (experiment: ScienceExperiment) => {
    setSelectedExperiment({
      ...experiment,
      currentStep: 0,
      isRunning: true
    });
    setIsSimulating(true);
  };

  const nextStep = () => {
    if (selectedExperiment && selectedExperiment.currentStep < selectedExperiment.steps.length - 1) {
      setSelectedExperiment({
        ...selectedExperiment,
        currentStep: selectedExperiment.currentStep + 1
      });
    }
  };

  const prevStep = () => {
    if (selectedExperiment && selectedExperiment.currentStep > 0) {
      setSelectedExperiment({
        ...selectedExperiment,
        currentStep: selectedExperiment.currentStep - 1
      });
    }
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setSelectedExperiment(null);
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'physics': return 'bg-blue-500';
      case 'chemistry': return 'bg-green-500';
      case 'biology': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'physics': return '⚛️';
      case 'chemistry': return '🧪';
      case 'biology': return '🧬';
      default: return '🔬';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold">🔬 Science Simulations</h1>
        <p className="text-gray-600">Interactive physics, chemistry, and biology experiments</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Experiment Selection */}
        {!selectedExperiment && (
          <div className="flex-1 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiments.map((experiment) => (
                <div key={experiment.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{getSubjectIcon(experiment.subject)}</span>
                    <span className={`px-3 py-1 rounded-full text-white text-sm ${getSubjectColor(experiment.subject)}`}>
                      {experiment.subject}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{experiment.title}</h3>
                  <p className="text-gray-600 mb-4">{experiment.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Materials:</h4>
                    <div className="flex flex-wrap gap-2">
                      {experiment.materials.map((material, index) => (
                        <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => startExperiment(experiment)}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Start Experiment
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Experiment */}
        {selectedExperiment && (
          <div className="flex-1 flex">
            {/* Simulation Area */}
            <div className="flex-1 p-8">
              <div className="bg-white rounded-lg shadow-lg p-8 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedExperiment.title}</h2>
                    <p className="text-gray-600">{selectedExperiment.description}</p>
                  </div>
                  <button
                    onClick={stopSimulation}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Stop Simulation
                  </button>
                </div>

                {/* Visualization Area */}
                <div className="bg-gray-100 rounded-lg p-8 mb-6 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">
                      {getSubjectIcon(selectedExperiment.subject)}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Step {selectedExperiment.currentStep + 1}: {selectedExperiment.steps[selectedExperiment.currentStep]}
                    </h3>
                    {isSimulating && (
                      <div className="mt-4">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <p className="text-sm text-gray-600 mt-2">Simulating...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevStep}
                    disabled={selectedExperiment.currentStep === 0}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
                  >
                    ← Previous
                  </button>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Step {selectedExperiment.currentStep + 1} of {selectedExperiment.steps.length}
                    </p>
                    <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((selectedExperiment.currentStep + 1) / selectedExperiment.steps.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={nextStep}
                    disabled={selectedExperiment.currentStep === selectedExperiment.steps.length - 1}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>

            {/* Materials and Notes Panel */}
            <div className="w-80 bg-white border-l p-6">
              <h3 className="font-semibold text-lg mb-4">Materials Needed</h3>
              <div className="space-y-2 mb-6">
                {selectedExperiment.materials.map((material, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      defaultChecked={index < selectedExperiment.currentStep}
                    />
                    <span className={index < selectedExperiment.currentStep ? 'line-through text-gray-500' : ''}>
                      {material}
                    </span>
                  </div>
                ))}
              </div>

              <h3 className="font-semibold text-lg mb-4">Safety Notes</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
                <ul className="text-sm space-y-1">
                  <li>• Wear safety goggles</li>
                  <li>• Work in a well-ventilated area</li>
                  <li>• Follow instructions carefully</li>
                  <li>• Ask for help if needed</li>
                </ul>
              </div>

              <h3 className="font-semibold text-lg mb-4">Observations</h3>
              <textarea
                className="w-full border rounded p-3 h-32"
                placeholder="Record your observations here..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-white border-t p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>🧪 Current Subject:</strong> {selectedExperiment?.subject || 'None selected'}
          </div>
          <div>
            <strong>🎯 Learning Objective:</strong> Understand scientific principles through hands-on experiments
          </div>
          <div>
            <strong>💡 Tip:</strong> Follow safety procedures and record all observations
          </div>
        </div>
      </div>
    </div>
  );
}
