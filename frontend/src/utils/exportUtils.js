import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export function exportToExcel(profiles, filename = 'rosterra_profiles') {
  const data = profiles.map(profile => ({
    'Name': profile.name || '',
    'Profile Link': profile.profileLink || '',
    'Platform': profile.platform || '',
    'Followers/Subscribers': profile.followersDisplay || profile.followers || 0,
    'Range': getRangeCategory(profile.followers || 0),
    'Commercials': profile.commercials || '',
    'Category/Niche': profile.category || '',
    'Sex': profile.sex || '',
    'State': profile.state || '',
    'Phone Number': profile.phoneNumber || '',
    'Email ID': profile.email || ''
  }))
  
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

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Profiles')
  
  // Auto-size columns
  const maxWidth = 50
  const wscols = [
    { wch: 20 }, // Name
    { wch: 40 }, // Profile Link
    { wch: 15 }, // Platform
    { wch: 18 }, // Followers
    { wch: 15 }, // Range
    { wch: 15 }, // Commercials
    { wch: 20 }, // Category/Niche
    { wch: 10 }, // Sex
    { wch: 15 }, // State
    { wch: 18 }, // Phone
    { wch: 30 }  // Email
  ]
  worksheet['!cols'] = wscols

  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

export function exportToCSV(profiles, filename = 'rosterra_profiles') {
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
  
  const headers = ['Name', 'Profile Link', 'Platform', 'Followers/Subscribers', 'Range', 'Commercials', 'State', 'Phone Number', 'Email ID']
  
  const rows = profiles.map(profile => [
    profile.name || '',
    profile.profileLink || '',
    profile.platform || '',
    profile.followersDisplay || profile.followers || 0,
    getRangeCategory(profile.followers || 0),
    profile.commercials || '',
    profile.category || '',
    profile.sex || '',
    profile.state || '',
    profile.phoneNumber || '',
    profile.email || ''
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToPDF(profiles, filename = 'rosterra_profiles') {
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
  
  const doc = new jsPDF()
  
  doc.setFontSize(18)
  doc.text('Rosterra - Profile Export', 14, 22)
  doc.setFontSize(11)
  doc.setTextColor(100, 100, 100)
  doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 30)

  const tableData = profiles.map(profile => [
    profile.name || '',
    profile.platform || '',
    profile.followersDisplay || profile.followers || 0,
    getRangeCategory(profile.followers || 0),
    profile.commercials || '',
    profile.category || '',
    profile.sex || '',
    profile.state || '',
    profile.phoneNumber || '',
    profile.email || ''
  ])

  doc.autoTable({
    startY: 35,
    head: [['Name', 'Platform', 'Followers', 'Range', 'Commercials', 'Category/Niche', 'Sex', 'State', 'Phone', 'Email']],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [14, 165, 233] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { top: 35, right: 14, bottom: 20, left: 14 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 20 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 15 },
      5: { cellWidth: 20 },
      6: { cellWidth: 20 },
      7: { cellWidth: 15 },
      8: { cellWidth: 20 },
      9: { cellWidth: 25 },
      10: { cellWidth: 30 }
    }
  })

  doc.save(`${filename}.pdf`)
}
