import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MathStep {
  id: string;
  equation: string;
  explanation: string;
  highlight: string;
}

export function MathWhiteboard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userInput, setUserInput] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const mathSteps: MathStep[] = [
    {
      id: '1',
      equation: '2x + 5 = 13',
      explanation: 'We start with our equation: 2x + 5 = 13',
      highlight: '2x + 5 = 13'
    },
    {
      id: '2',
      equation: '2x = 13 - 5',
      explanation: 'Subtract 5 from both sides to isolate the term with x',
      highlight: '13 - 5'
    },
    {
      id: '3',
      equation: '2x = 8',
      explanation: 'Simplify: 13 - 5 = 8',
      highlight: '8'
    },
    {
      id: '4',
      equation: 'x = 8 ÷ 2',
      explanation: 'Divide both sides by 2 to solve for x',
      highlight: '÷ 2'
    },
    {
      id: '5',
      equation: 'x = 4',
      explanation: 'Final answer: x = 4',
      highlight: '4'
    }
  ];

  useEffect(() => {
    drawEquation();
  }, [currentStep]);

  const drawEquation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up drawing style
    ctx.font = '48px Arial';
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw current equation
    const step = mathSteps[currentStep];
    ctx.fillText(step.equation, canvas.width / 2, canvas.height / 2);
    
    // Highlight specific part
    if (step.highlight) {
      ctx.font = '52px Arial';
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      
      // Calculate highlight position (simplified)
      const textWidth = ctx.measureText(step.equation).width;
      const highlightWidth = ctx.measureText(step.highlight).width;
      const startX = (canvas.width - textWidth) / 2;
      
      ctx.strokeRect(startX - 5, canvas.height / 2 - 30, highlightWidth + 10, 60);
    }
  };

  const nextStep = () => {
    if (currentStep < mathSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setUserInput('');
  };

  const checkAnswer = () => {
    const correctAnswer = '4';
    if (userInput.trim() === correctAnswer) {
      alert('🎉 Correct! x = 4');
    } else {
      alert('Try again! Hint: Look at the final step.');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold">📐 Mathematics Whiteboard</h1>
        <p className="text-gray-600">Interactive step-by-step problem solving</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Whiteboard Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full">
            <canvas
              ref={canvasRef}
              width={800}
              height={200}
              className="border-2 border-gray-200 rounded-lg w-full"
            />
            
            {/* Step Explanation */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-blue-50 rounded-lg"
            >
              <h3 className="font-semibold text-lg mb-2">Step {currentStep + 1}:</h3>
              <p className="text-gray-700">{mathSteps[currentStep].explanation}</p>
            </motion.div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-80 bg-white border-l p-6">
          <h3 className="font-semibold text-lg mb-4">Controls</h3>
          
          {/* Navigation */}
          <div className="space-y-4 mb-6">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
            >
              ← Previous Step
            </button>
            
            <button
              onClick={nextStep}
              disabled={currentStep === mathSteps.length - 1}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Next Step →
            </button>
            
            <button
              onClick={resetDemo}
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Reset Demo
            </button>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Progress:</h4>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / mathSteps.length) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentStep + 1} of {mathSteps.length}
            </p>
          </div>

          {/* Practice Area */}
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-2">Practice:</h4>
            <p className="text-sm text-gray-600 mb-3">
              What is the value of x in: 2x + 5 = 13
            </p>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter your answer"
              className="w-full border rounded px-3 py-2 mb-3"
            />
            <button
              onClick={checkAnswer}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Check Answer
            </button>
          </div>

          {/* Additional Tools */}
          <div className="border-t pt-6 mt-6">
            <h4 className="font-semibold mb-2">Tools:</h4>
            <div className="space-y-2">
              <button className="w-full text-left bg-gray-100 px-3 py-2 rounded hover:bg-gray-200">
                📊 Graph Plotter
              </button>
              <button className="w-full text-left bg-gray-100 px-3 py-2 rounded hover:bg-gray-200">
                🧮 Calculator
              </button>
              <button className="w-full text-left bg-gray-100 px-3 py-2 rounded hover:bg-gray-200">
                📐 Geometry Tools
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white border-t p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>📝 Current Topic:</strong> Linear Equations
          </div>
          <div>
            <strong>🎯 Learning Goal:</strong> Solve for x in linear equations
          </div>
          <div>
            <strong>💡 Tip:</strong> Isolate the variable by performing inverse operations
          </div>
        </div>
      </div>
    </div>
  );
}
