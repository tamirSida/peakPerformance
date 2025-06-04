# Peak-Performance Free Diving Management System

## Project Overview
A web-based training session management system for Peak-Performance Free Diving, offering training sessions in the Mediterranean Sea and Eilat. The system allows users to view and register for training sessions from a pre-approved divers list.

## Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase (Firestore Database, Authentication)
- **Hosting**: Firebase Hosting (recommended)

## Key Features

### Public Features (No Authentication Required)
- View training sessions for Mediterranean Sea (4 spots) and Eilat (7 spots)
- View approved divers list
- Register for vacant training spots using approved diver names
- View current registrations and waiting lists

### Authenticated User Features
- All public features
- Admin panel access for managing the system
- Create and delete training sessions
- Add and remove approved divers
- Clear registrations from any spot

### Registration System
- **Main Spots**: 4 for Mediterranean, 7 for Eilat
- **Waiting List**: 2 spots per training session
- **Approval Required**: Only pre-approved divers can be selected
- **Lock Mechanism**: Once registered, non-admin users cannot change selections

## File Structure
```
peakPer/
├── index.html              # Main HTML structure
├── styles.css              # CSS styling and responsive design
├── script.js               # JavaScript functionality
├── firebase-config.js      # Firebase configuration
├── firestore-security-rules.txt # Database security rules
├── freediving-bg.jpg       # Hero section background image
└── CLAUDE.md              # This documentation file
```

## Database Collections

### `trainingForms`
```javascript
{
  location: "mediterranean" | "eilat",
  date: "YYYY-MM-DD",
  createdAt: timestamp,
  createdBy: userId
}
```

### `approvedDivers`
```javascript
{
  name: "Diver Name",
  createdAt: timestamp,
  createdBy: userId
}
```

### `registrations`
```javascript
{
  formId: "training-form-id",
  diverId: "approved-diver-id",
  diverName: "Diver Name",
  slot: 0-6, // slot number
  isWaiting: boolean,
  registeredBy: userId | "anonymous",
  registeredAt: timestamp
}
```

## Security Rules
- **Read Access**: Public for all collections except contacts
- **Write Access**: 
  - Registrations: Anyone can create, only authenticated users can delete
  - Training Forms & Approved Divers: Only authenticated users can create/delete
  - Contacts: Anyone can create, only authenticated users can read

## User Flow

### Registration Process
1. User selects approved diver from dropdown
2. **Non-Admin Users**: Green "OK" button appears → Click to confirm → Row locks
3. **Admin Users**: Auto-confirmation → Row remains editable
4. Registration saved to Firestore
5. UI updates to show filled spot

### Admin Management
1. Login to access admin panel
2. **Manage Forms Tab**: Create/delete training sessions
3. **Approved Divers Tab**: Add/remove approved divers
4. Full control over all registrations

## Development Commands

### Firebase Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init

# Deploy
firebase deploy
```

### Testing
- Test authentication flow
- Verify registration permissions
- Check admin panel functionality
- Test responsive design on mobile devices

## Responsive Design
- Mobile-first approach
- Breakpoints: 768px, 480px
- Adaptive grid layouts for training forms
- Touch-friendly buttons and interactions

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features used
- Firebase SDK compatibility required

## Maintenance Notes
- Monitor Firestore usage and costs
- Regular backup of approved divers list
- Update Firebase SDK versions as needed
- Review security rules periodically