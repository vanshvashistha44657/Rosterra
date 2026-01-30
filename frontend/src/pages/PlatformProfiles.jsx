import { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

function abbreviatePlatform(platform) {
  if (!platform) return ''
  const platformUpper = platform.toUpperCase()
  if (platformUpper.includes('INSTAGRAM') || platformUpper.includes('IG')) return 'IG'
  if (platformUpper.includes('YOUTUBE') || platformUpper.includes('YT')) return 'YT'
  if (platformUpper.includes('TIKTOK') || platformUpper.includes('TT')) return 'TT'
  if (platformUpper.includes('FACEBOOK') || platformUpper.includes('FB')) return 'FB'
  return platform
}

function PlatformProfiles() {
  const { platform } = useParams()
  const navigate = useNavigate()
  const { profiles } = useData()
  
  const platformProfiles = useMemo(() => {
    if (!platform || platform === 'all') return profiles
    const platformUpper = platform.toUpperCase()
    return profiles.filter(p => {
      const pPlatform = (p.platform || '').toUpperCase()
      if (platformUpper === 'INSTAGRAM' || platformUpper === 'IG') {
        return pPlatform.includes('INSTAGRAM') || pPlatform.includes('IG')
      } else if (platformUpper === 'YOUTUBE' || platformUpper === 'YT') {
        return pPlatform.includes('YOUTUBE') || pPlatform.includes('YT')
      } else if (platformUpper === 'TIKTOK' || platformUpper === 'TT') {
        return pPlatform.includes('TIKTOK') || pPlatform.includes('TT')
      } else if (platformUpper === 'FACEBOOK' || platformUpper === 'FB') {
        return pPlatform.includes('FACEBOOK') || pPlatform.includes('FB')
      }
      return false
    })
  }, [profiles, platform])

  const platformName = platform ? platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase() : 'All Platforms'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              {platformName} Profiles
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {platformProfiles.length} profile{platformProfiles.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {platformProfiles.map((profile) => (
          <div
            key={profile.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {profile.name || 'Unnamed'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {abbreviatePlatform(profile.platform)}
                </p>
              </div>
            </div>
            
            {profile.profileLink && (
              <a
                href={profile.profileLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:underline text-sm truncate block mb-3"
              >
                View Profile →
              </a>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Followers:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {profile.followersDisplay || (profile.followers ? profile.followers.toLocaleString() : '0')}
                </span>
              </div>
              {profile.category && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Category:</span>
                  <span className="text-gray-900 dark:text-gray-100">{profile.category}</span>
                </div>
              )}
              {profile.state && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Location:</span>
                  <span className="text-gray-900 dark:text-gray-100">{profile.state}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {platformProfiles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No profiles found for {platformName}
          </p>
        </div>
      )}
    </div>
  )
}

export default PlatformProfiles
