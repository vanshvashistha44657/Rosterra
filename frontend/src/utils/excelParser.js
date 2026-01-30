import * as XLSX from 'xlsx'
import Papa from 'papaparse'

const PLATFORMS = ['Instagram', 'YouTube', 'TikTok', 'Facebook']

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
        
        if (jsonData.length < 2) {
          reject(new Error('Excel file must have at least a header row and one data row'))
          return
        }

        const headers = jsonData[0].map(h => String(h).toLowerCase().trim())
        console.log('Detected headers:', headers)
        const profiles = []

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i]
          if (!row || row.every(cell => !cell)) continue // Skip empty rows

          // Try to find profile link - check all columns that might contain URLs
          let profileLink = getValue(row, headers, [
            'profile link', 'link', 'url', 'profile', 'profile url', 
            'social link', 'instagram link', 'youtube link', 'tiktok link', 
            'facebook link', 'handle', 'username link', 'instagram', 'youtube',
            'tiktok', 'facebook', 'social media link', 'channel link', 'page link'
          ])
          
          // If no link found, try to find any cell that looks like a URL
          // But preserve EXACT format - no trimming or modifications
          if (!profileLink) {
            for (let j = 0; j < row.length; j++) {
              const cellValue = String(row[j] || '')
              if (cellValue && (cellValue.includes('http') || 
                  cellValue.includes('instagram.com') || 
                  cellValue.includes('youtube.com') || 
                  cellValue.includes('tiktok.com') || 
                  cellValue.includes('facebook.com') ||
                  cellValue.startsWith('@') ||
                  cellValue.includes('/'))) {
                profileLink = cellValue // Store EXACTLY as is
                break
              }
            }
          }

          // Preserve original profileLink EXACTLY as it is in Excel - NO modifications at all
          const originalLink = profileLink ? String(profileLink) : ''
          
          // Auto-detect platform from profile link or platform field
          let detectedPlatform = getValue(row, headers, ['platform', 'social media', 'social', 'social platform'])
          
          // If platform not found, try to detect from link
          if (!detectedPlatform && originalLink) {
            const linkLower = originalLink.toLowerCase()
            if (linkLower.includes('instagram.com') || linkLower.includes('ig') || originalLink.includes('IG')) {
              detectedPlatform = 'Instagram'
            } else if (linkLower.includes('youtube.com') || linkLower.includes('youtu.be') || linkLower.includes('yt') || originalLink.includes('YT')) {
              detectedPlatform = 'YouTube'
            } else if (linkLower.includes('tiktok.com') || linkLower.includes('tiktok') || originalLink.includes('TT')) {
              detectedPlatform = 'TikTok'
            } else if (linkLower.includes('facebook.com') || linkLower.includes('fb.com') || linkLower.includes('facebook') || originalLink.includes('FB')) {
              detectedPlatform = 'Facebook'
            }
          }
          
          // Normalize platform abbreviations
          if (detectedPlatform) {
            const platformUpper = detectedPlatform.toUpperCase()
            if (platformUpper.includes('IG') || platformUpper.includes('INSTAGRAM')) {
              detectedPlatform = 'Instagram'
            } else if (platformUpper.includes('YT') || platformUpper.includes('YOUTUBE')) {
              detectedPlatform = 'YouTube'
            } else if (platformUpper.includes('TT') || platformUpper.includes('TIKTOK')) {
              detectedPlatform = 'TikTok'
            } else if (platformUpper.includes('FB') || platformUpper.includes('FACEBOOK')) {
              detectedPlatform = 'Facebook'
            }
          }
          
          const followersData = parseNumber(getValue(row, headers, ['followers', 'subscribers', 'follower count', 'followers count', 'subscriber count']))
          
          const profile = {
            id: `profile_${Date.now()}_${i}`,
            name: getValue(row, headers, ['name', 'full name', 'username', 'influencer name']), // EXACT as in Excel
            profileLink: originalLink, // EXACT original format from Excel - NO changes, NO trimming
            platform: detectedPlatform || '',
            followers: followersData.numeric, // Numeric value for calculations
            followersDisplay: followersData.display, // Original format for display (10K, 5M, etc.)
            commercials: getValue(row, headers, ['commercials', 'commercial', 'rate', 'price', 'commercial rate', 'pricing']), // EXACT as in Excel
            range: getValue(row, headers, ['range', 'avg views', 'average views', 'views', 'view range', 'average view']), // EXACT as in Excel
            phoneNumber: getValue(row, headers, ['phone', 'phone number', 'mobile', 'contact', 'contact number', 'mobile number']), // EXACT as in Excel
            email: getValue(row, headers, ['email', 'email id', 'email address', 'e-mail']), // EXACT as in Excel
            state: getValue(row, headers, ['state', 'location', 'city', 'region', 'area']), // EXACT as in Excel
            category: getValue(row, headers, ['category', 'niche', 'category/niche', 'type', 'genre']), // EXACT as in Excel
            sex: getValue(row, headers, ['sex', 'gender', 'male/female', 'm/f']), // EXACT as in Excel
            age: getValue(row, headers, ['age']) // EXACT as in Excel
          }

          profiles.push(profile)
        }

        resolve(profiles)
      } catch (error) {
        reject(new Error(`Error parsing Excel file: ${error.message}`))
      }
    }

    reader.onerror = () => reject(new Error('Error reading file'))
    reader.readAsArrayBuffer(file)
  })
}

