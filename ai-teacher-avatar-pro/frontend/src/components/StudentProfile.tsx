import React from 'react';

export function StudentProfile() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">👤 Student Profile</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Name:</h3>
            <p>AI Student</p>
          </div>
          <div>
            <h3 className="font-semibold">Learning Progress:</h3>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">65% Complete</p>
          </div>
          <div>
            <h3 className="font-semibold">Favorite Subjects:</h3>
            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Mathematics</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Science</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Coding</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
