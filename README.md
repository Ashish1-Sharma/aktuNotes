# B.Tech Notes Hub

A complete notes sharing platform for B.Tech students with an Admin Panel for content management.

## Features

### Public Website (Student Side)
- **Home Page**: Browse branches with available notes
- **Branch Page**: Select year to view subjects
- **Year Page**: View subjects by semester with tab navigation
- **Subject Notes Page**: Download and preview PDF notes
- **Search**: Find notes by subject name or keywords
- **Responsive Design**: Works on mobile and desktop

### Admin Panel
- **Secure Login**: Firebase Authentication
- **Dashboard**: View platform statistics and trending notes
- **Upload Notes**: Add new notes with branch/year/subject selection
- **Manage Notes**: Edit, delete, publish/unpublish notes
- **Dynamic Content**: Add new branches and subjects on-the-fly

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Auth
- **File Storage**: Cloudinary
- **Hosting**: Firebase Hosting

## Project Structure

```
src/
├── components/
│   ├── public/          # Public website components
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── admin/           # Admin panel components
│       └── AdminLayout.tsx
├── context/
│   └── AuthContext.tsx  # Authentication context
├── lib/
│   └── firebase.ts      # Firebase configuration
├── pages/
│   ├── public/          # Public pages
│   │   ├── HomePage.tsx
│   │   ├── BranchPage.tsx
│   │   ├── YearPage.tsx
│   │   ├── SubjectNotesPage.tsx
│   │   └── SearchPage.tsx
│   └── admin/           # Admin pages
│       ├── AdminLogin.tsx
│       ├── AdminDashboard.tsx
│       ├── AdminUpload.tsx
│       └── AdminManageNotes.tsx
├── services/
│   ├── firestore.ts     # Firestore database operations
│   └── cloudinary.ts    # Cloudinary upload service
├── types/
│   └── index.ts         # TypeScript type definitions
├── App.tsx              # Main application component
└── index.css            # Global styles
```

## Setup Instructions

### 1. Firebase Setup

1. Create a new Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Create an admin user in Firebase Auth
5. Copy your Firebase config and add to `.env` file

### 2. Cloudinary Setup

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Create an unsigned upload preset
3. Copy your cloud name and upload preset to `.env` file

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

### 6. Build for Production

```bash
npm run build
```

## Firestore Database Structure

### branches collection
```
branches/{branchId}
  - name: string
  - code: string
  - description?: string
  - createdAt: timestamp
```

### subjects collection
```
subjects/{subjectId}
  - name: string
  - branch: string (branchId)
  - year: number
  - semester: number
  - code?: string
  - createdAt: timestamp
```

### notes collection
```
notes/{noteId}
  - subjectId: string
  - title: string
  - description?: string
  - unit?: string
  - pdfUrl: string
  - isPublished: boolean
  - views: number
  - downloads: number
  - createdAt: timestamp
```

### noteStats collection
```
noteStats/{statId}
  - noteId: string
  - views: number
  - downloads: number
  - lastViewed?: timestamp
  - lastDownloaded?: timestamp
```

## Admin Configuration

To add admin users, update the `ADMIN_EMAILS` array in `src/context/AuthContext.tsx`:

```typescript
const ADMIN_EMAILS = ['admin@notes.com', 'your-email@example.com'];
```

## Features

### Dynamic Content Display
- Only branches with notes are shown on the homepage
- Only years with available subjects are displayed
- No empty pages or blank sections

### Analytics Tracking
- Note view counts
- Note download counts
- Trending notes on dashboard
- Search query logging

### Responsive Design
- Mobile-first approach
- Clean card-based layout
- Smooth animations and transitions

## Deployment

### Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase:
```bash
firebase init
```

4. Deploy:
```bash
firebase deploy
```

## License

MIT License - feel free to use this project for your own notes sharing platform.
