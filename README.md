# MULAKHAT - Online Interview Platform

A comprehensive online interview platform built with React.js and Node.js, featuring live video interviews, collaborative coding, real-time chat, and automated assessment.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Candidate, Interviewer, Admin)
- Secure password hashing with bcrypt
- User profile management

### 📹 Live Video/Audio
- WebRTC integration for peer-to-peer video calls
- High-quality audio/video streaming
- Screen sharing capabilities
- Real-time connection management

### 💬 Real-time Communication
- Socket.io-powered live chat
- Real-time messaging during interviews
- Code collaboration with live updates
- Cursor position sharing

### 💻 Code Editor & Execution
- Monaco Editor integration
- Syntax highlighting for multiple languages
- Real-time code collaboration
- Integration with Judge0 API for code execution
- Automated test case evaluation

### 📅 Interview Management
- Interview scheduling and booking
- Calendar integration
- Interview history and analytics
- Feedback and rating system

### 👨‍💼 Admin Dashboard
- User management
- Interview monitoring
- System analytics
- Question bank management

## Tech Stack

### Frontend
- **React.js** - UI framework
- **Material-UI** - Component library
- **Socket.io Client** - Real-time communication
- **Monaco Editor** - Code editor
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd BACKEND
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
# Create .env file in BACKEND directory
PORT=5000
MONGO_URI=mongodb://localhost:27017/mulakhat
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_judge0_api_key
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd FRONTEND
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user profile
- `PUT /api/auth/updatepassword` - Update password

### Interviews
- `GET /api/interviews` - Get all interviews
- `GET /api/interviews/:id` - Get single interview
- `POST /api/interviews` - Create interview (Interviewer/Admin only)
- `PUT /api/interviews/:id` - Update interview
- `PUT /api/interviews/:id/start` - Start interview
- `PUT /api/interviews/:id/end` - End interview
- `POST /api/interviews/:id/submit-code` - Submit code solution

## Socket.io Events

### Client to Server
- `join-interview` - Join interview room
- `leave-interview` - Leave interview room
- `send-message` - Send chat message
- `code-change` - Send code changes
- `cursor-position` - Send cursor position
- `offer` - WebRTC offer
- `answer` - WebRTC answer
- `ice-candidate` - WebRTC ICE candidate

### Server to Client
- `receive-message` - Receive chat message
- `code-update` - Receive code changes
- `cursor-update` - Receive cursor position
- `offer` - Receive WebRTC offer
- `answer` - Receive WebRTC answer
- `ice-candidate` - Receive WebRTC ICE candidate

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (candidate/interviewer/admin),
  avatar: String,
  bio: String,
  skills: [String],
  experience: Number,
  isVerified: Boolean,
  lastLogin: Date
}
```

### Interview Model
```javascript
{
  title: String,
  description: String,
  interviewer: ObjectId (User),
  candidate: ObjectId (User),
  scheduledAt: Date,
  duration: Number,
  status: String (scheduled/in-progress/completed/cancelled),
  questions: [ObjectId (Question)],
  roomId: String (unique),
  startedAt: Date,
  endedAt: Date,
  feedback: Object,
  candidateCode: [Object]
}
```

### Question Model
```javascript
{
  title: String,
  description: String,
  difficulty: String (easy/medium/hard),
  category: String,
  tags: [String],
  testCases: [Object],
  timeLimit: Number,
  memoryLimit: Number,
  createdBy: ObjectId (User),
  isActive: Boolean
}
```

## Development

### Running in Development Mode
1. Start MongoDB service
2. Run backend: `cd BACKEND && npm start`
3. Run frontend: `cd FRONTEND && npm start`

### Building for Production
1. Build frontend: `cd FRONTEND && npm run build`
2. The built files will be in `FRONTEND/build/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository.

---

**MULAKHAT** - Making technical interviews more efficient and accessible! 🚀
