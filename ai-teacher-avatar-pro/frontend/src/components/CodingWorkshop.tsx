import React, { useState, useEffect } from 'react';

interface CodeExample {
  id: string;
  title: string;
  language: string;
  code: string;
  explanation: string;
  output: string;
}

export function CodingWorkshop() {
  const [selectedExample, setSelectedExample] = useState<CodeExample | null>(null);
  const [userCode, setUserCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  
  const codeExamples: CodeExample[] = [
    {
      id: 'hello-world',
      title: 'Hello World',
      language: 'python',
      code: `# Your first Python program
print("Hello, World!")
print("Welcome to AI Teacher Avatar Pro")

# Variables and basic operations
name = "Student"
age = 15
print(f"Hello {name}, you are {age} years old!")

# Simple calculation
result = 10 + 5
print(f"10 + 5 = {result}")`,
      explanation: 'Learn the basics of Python programming with variables and print statements',
      output: 'Hello, World!\nWelcome to AI Teacher Avatar Pro\nHello Student, you are 15 years old!\n10 + 5 = 15'
    },
    {
      id: 'functions',
      title: 'Functions',
      language: 'python',
      code: `# Define a function
def greet(name):
    return f"Hello, {name}!"

# Define a function with parameters
def calculate_area(length, width):
    return length * width

# Call the functions
message = greet("AI Student")
print(message)

area = calculate_area(5, 3)
print(f"The area is: {area}")

# Function with default parameter
def power(base, exponent=2):
    return base ** exponent

print(f"2^3 = {power(2, 3)}")
print(f"5^2 = {power(5)}")`,
      explanation: 'Learn how to create and use functions in Python',
      output: 'Hello, AI Student!\nThe area is: 15\n2^3 = 8\n5^2 = 25'
    },
    {
      id: 'loops',
      title: 'Loops and Lists',
      language: 'python',
      code: `# Create a list
numbers = [1, 2, 3, 4, 5]

# For loop
print("Using for loop:")
for num in numbers:
    print(f"Number: {num}")

# While loop
print("\\nUsing while loop:")
count = 0
while count < 3:
    print(f"Count: {count}")
    count += 1

# List comprehension
squares = [x**2 for x in numbers]
print(f"\\nSquares: {squares}")

# Range function
print("\\nUsing range:")
for i in range(3):
    print(f"Range value: {i}")`,
      explanation: 'Master loops and list operations in Python',
      output: 'Using for loop:\nNumber: 1\nNumber: 2\nNumber: 3\nNumber: 4\nNumber: 5\n\nUsing while loop:\nCount: 0\nCount: 1\nCount: 2\n\nSquares: [1, 4, 9, 16, 25]\n\nUsing range:\nRange value: 0\nRange value: 1\nRange value: 2'
    },
    {
      id: 'conditionals',
      title: 'Conditional Statements',
      language: 'python',
      code: `# If-elif-else statements
age = 18

if age < 13:
    category = "Child"
elif age < 18:
    category = "Teenager"
else:
    category = "Adult"

print(f"Age {age} -> {category}")

# Multiple conditions
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"Score {score} -> Grade {grade}")

# Logical operators
is_student = True
has_passed = score >= 60

if is_student and has_passed:
    print("Student has passed!")
elif is_student and not has_passed:
    print("Student needs to study more!")
else:
    print("Not a student")`,
      explanation: 'Learn conditional logic and decision making in programming',
      output: 'Age 18 -> Adult\nScore 85 -> Grade B\nStudent has passed!'
    }
  ];

  const selectExample = (example: CodeExample) => {
    setSelectedExample(example);
    setUserCode(example.code);
    setOutput('');
  };

  const runCode = () => {
    setIsRunning(true);
    
    // Simulate code execution (in real app, this would call backend)
    setTimeout(() => {
      try {
        // Simple simulation for demo
        if (userCode.includes('print')) {
          const lines = userCode.split('\n');
          const printLines = lines
            .filter(line => line.trim().startsWith('print'))
            .map(line => {
              const match = line.match(/print\("([^"]+)"\)/);
              return match ? match[1] : 'Output';
            });
          setOutput(printLines.join('\n'));
        } else {
          setOutput('Code executed successfully!');
        }
      } catch (error) {
        setOutput('Error: ' + error);
      }
      setIsRunning(false);
    }, 1000);
  };

  const resetCode = () => {
    if (selectedExample) {
      setUserCode(selectedExample.code);
      setOutput('');
    }
  };

  const getLanguageIcon = (language: string) => {
    switch (language) {
      case 'python': return '🐍';
      case 'javascript': return '🟨';
      case 'java': return '☕';
      default: return '💻';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold">💻 Coding Workshop</h1>
        <p className="text-gray-600">Interactive programming lessons with live code execution</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Example Selection */}
        {!selectedExample && (
          <div className="flex-1 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {codeExamples.map((example) => (
                <div key={example.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => selectExample(example)}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{getLanguageIcon(example.language)}</span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                      {example.language}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{example.title}</h3>
                  <p className="text-gray-600 mb-4">{example.explanation}</p>
                  
                  <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                    <div className="truncate">{example.code.split('\n')[0]}</div>
                    <div className="truncate">{example.code.split('\n')[1] || ''}</div>
                    <div className="text-gray-500">...</div>
                  </div>
                  
                  <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4">
                    Start Coding
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code Editor */}
        {selectedExample && (
          <div className="flex-1 flex">
            <div className="flex-1 flex flex-col p-6">
              {/* Editor Header */}
              <div className="bg-white rounded-t-lg border p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{getLanguageIcon(selectedExample.language)}</span>
                  <div>
                    <h2 className="text-lg font-semibold">{selectedExample.title}</h2>
                    <p className="text-sm text-gray-600">{selectedExample.explanation}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={resetCode}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setSelectedExample(null)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Code Editor */}
              <div className="bg-gray-900 flex-1 rounded-b-lg border p-4">
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="w-full h-full bg-transparent text-green-400 font-mono text-sm resize-none focus:outline-none"
                  placeholder="Write your code here..."
                  spellCheck={false}
                />
              </div>

              {/* Run Button */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {isRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Running...
                    </>
                  ) : (
                    <>
                      ▶ Run Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Output Panel */}
            <div className="w-96 bg-white border-l p-6">
              <h3 className="font-semibold text-lg mb-4">Output</h3>
              <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-auto">
                {output || 'Run your code to see the output here...'}
              </div>

              {/* Expected Output */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Expected Output:</h4>
                <div className="bg-gray-100 p-3 rounded font-mono text-xs text-gray-700">
                  {selectedExample.output}
                </div>
              </div>

              {/* Learning Tips */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">💡 Learning Tips:</h4>
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <ul className="text-sm space-y-1">
                    <li>• Read the comments in the code</li>
                    <li>• Try modifying the code</li>
                    <li>• Experiment with different values</li>
                    <li>• Ask questions if confused</li>
                  </ul>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">📊 Progress:</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Code Examples</span>
                    <span>1/4</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-white border-t p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>💻 Current Language:</strong> {selectedExample?.language || 'None selected'}
          </div>
          <div>
            <strong>🎯 Learning Goal:</strong> Master programming fundamentals
          </div>
          <div>
            <strong>💡 Tip:</strong> Practice by modifying the code and running it
          </div>
        </div>
      </div>
    </div>
  );
}
