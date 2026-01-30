import { useMemo } from 'react'
import { useData } from '../context/DataContext'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Users, Eye } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Helper function to categorize followers into range
function getRangeCategory(followers) {
  if (!followers || followers === 0) return 'NANO'
  if (followers < 10000) return 'NANO'
  if (followers < 50000) return '10K-50K'
  if (followers < 100000) return '50K-100K'
  if (followers < 200000) return '100K-200K'
  if (followers < 500000) return '200K-500K'
  if (followers < 1000000) return '500K-1M'
  return '1M+'
}

function RoasterResponse() {
  const navigate = useNavigate()
  const { roasterProfiles } = useData()

  // Get selected profiles from localStorage (stored when selected in FrameFaceRoaster)
  const selectedRoasterIds = useMemo(() => {
    const stored = localStorage.getItem('roaster_selected_ids')
    return stored ? JSON.parse(stored) : []
  }, [])

  const selectedProfiles = useMemo(() => {
    return roasterProfiles.filter(p => selectedRoasterIds.includes(p.id))
  }, [roasterProfiles, selectedRoasterIds])

  // Calculate statistics
  const stats = useMemo(() => {
    if (selectedProfiles.length === 0) {
      return {
        totalFollowers: 0,
        totalFollowersDisplay: '0',
        totalInMillions: 0,
        averageFollowers: 0,
        rangeDistribution: {},
        totalProfiles: 0
      }
    }

    const totalFollowers = selectedProfiles.reduce((sum, p) => sum + (p.followers || 0), 0)
    const totalInMillions = totalFollowers / 1000000
    const averageFollowers = totalFollowers / selectedProfiles.length

    // Format total followers display
    let totalFollowersDisplay = '0'
    if (totalInMillions >= 1) {
      totalFollowersDisplay = `${totalInMillions.toFixed(2)}M`
    } else if (totalFollowers >= 1000) {
      totalFollowersDisplay = `${(totalFollowers / 1000).toFixed(2)}K`
    } else {
      totalFollowersDisplay = totalFollowers.toString()
    }

    // Calculate range distribution
    const rangeDistribution = {}
    selectedProfiles.forEach(profile => {
      const range = getRangeCategory(profile.followers)
      rangeDistribution[range] = (rangeDistribution[range] || 0) + 1
    })

    return {
      totalFollowers,
      totalFollowersDisplay,
      totalInMillions,
      averageFollowers,
      rangeDistribution,
      totalProfiles: selectedProfiles.length
    }
  }, [selectedProfiles])

  // Prepare data for charts
  const rangeChartData = useMemo(() => {
    const ranges = ['NANO', '10K-50K', '50K-100K', '100K-200K', '200K-500K', '500K-1M', '1M+']
    return ranges.map(range => ({
      name: range,
      count: stats.rangeDistribution[range] || 0,
      percentage: stats.totalProfiles > 0 
        ? ((stats.rangeDistribution[range] || 0) / stats.totalProfiles * 100).toFixed(1)
        : 0
    }))
  }, [stats])

  const pieChartData = useMemo(() => {
    return Object.entries(stats.rangeDistribution).map(([name, value]) => ({
      name,
      value,
      percentage: stats.totalProfiles > 0 ? ((value / stats.totalProfiles) * 100).toFixed(1) : 0
    }))
  }, [stats])

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#6366f1']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/roaster')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Roaster Response
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Analytics for selected Frame Face Roaster profiles
            </p>
          </div>
        </div>
      </div>

      {selectedProfiles.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No profiles selected. Please go to Frame Face Roaster and select profiles first.
          </p>
          <button
            onClick={() => navigate('/roaster')}
            className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Go to Frame Face Roaster
          </button>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Followers</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalFollowersDisplay}</p>
                  <p className="text-blue-100 text-xs mt-1">{stats.totalInMillions.toFixed(2)}M</p>
                </div>
                <Users className="w-12 h-12 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Profiles</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalProfiles}</p>
                  <p className="text-purple-100 text-xs mt-1">Selected creators</p>
                </div>
                <TrendingUp className="w-12 h-12 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm font-medium">Average Followers</p>
                  <p className="text-3xl font-bold mt-2">
                    {stats.averageFollowers >= 1000000
                      ? `${(stats.averageFollowers / 1000000).toFixed(2)}M`
                      : stats.averageFollowers >= 1000
                      ? `${(stats.averageFollowers / 1000).toFixed(2)}K`
                      : stats.averageFollowers.toFixed(0)}
                  </p>
                  <p className="text-pink-100 text-xs mt-1">Per creator</p>
                </div>
                <Eye className="w-12 h-12 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Views Rate</p>
                  <p className="text-3xl font-bold mt-2">100%</p>
                  <p className="text-green-100 text-xs mt-1">Company coverage</p>
                </div>
                <TrendingUp className="w-12 h-12 opacity-80" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart - Range Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Range Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={rangeChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Number of Creators" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart - Range Percentage */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Range Percentage Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Selected Profiles Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Selected Profiles ({selectedProfiles.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Platform</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Followers</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Range</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedProfiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {profile.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {profile.platform ? (
                          <span className="px-2 py-1 bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-semibold">
                            {profile.platform}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {profile.followersDisplay || (profile.followers ? profile.followers.toLocaleString() : '0')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium">
                          {getRangeCategory(profile.followers)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {profile.category || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default RoasterResponse
