# Rosterra - Profile Management System

A comprehensive SaaS application for managing influencer profiles with Excel import/export capabilities, built with React, Vite, and Tailwind CSS.

## Features

- 🔐 **Authentication System** - Login and signup with role-based access (Admin/Staff)
- 📊 **Excel/CSV Import** - Import profiles from Excel (.xlsx, .xls) or CSV files
- 📋 **Profile Management** - View, edit, and delete profiles with all required fields
- 🔍 **Search & Filter** - Search profiles and filter by platform
- ✅ **Multi-Select** - Select single or multiple profiles for bulk operations
- 📤 **Export Functionality** - Export selected profiles to Excel, CSV, or PDF formats
- ✏️ **Inline Editing** - Edit profile data directly in the table
- 👥 **User Management** - Manage system users (Admin only)
- 💾 **Local Storage** - All data persisted in browser localStorage

## Profile Fields

- **Name** - Full name of the influencer
- **Profile Link** - Social media profile URL
- **Platform** - Instagram, YouTube, TikTok, or Facebook
- **Followers/Subscribers** - Number of followers
- **Commercials** - Commercial rate/price
- **Range (Avg Views)** - Average view count
- **Phone Number** - Contact number
- **Email ID** - Email address (optional)

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **XLSX** - Excel file parsing and generation
- **PapaParse** - CSV file parsing
- **jsPDF** - PDF generation
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

4. Create an account:
   - Click "Sign up"
   - Fill in your details
   - Choose Admin or Staff role
   - Sign in with your credentials

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Excel/CSV Import Format

Your Excel or CSV file should have the following columns (column names are flexible and will be auto-detected):

| Name | Profile Link | Platform | Followers | Commercials | Range | Phone Number | Email ID |
|------|--------------|----------|-----------|-------------|-------|---------------|----------|
| John Doe | https://instagram.com/johndoe | Instagram | 50000 | $500 | 10K-50K | +1234567890 | john@example.com |

**Note:** The system will automatically detect column names with variations like:
- Name: "name", "full name", "username"
- Profile Link: "profile link", "link", "url", "profile"
- Platform: "platform", "social media", "social"
- Followers: "followers", "subscribers", "follower count"
- Commercials: "commercials", "commercial", "rate", "price"
- Range: "range", "avg views", "average views", "views"
- Phone: "phone", "phone number", "mobile", "contact"
- Email: "email", "email id", "email address"

## Usage

### Importing Profiles

1. Click the "Import Excel/CSV" button
2. Select your Excel (.xlsx, .xls) or CSV file
3. The system will automatically parse and import all profiles

### Editing Profiles

1. Click the edit icon (pencil) next to any profile
2. Modify the fields inline
3. Click the checkmark to save or X to cancel

### Exporting Profiles

1. Select one or more profiles using checkboxes
2. Click the "Export" button
3. Choose your format:
   - **Excel** - .xlsx format
   - **CSV** - Comma-separated values
   - **PDF** - Portable Document Format

If no profiles are selected, all visible profiles will be exported.

### Filtering

- Use the search bar in the header to search by name, email, or phone
- Use the platform filter dropdown to filter by social media platform
- Use "Select All" or "None" to quickly select/deselect all profiles

## Project Structure

```
├── src/
│   ├── components/          # Reusable components
│   │   ├── Header.jsx       # Top navigation bar
│   │   ├── Sidebar.jsx      # Sidebar navigation
│   │   ├── Layout.jsx       # Main layout wrapper
│   │   └── ProtectedRoute.jsx # Auth protection
│   ├── context/             # React contexts
│   │   ├── AuthContext.jsx  # Authentication state
│   │   └── DataContext.jsx  # Profile data state
│   ├── pages/               # Page components
│   │   ├── Login.jsx        # Login page
│   │   ├── Signup.jsx       # Signup page
│   │   ├── Profiles.jsx     # Main profiles management page
│   │   └── Users.jsx        # User management page
│   ├── utils/               # Utility functions
│   │   ├── excelParser.js   # Excel/CSV parsing
│   │   └── exportUtils.js   # Export functions
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Data Storage

All data is stored in browser localStorage:
- `rosterra_user` - Current logged-in user
- `rosterra_users` - All system users
- `rosterra_profiles` - All imported profiles

**Note:** For production use, consider implementing a backend API with a proper database.

## Customization

### Colors

Edit `tailwind.config.js` to customize the color scheme. The primary color is set to blue.

### User Roles

- **Admin** - Full access to all features
- **Staff** - Can manage profiles (same as admin in current implementation)

## License

MIT

## Support

For issues or questions, please check the documentation or contact support.