function getValue(row, headers, possibleKeys) {
  for (const key of possibleKeys) {
    const index = headers.findIndex(h => {
      const headerLower = h.toLowerCase()
      const keyLower = key.toLowerCase()
      return headerLower === keyLower || headerLower.includes(keyLower) || keyLower.includes(headerLower)
    })
    if (index !== -1 && row[index] !== undefined && row[index] !== null) {
      const value = String(row[index]).trim()
      if (value) return value
    }
  }
  return ''
}

function parseNumber(value) {
  if (!value) return { numeric: 0, display: '0' }
  
  const str = String(value).trim().toUpperCase()
  
  // Check if it already has K or M suffix
  if (str.includes('K') || str.includes('M')) {
    const numPart = parseFloat(str.replace(/[^\d.]/g, ''))
    if (isNaN(numPart)) return { numeric: 0, display: '0' }
    
    if (str.includes('M')) {
      const numeric = numPart * 1000000
      return { numeric, display: `${numPart}M` }
    } else if (str.includes('K')) {
      const numeric = numPart * 1000
      return { numeric, display: `${numPart}K` }
    }
  }
  
  // Regular number
  const num = parseFloat(String(value).replace(/[^\d.]/g, ''))
  if (isNaN(num)) return { numeric: 0, display: '0' }
  
  // Format for display
  let display = String(value).trim()
  if (!display.includes('K') && !display.includes('M')) {
    if (num >= 1000000) {
      display = `${(num / 1000000).toFixed(1)}M`.replace('.0', '')
    } else if (num >= 1000) {
      display = `${(num / 1000).toFixed(1)}K`.replace('.0', '')
    } else {
      display = num.toString()
    }
  }
  
  return { numeric: num, display }
}

function normalizeUrl(url) {
  if (!url || !url.trim()) return ''
  
  // Preserve the original URL exactly as it is in Excel
  url = url.trim()
  
  // Only normalize if it's clearly not a valid URL format
  // If it already has http:// or https://, keep it as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // If it contains a domain (instagram.com, youtube.com, etc.) but no protocol, add https://
  if ((url.includes('instagram.com') || url.includes('youtube.com') || 
       url.includes('youtu.be') || url.includes('tiktok.com') || 
       url.includes('facebook.com') || url.includes('fb.com')) && 
      !url.includes('://')) {
    return `https://${url}`
  }
  
  // If it starts with @, convert to Instagram URL (common format)
  if (url.startsWith('@')) {
    return `https://instagram.com/${url.substring(1)}`
  }
  
  // For everything else, return as-is to preserve original format
  return url
}

