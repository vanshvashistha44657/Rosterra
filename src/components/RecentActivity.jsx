import { Activity } from 'lucide-react'

const activities = [
  { id: 1, user: 'John Doe', action: 'placed an order', time: '2 mins ago', type: 'order' },
  { id: 2, user: 'Jane Smith', action: 'signed up', time: '15 mins ago', type: 'signup' },
  { id: 3, user: 'Mike Johnson', action: 'upgraded plan', time: '1 hour ago', type: 'upgrade' },
  { id: 4, user: 'Sarah Williams', action: 'cancelled subscription', time: '2 hours ago', type: 'cancel' },
  { id: 5, user: 'Tom Brown', action: 'placed an order', time: '3 hours ago', type: 'order' },
]

function RecentActivity() {
  const getActivityColor = (type) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-700'
      case 'signup':
        return 'bg-green-100 text-green-700'
      case 'upgrade':
        return 'bg-purple-100 text-purple-700'
      case 'cancel':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Activity className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
            <div className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(activity.type)}`}></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user}</span>{' '}
                {activity.action}
              </p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
        View all activity
      </button>
    </div>
  )
}

export default RecentActivity
