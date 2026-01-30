import { useState, useMemo, useEffect } from 'react'
import { useData } from '../context/DataContext'
import { parseExcelFile, parseCSVFile } from '../utils/excelParser'
import { exportToExcel, exportToCSV, exportToPDF } from '../utils/exportUtils'
import { Upload, Download, FileSpreadsheet, FileText, Trash2, Edit2, Check, X, ChevronDown } from 'lucide-react'

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

// Helper function to make URL clickable - preserve original link
function getClickableUrl(url) {
  if (!url) return '#'
  
  // Return the URL exactly as it is - don't modify it
  // Only add https:// if it's clearly needed for clicking
  const trimmed = url.trim()
  
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  
  // Only add protocol if it looks like a domain
  if (trimmed.includes('.') && !trimmed.includes(' ')) {
    return `https://${trimmed}`
  }
  
  return trimmed
}

function Profiles({ searchTerm = '' }) {
  const { profiles, selectedProfiles, toggleSelectProfile, selectAll, deselectAll, updateProfile, deleteProfile, deleteProfiles, addProfiles } = useData()
  const [rangeFilters, setRangeFilters] = useState(['All'])
  const [stateFilters, setStateFilters] = useState(['All'])
  const [categoryFilters, setCategoryFilters] = useState(['All'])
  const [sexFilters, setSexFilters] = useState(['All'])
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [importing, setImporting] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null) // 'range', 'state', 'category', 'sex', or null

  // Get unique values from profiles for filters
  const uniqueStates = useMemo(() => {
    const states = profiles
      .map(p => p.state)
      .filter(s => s && s.trim())
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort()
    return ['All', ...states]
  }, [profiles])

  const uniqueCategories = useMemo(() => {
    const categories = profiles
      .map(p => p.category)
      .filter(c => c && c.trim())
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort()
    return ['All', ...categories]
  }, [profiles])

  const uniqueSex = useMemo(() => {
    const sexes = profiles
      .map(p => p.sex)
      .filter(s => s && s.trim())
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort()
    return ['All', ...sexes]
  }, [profiles])

  // Helper function to toggle filter value
  const toggleFilter = (filterType, value) => {
    if (filterType === 'range') {
      const current = rangeFilters.includes('All') ? [] : [...rangeFilters]
      if (current.includes(value)) {
        const newFilters = current.filter(f => f !== value)
        setRangeFilters(newFilters.length === 0 ? ['All'] : newFilters)
      } else {
        setRangeFilters([...current, value])
      }
    } else if (filterType === 'state') {
      const current = stateFilters.includes('All') ? [] : [...stateFilters]
      if (current.includes(value)) {
        const newFilters = current.filter(f => f !== value)
        setStateFilters(newFilters.length === 0 ? ['All'] : newFilters)
      } else {
        setStateFilters([...current, value])
      }
    } else if (filterType === 'category') {
      const current = categoryFilters.includes('All') ? [] : [...categoryFilters]
      if (current.includes(value)) {
        const newFilters = current.filter(f => f !== value)
        setCategoryFilters(newFilters.length === 0 ? ['All'] : newFilters)
      } else {
        setCategoryFilters([...current, value])
      }
    } else if (filterType === 'sex') {
      const current = sexFilters.includes('All') ? [] : [...sexFilters]
      if (current.includes(value)) {
        const newFilters = current.filter(f => f !== value)
        setSexFilters(newFilters.length === 0 ? ['All'] : newFilters)
      } else {
        setSexFilters([...current, value])
      }
    }
  }

  // Helper function to check if filter is selected
  const isFilterSelected = (filterType, value) => {
    if (filterType === 'range') {
      return rangeFilters.includes(value)
    } else if (filterType === 'state') {
      return stateFilters.includes(value)
    } else if (filterType === 'category') {
      return categoryFilters.includes(value)
    } else if (filterType === 'sex') {
      return sexFilters.includes(value)
    }
    return false
  }

  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      const matchesSearch = !searchTerm || 
        profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.phoneNumber?.includes(searchTerm) ||
        profile.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.sex?.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Filter by range category (multiple selection)
      const profileRange = getRangeCategory(profile.followers)
      const matchesRange = rangeFilters.includes('All') || rangeFilters.includes(profileRange)
      
      // Filter by state (multiple selection)
      const matchesState = stateFilters.includes('All') || stateFilters.includes(profile.state)
      
      // Filter by category (multiple selection)
      const matchesCategory = categoryFilters.includes('All') || categoryFilters.includes(profile.category)
      
      // Filter by sex (multiple selection)
      const matchesSex = sexFilters.includes('All') || sexFilters.includes(profile.sex)
      
      return matchesSearch && matchesRange && matchesState && matchesCategory && matchesSex
    })
  }, [profiles, searchTerm, rangeFilters, stateFilters, categoryFilters, sexFilters])

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
        // Show preview of first profile for debugging
        const firstProfile = parsedProfiles[0]
        console.log('Sample imported profile:', firstProfile)
        console.log('All imported profiles:', parsedProfiles)
        
        addProfiles(parsedProfiles)
        
        const profilesWithLinks = parsedProfiles.filter(p => p.profileLink && p.profileLink.trim()).length
        alert(`Successfully imported ${parsedProfiles.length} profiles!\n\n${profilesWithLinks} profiles have links.\n\nSample: ${firstProfile.name || 'N/A'}\nLink: ${firstProfile.profileLink || 'Not found - check your Excel column names'}`)
      } else {
        alert('No valid profiles found in the file. Please check that your file has data rows.')
      }
    } catch (error) {
      alert(`Error importing file: ${error.message}\n\nPlease ensure your Excel file has:\n- A header row with column names\n- At least one data row\n- Column names that match: Name, Profile Link, Platform, etc.`)
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  const handleExport = (format) => {
    const profilesToExport = selectedProfiles.length > 0
      ? profiles.filter(p => selectedProfiles.includes(p.id))
      : filteredProfiles

    if (profilesToExport.length === 0) {
      alert('No profiles to export')
      return
    }

    const filename = `rosterra_profiles_${new Date().toISOString().split('T')[0]}`

    switch (format) {
      case 'excel':
        exportToExcel(profilesToExport, filename)
        break
      case 'csv':
        exportToCSV(profilesToExport, filename)
        break
      case 'pdf':
        exportToPDF(profilesToExport, filename)
        break
    }
  }

  const startEdit = (profile) => {
    setEditingId(profile.id)
    setEditData({ ...profile })
  }

  const saveEdit = () => {
    updateProfile(editingId, editData)
    setEditingId(null)
    setEditData({})
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this profile?')) {
      deleteProfile(id)
    }
  }

  const handleBulkDelete = () => {
    if (selectedProfiles.length === 0) {
      alert('Please select profiles to delete')
      return
    }
    if (confirm(`Are you sure you want to delete ${selectedProfiles.length} profile(s)?`)) {
      deleteProfiles(selectedProfiles)
    }
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            Profiles
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and export influencer profiles ({filteredProfiles.length} total)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
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
          <div className="relative group">
            <button className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all flex items-center space-x-2 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 font-medium">
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleExport('excel')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 rounded-t-lg text-gray-900 dark:text-gray-100 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                <span>Export as Excel</span>
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-900 dark:text-gray-100 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>Export as CSV</span>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 rounded-b-lg text-gray-900 dark:text-gray-100 transition-colors"
              >
                <FileText className="w-4 h-4 text-red-600" />
                <span>Export as PDF</span>
              </button>
            </div>
          </div>
          {selectedProfiles.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all flex items-center space-x-2 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 font-medium"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete ({selectedProfiles.length})</span>
            </button>
          )}
        </div>
      </div>


      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-2 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={filteredProfiles.length > 0 && filteredProfiles.every(p => selectedProfiles.includes(p.id))}
                    onChange={(e) => e.target.checked ? selectAll() : deselectAll()}
                    className="rounded"
                  />
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Name</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Profile Link</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Platform</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Followers</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  <div className="relative filter-dropdown">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenDropdown(openDropdown === 'location' ? null : 'location')
                      }}
                      className="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <span>Location (City, State)</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'location' ? 'rotate-180' : ''}`} />
                      {stateFilters.length > 0 && stateFilters[0] !== 'All' && (
                        <span className="ml-1 px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                          {stateFilters.length}
                        </span>
                      )}
                    </button>
                    {openDropdown === 'location' && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-64 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-2">
                          {uniqueStates.filter(s => s !== 'All').map(state => (
                            <label key={state} className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isFilterSelected('state', state)}
                                onChange={() => toggleFilter('state', state)}
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{state}</span>
                            </label>
                          ))}
                          <button
                            onClick={() => setStateFilters(['All'])}
                            className="w-full mt-2 px-3 py-1.5 text-xs text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  <div className="relative filter-dropdown">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenDropdown(openDropdown === 'category' ? null : 'category')
                      }}
                      className="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <span>Category/Niche</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'category' ? 'rotate-180' : ''}`} />
                      {categoryFilters.length > 0 && categoryFilters[0] !== 'All' && (
                        <span className="ml-1 px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                          {categoryFilters.length}
                        </span>
                      )}
                    </button>
                    {openDropdown === 'category' && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-64 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-2">
                          {uniqueCategories.filter(c => c !== 'All').map(category => (
                            <label key={category} className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isFilterSelected('category', category)}
                                onChange={() => toggleFilter('category', category)}
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                            </label>
                          ))}
                          <button
                            onClick={() => setCategoryFilters(['All'])}
                            className="w-full mt-2 px-3 py-1.5 text-xs text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Commercials</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  <div className="relative filter-dropdown">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenDropdown(openDropdown === 'range' ? null : 'range')
                      }}
                      className="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <span>Range</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'range' ? 'rotate-180' : ''}`} />
                      {rangeFilters.length > 0 && rangeFilters[0] !== 'All' && (
                        <span className="ml-1 px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                          {rangeFilters.length}
                        </span>
                      )}
                    </button>
                    {openDropdown === 'range' && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-64 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-2">
                          {RANGE_CATEGORIES.filter(r => r !== 'All').map(range => (
                            <label key={range} className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isFilterSelected('range', range)}
                                onChange={() => toggleFilter('range', range)}
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{range}</span>
                            </label>
                          ))}
                          <button
                            onClick={() => setRangeFilters(['All'])}
                            className="w-full mt-2 px-3 py-1.5 text-xs text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Contact</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  <div className="relative filter-dropdown">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenDropdown(openDropdown === 'sex' ? null : 'sex')
                      }}
                      className="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <span>Sex</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'sex' ? 'rotate-180' : ''}`} />
                      {sexFilters.length > 0 && sexFilters[0] !== 'All' && (
                        <span className="ml-1 px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                          {sexFilters.length}
                        </span>
                      )}
                    </button>
                    {openDropdown === 'sex' && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-64 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-2">
                          {uniqueSex.filter(s => s !== 'All').map(sex => (
                            <label key={sex} className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isFilterSelected('sex', sex)}
                                onChange={() => toggleFilter('sex', sex)}
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{sex}</span>
                            </label>
                          ))}
                          <button
                            onClick={() => setSexFilters(['All'])}
                            className="w-full mt-2 px-3 py-1.5 text-xs text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Age</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Email</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan="14" className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    {profiles.length === 0 
                      ? 'No profiles yet. Import an Excel or CSV file to get started.'
                      : 'No profiles match your filters.'}
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-2 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProfiles.includes(profile.id)}
                        onChange={() => toggleSelectProfile(profile.id)}
                        className="rounded"
                      />
                    </td>
                    {editingId === profile.id ? (
                      <>
                        <td className="px-2 py-3">
                          <input
                            type="text"
                            value={editData.name || ''}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input
                            type="text"
                            value={editData.profileLink || ''}
                            onChange={(e) => setEditData({ ...editData, profileLink: e.target.value })}
                            placeholder="Enter link exactly as it should appear"
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 transition-colors"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input
                            type="text"
                            value={editData.platform || ''}
                            onChange={(e) => setEditData({ ...editData, platform: e.target.value })}
                            placeholder="Auto-detected from link"
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                            readOnly
                            title="Platform is auto-detected from profile link"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input
                            type="text"
                            value={editData.followersDisplay || editData.followers || ''}
                            onChange={(e) => {
                              const value = e.target.value
                              // Parse the value (supports 10K, 5M format)
                              let numeric = 0
                              const upper = value.toUpperCase()
                              if (upper.includes('M')) {
                                numeric = parseFloat(upper.replace(/[^\d.]/g, '')) * 1000000
                              } else if (upper.includes('K')) {
                                numeric = parseFloat(upper.replace(/[^\d.]/g, '')) * 1000
                              } else {
                                numeric = parseFloat(value.replace(/[^\d.]/g, '')) || 0
                              }
                              setEditData({ ...editData, followers: numeric, followersDisplay: value })
                            }}
                            placeholder="e.g., 10K, 5M, 100000"
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input
                            type="text"
                            value={editData.state || ''}
                            onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                            placeholder="Location (City, State)"
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input
                            type="text"
                            value={editData.category || ''}
                            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                            placeholder="Category/Niche"
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input
                            type="text"
                            value={editData.commercials || ''}
                            onChange={(e) => setEditData({ ...editData, commercials: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium">
                            {getRangeCategory(editData.followers || 0)}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <input
                            type="text"
                            value={editData.phoneNumber || ''}
                            onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                            placeholder="Contact"
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <select
                            value={editData.sex || ''}
                            onChange={(e) => setEditData({ ...editData, sex: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                          >
                            <option value="">Select...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Couple">Couple</option>
                            <option value="M">M</option>
                            <option value="F">F</option>
                          </select>
                        </td>
                        <td className="px-2 py-3">
                          <input
                            type="number"
                            value={editData.age || ''}
                            onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                            placeholder="Age"
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input
                            type="email"
                            value={editData.email || ''}
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={saveEdit}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-2 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{profile.name || '-'}</td>
                        <td className="px-2 py-3 text-sm">
                          {profile.profileLink ? (
                            <a 
                              href={profile.profileLink}
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline truncate block max-w-xs font-medium cursor-pointer transition-colors break-all"
                              title={profile.profileLink}
                            >
                              <span className="truncate inline-block max-w-xs">
                                {profile.profileLink.length > 50 
                                  ? `${profile.profileLink.substring(0, 50)}...` 
                                  : profile.profileLink}
                              </span>
                            </a>
                          ) : (
                            <span className="text-gray-400 italic">No link</span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {profile.platform ? (
                            <span className="px-2 py-1 bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-semibold shadow-sm">
                              {abbreviatePlatform(profile.platform)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {profile.followersDisplay || (profile.followers ? profile.followers.toLocaleString() : '0')}
                        </td>
                        <td className="px-2 py-3 text-sm">
                          {profile.state ? (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium">
                              {profile.state}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-sm">
                          {profile.category ? (
                            <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-medium">
                              {profile.category}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-sm text-gray-700 dark:text-gray-300">{profile.commercials || '-'}</td>
                        <td className="px-2 py-3 text-sm">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium">
                            {getRangeCategory(profile.followers)}
                          </span>
                        </td>
                        <td className="px-2 py-3 text-sm text-gray-700 dark:text-gray-300">{profile.phoneNumber || '-'}</td>
                        <td className="px-2 py-3 text-sm">
                          {profile.sex ? (
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium border-2 ${
                              profile.sex.toLowerCase().includes('male') || profile.sex.toLowerCase() === 'm' || profile.sex.toLowerCase() === 'male'
                                ? 'bg-blue-200 dark:bg-blue-800/40 text-blue-800 dark:text-blue-300 border-blue-400 dark:border-blue-600'
                                : profile.sex.toLowerCase().includes('couple') || profile.sex.toLowerCase().includes('both')
                                ? 'bg-purple-200 dark:bg-purple-800/40 text-purple-800 dark:text-purple-300 border-purple-400 dark:border-purple-600'
                                : 'bg-pink-200 dark:bg-pink-800/40 text-pink-800 dark:text-pink-300 border-pink-400 dark:border-pink-600'
                            }`}>
                              {profile.sex}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-sm text-gray-700 dark:text-gray-300">{profile.age || '-'}</td>
                        <td className="px-2 py-3 text-sm text-gray-700 dark:text-gray-300">{profile.email || '-'}</td>
                        <td className="px-2 py-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => startEdit(profile)}
                              className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(profile.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
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

export default Profiles
