import { useState, useMemo, useEffect } from 'react'
import { useData } from '../context/DataContext'
import { parseExcelFile, parseCSVFile } from '../utils/excelParser'
import { CheckSquare, Square, Upload, ChevronDown, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const RANGE_CATEGORIES = ['All', 'NANO', '10K-50K', '50K-100K', '100K-200K', '200K-500K', '500K-1M', '1M+']

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

// Helper function to abbreviate platform names
function abbreviatePlatform(platform) {
  if (!platform) return ''
  const platformUpper = platform.toUpperCase()
  if (platformUpper.includes('INSTAGRAM') || platformUpper.includes('IG')) return 'IG'
  if (platformUpper.includes('YOUTUBE') || platformUpper.includes('YT')) return 'YT'
  if (platformUpper.includes('TIKTOK') || platformUpper.includes('TT')) return 'TT'
  if (platformUpper.includes('FACEBOOK') || platformUpper.includes('FB')) return 'FB'
  return platform
}

function FrameFaceRoaster() {
  const navigate = useNavigate()
  const { roasterProfiles, addRoasterProfiles, clearRoasterProfiles } = useData()
  const [selectedRoasters, setSelectedRoasters] = useState(() => {
    const stored = localStorage.getItem('roaster_selected_ids')
    return stored ? JSON.parse(stored) : []
  })
  const [rangeFilters, setRangeFilters] = useState(['All'])
  const [importing, setImporting] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)

  // Filter roaster profiles by range
  const filteredRoasterProfiles = useMemo(() => {
    return roasterProfiles.filter(profile => {
      const profileRange = getRangeCategory(profile.followers)
      return rangeFilters.includes('All') || rangeFilters.includes(profileRange)
    })
  }, [roasterProfiles, rangeFilters])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.filter-dropdown')) {
        setOpenDropdown(null)
      }
    }

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openDropdown])

  const handleFileImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImporting(true)
    try {
      const fileExtension = file.name.split('.').pop().toLowerCase()
      let parsedProfiles

      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        parsedProfiles = await parseExcelFile(file)
      } else if (fileExtension === 'csv') {
        parsedProfiles = await parseCSVFile(file)
      } else {
        alert('Please upload a valid Excel (.xlsx, .xls) or CSV file')
        return
      }

      if (parsedProfiles.length > 0) {
        // Clear existing roaster profiles and add new ones (separate from main profiles)
        clearRoasterProfiles()
        addRoasterProfiles(parsedProfiles)
        alert(`Successfully imported ${parsedProfiles.length} roaster profiles!`)
      } else {
        alert('No valid profiles found in the file.')
      }
    } catch (error) {
      alert(`Error importing file: ${error.message}`)
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  const toggleFilter = (value) => {
    if (value === 'All') {
      setRangeFilters(['All'])
    } else {
      const current = rangeFilters.includes('All') ? [] : [...rangeFilters]
      if (current.includes(value)) {
        const newFilters = current.filter(f => f !== value)
        setRangeFilters(newFilters.length === 0 ? ['All'] : newFilters)
      } else {
        setRangeFilters([...current, value])
      }
    }
  }

  const isFilterSelected = (value) => {
    return rangeFilters.includes(value)
  }

  const toggleRoaster = (id) => {
    setSelectedRoasters(prev => {
      const newSelection = prev.includes(id)
        ? prev.filter(roasterId => roasterId !== id)
        : [...prev, id]
      // Save to localStorage for Response page
      localStorage.setItem('roaster_selected_ids', JSON.stringify(newSelection))
      return newSelection
    })
  }

  const selectAll = () => {
    const allIds = filteredRoasterProfiles.map(p => p.id)
    setSelectedRoasters(allIds)
    localStorage.setItem('roaster_selected_ids', JSON.stringify(allIds))
  }

  const deselectAll = () => {
    setSelectedRoasters([])
    localStorage.setItem('roaster_selected_ids', JSON.stringify([]))
  }

  const selectedCount = selectedRoasters.length
  const totalCount = filteredRoasterProfiles.length
  const percentage = totalCount > 0 ? ((selectedCount / totalCount) * 100).toFixed(1) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            Frame Face Roaster
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and select roaster profiles ({filteredRoasterProfiles.length} total)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all cursor-pointer flex items-center space-x-2 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 font-medium">
            <Upload className="w-5 h-5" />
            <span>{importing ? 'Importing...' : 'Import Excel/CSV'}</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileImport}
              className="hidden"
              disabled={importing}
            />
          </label>
          {roasterProfiles.length > 0 && (
            <button
              onClick={clearRoasterProfiles}
              className="px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium"
            >
              Clear All
            </button>
          )}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl shadow-lg">
            <div className="text-sm opacity-90">Selection Progress</div>
            <div className="text-2xl font-bold">{percentage}%</div>
            <div className="text-xs opacity-75">{selectedCount} of {totalCount} selected</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
            {selectedRoasters.length > 0 && (
              <button
                onClick={() => navigate('/roaster/response')}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Response</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Range Filter */}
      {roasterProfiles.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="relative filter-dropdown">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setOpenDropdown(openDropdown === 'range' ? null : 'range')
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Range</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === 'range' ? 'rotate-180' : ''}`} />
                {rangeFilters.length > 0 && rangeFilters[0] !== 'All' && (
                  <span className="ml-1 px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                    {rangeFilters.length}
                  </span>
                )}
              </button>
              {openDropdown === 'range' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50" onClick={(e) => e.stopPropagation()}>
                  <div className="p-2">
                    {RANGE_CATEGORIES.map(range => (
                      <label key={range} className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isFilterSelected(range)}
                          onChange={() => toggleFilter(range)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{range}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {rangeFilters.length > 0 && rangeFilters[0] !== 'All' && (
              <button
                onClick={() => setRangeFilters(['All'])}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={selectedRoasters.length === filteredRoasterProfiles.length && filteredRoasterProfiles.length > 0 ? deselectAll : selectAll}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                  >
                    {selectedRoasters.length === filteredRoasterProfiles.length && filteredRoasterProfiles.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Platform</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Followers</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Range</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Profile Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRoasterProfiles.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    {roasterProfiles.length === 0 
                      ? 'No roaster profiles found. Import an Excel or CSV file to get started.'
                      : 'No profiles match your range filter.'}
                  </td>
                </tr>
              ) : (
                filteredRoasterProfiles.map((profile) => (
                  <tr
                    key={profile.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      selectedRoasters.includes(profile.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleRoaster(profile.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      >
                        {selectedRoasters.includes(profile.id) ? (
                          <CheckSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {profile.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {profile.platform ? (
                        <span className="px-2 py-1 bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-semibold">
                          {abbreviatePlatform(profile.platform)}
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
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {profile.state || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {profile.profileLink ? (
                        <a
                          href={profile.profileLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 dark:text-primary-400 hover:underline truncate block max-w-xs"
                        >
                          View →
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default FrameFaceRoaster
