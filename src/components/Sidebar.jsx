import { 
  LayoutDashboard, 
  Users, 
  X,
  Instagram,
  Youtube,
  Facebook,
  Music,
  Coffee
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

function Sidebar({ isOpen, setIsOpen }) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'All Profiles', path: '/dashboard' },
    { icon: Instagram, label: 'Instagram', path: '/platform/instagram' },
    { icon: Youtube, label: 'YouTube', path: '/platform/youtube' },
    { icon: Facebook, label: 'Facebook', path: '/platform/facebook' },
    { icon: Music, label: 'TikTok', path: '/platform/tiktok' },
    { icon: Coffee, label: 'Frame Face Roaster', path: '/roaster' },
    { icon: Users, label: 'Users', path: '/users' },
  ]

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Rosterra</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">Profile Manager</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

        </div>
      </aside>
    </>
  )
}

export default Sidebar
