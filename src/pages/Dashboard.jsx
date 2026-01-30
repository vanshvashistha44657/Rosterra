import MetricCard from '../components/MetricCard'
import RevenueChart from '../components/RevenueChart'
import RecentActivity from '../components/RecentActivity'
import TopProducts from '../components/TopProducts'
import { 
  DollarSign, 
  Users, 
  ShoppingCart, 
  TrendingUp 
} from 'lucide-react'

function Dashboard() {
  const metrics = [
    {
      title: 'Total Revenue',
      value: '$45,231',
      change: '+20.1%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Users',
      value: '2,350',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-purple-500',
    },
    {
      title: 'Growth Rate',
      value: '24.3%',
      change: '+4.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProducts />
      </div>
    </div>
  )
}

export default Dashboard
