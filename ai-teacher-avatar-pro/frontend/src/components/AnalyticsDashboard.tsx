export function AnalyticsDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">📊 Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
          <p className="text-2xl font-bold text-gray-900">24</p>
          <p className="text-sm text-green-600">+12% from last week</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Learning Time</h3>
          <p className="text-2xl font-bold text-gray-900">8.5 hrs</p>
          <p className="text-sm text-green-600">+5% from last week</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Completed Lessons</h3>
          <p className="text-2xl font-bold text-gray-900">18</p>
          <p className="text-sm text-blue-600">On track</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Engagement Rate</h3>
          <p className="text-2xl font-bold text-gray-900">92%</p>
          <p className="text-sm text-green-600">Excellent</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Algebra Basics</p>
              <p className="text-sm text-gray-600">Completed 2 hours ago</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Completed</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Arduino LED Circuit</p>
              <p className="text-sm text-gray-600">In progress - 45% complete</p>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">In Progress</span>
          </div>
        </div>
      </div>
    </div>
  );
}