export function parseCSVFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const headers = Object.keys(results.data[0] || {}).map(h => h.toLowerCase().trim())
          console.log('CSV Detected headers:', headers)
          
          const profiles = results.data.map((row, index) => {
            // Try to find profile link
            let profileLink = getValueFromObject(row, headers, [
              'profile link', 'link', 'url', 'profile', 'profile url', 
              'social link', 'instagram link', 'youtube link', 'tiktok link', 
              'facebook link', 'handle', 'username link', 'instagram', 'youtube',
              'tiktok', 'facebook', 'social media link', 'channel link', 'page link'
            ])
            
            // If no link found, try to find any value that looks like a URL
            // But preserve EXACT format - no trimming or modifications
            if (!profileLink) {
              for (const key in row) {
                const value = String(row[key] || '')
                if (value && (value.includes('http') || 
                    value.includes('instagram.com') || 
                    value.includes('youtube.com') || 
                    value.includes('tiktok.com') || 
                    value.includes('facebook.com') ||
                    value.startsWith('@') ||
                    (value.includes('/') && !value.includes(' ')))) {
                  profileLink = value // Store EXACTLY as is
                  break
                }
              }
            }
            
            // Preserve original profileLink EXACTLY as it is in CSV - NO modifications at all
            const originalLink = profileLink ? String(profileLink) : ''
            
            // Auto-detect platform from profile link or platform field
            let detectedPlatform = getValueFromObject(row, headers, ['platform', 'social media', 'social', 'social platform'])
            
            // If platform not found, try to detect from link
            if (!detectedPlatform && originalLink) {
              const linkLower = originalLink.toLowerCase()
              if (linkLower.includes('instagram.com') || linkLower.includes('ig') || originalLink.includes('IG')) {
                detectedPlatform = 'Instagram'
              } else if (linkLower.includes('youtube.com') || linkLower.includes('youtu.be') || linkLower.includes('yt') || originalLink.includes('YT')) {
                detectedPlatform = 'YouTube'
              } else if (linkLower.includes('tiktok.com') || linkLower.includes('tiktok') || originalLink.includes('TT')) {
                detectedPlatform = 'TikTok'
              } else if (linkLower.includes('facebook.com') || linkLower.includes('fb.com') || linkLower.includes('facebook') || originalLink.includes('FB')) {
                detectedPlatform = 'Facebook'
              }
            }
            
            // Normalize platform abbreviations
            if (detectedPlatform) {
              const platformUpper = detectedPlatform.toUpperCase()
              if (platformUpper.includes('IG') || platformUpper.includes('INSTAGRAM')) {
                detectedPlatform = 'Instagram'
              } else if (platformUpper.includes('YT') || platformUpper.includes('YOUTUBE')) {
                detectedPlatform = 'YouTube'
              } else if (platformUpper.includes('TT') || platformUpper.includes('TIKTOK')) {
                detectedPlatform = 'TikTok'
              } else if (platformUpper.includes('FB') || platformUpper.includes('FACEBOOK')) {
                detectedPlatform = 'Facebook'
              }
            }
            
            const followersData = parseNumber(getValueFromObject(row, headers, ['followers', 'subscribers', 'follower count', 'followers count', 'subscriber count']))
            
            return {
              id: `profile_${Date.now()}_${index}`,
              name: getValueFromObject(row, headers, ['name', 'full name', 'username', 'influencer name']), // EXACT as in CSV
              profileLink: originalLink, // EXACT original format from CSV - NO changes, NO trimming
              platform: detectedPlatform || '',
              followers: followersData.numeric, // Numeric value for calculations
              followersDisplay: followersData.display, // Original format for display (10K, 5M, etc.)
              commercials: getValueFromObject(row, headers, ['commercials', 'commercial', 'rate', 'price', 'commercial rate', 'pricing']), // EXACT as in CSV
              range: getValueFromObject(row, headers, ['range', 'avg views', 'average views', 'views', 'view range', 'average view']), // EXACT as in CSV
              phoneNumber: getValueFromObject(row, headers, ['phone', 'phone number', 'mobile', 'contact', 'contact number', 'mobile number']), // EXACT as in CSV
              email: getValueFromObject(row, headers, ['email', 'email id', 'email address', 'e-mail']), // EXACT as in CSV
              state: getValueFromObject(row, headers, ['state', 'location', 'city', 'region', 'area']), // EXACT as in CSV
              category: getValueFromObject(row, headers, ['category', 'niche', 'category/niche', 'type', 'genre']), // EXACT as in CSV
              sex: getValueFromObject(row, headers, ['sex', 'gender', 'male/female', 'm/f']), // EXACT as in CSV
              age: getValueFromObject(row, headers, ['age']) // EXACT as in CSV
            }
          })

          resolve(profiles)
        } catch (error) {
          reject(new Error(`Error parsing CSV file: ${error.message}`))
        }
      },
      error: (error) => {
        reject(new Error(`Error parsing CSV file: ${error.message}`))
      }
    })
  })
}

function getValueFromObject(obj, headers, possibleKeys) {
  for (const key of possibleKeys) {
    const headerKey = headers.find(h => {
      const headerLower = h.toLowerCase()
      const keyLower = key.toLowerCase()
      return headerLower === keyLower || headerLower.includes(keyLower) || keyLower.includes(headerLower)
    })
    if (headerKey && obj[headerKey] !== undefined && obj[headerKey] !== null) {
      // Return EXACT value as it appears in CSV - no trimming or modifications
      const value = String(obj[headerKey])
      if (value) return value
    }
  }
  return ''
}
