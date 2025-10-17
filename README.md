# HWRCIT - Northumberland Warming Room Client Intake Tool

A comprehensive web-based platform for supporting individuals experiencing homelessness through smart assessments, service connections, and case management. This tool provides clients, outreach staff, and service providers a means to communicate and provide assistance to those in need.

## Features

### Core Functionality
- **Client Management**: Comprehensive client intake and profile management
- **Smart Assessments**: Dynamic assessment forms with risk evaluation
- **Case Management**: Track and manage cases with notes and status updates
- **Service Directory**: Connect clients with housing, food, health, employment, and other services
- **Messaging System**: Secure communication between staff, case managers, and service providers
- **Dashboard**: Real-time overview of clients, cases, assessments, and messages

### User Roles
- **Admin**: Full system access and user management
- **Staff**: Client intake, assessments, and case management
- **Service Provider**: Service directory management and referral tracking

## Technology Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database for data persistence
- **JWT** authentication
- **bcrypt** for password hashing

### Frontend
- **React 18** for UI
- **React Router** for navigation
- **Axios** for API communication
- Modern CSS with responsive design

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/acesonder/northumberlandwarmingroomclienmtintaketool.git
cd northumberlandwarmingroomclienmtintaketool
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

4. Create environment file:
```bash
cp .env.example .env
```

5. Edit `.env` and update the JWT_SECRET for production use

## Running the Application

### Development Mode

1. Start the backend server:
```bash
npm start
```
The API will be available at http://localhost:5000

2. In a new terminal, start the frontend development server:
```bash
cd client
npm start
```
The application will open at http://localhost:3000

### Production Build

1. Build the React frontend:
```bash
cd client
npm run build
cd ..
```

2. Set environment to production:
```bash
export NODE_ENV=production
```

3. Start the server:
```bash
npm start
```

The application will serve the built React app from http://localhost:5000

## Default User

For initial setup, create an admin user:

**Username:** admin  
**Password:** admin123  
**Email:** admin@warmingroom.ca  
**Role:** admin  

You can register this user through the API:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@warmingroom.ca",
    "password": "admin123",
    "role": "admin",
    "full_name": "System Administrator",
    "organization": "Northumberland Warming Room"
  }'
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/change-password` - Change password

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Archive client

### Assessments
- `GET /api/assessments` - Get all assessments
- `GET /api/assessments/:id` - Get assessment by ID
- `POST /api/assessments` - Create new assessment
- `PUT /api/assessments/:id` - Update assessment
- `DELETE /api/assessments/:id` - Delete assessment

### Cases
- `GET /api/cases` - Get all cases
- `GET /api/cases/:id` - Get case by ID with notes
- `POST /api/cases` - Create new case
- `PUT /api/cases/:id` - Update case
- `POST /api/cases/:id/notes` - Add note to case
- `DELETE /api/cases/:id` - Delete case

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `POST /api/services/connections` - Create service connection
- `GET /api/services/connections/list` - Get service connections
- `PUT /api/services/connections/:id` - Update connection

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/inbox` - Get inbox messages
- `GET /api/messages/sent` - Get sent messages
- `GET /api/messages/:id` - Get message by ID
- `PATCH /api/messages/:id/read` - Mark as read
- `GET /api/messages/inbox/unread/count` - Get unread count

## Database Schema

The application uses SQLite with the following tables:
- `users` - System users (staff, admins, service providers)
- `clients` - Individuals seeking assistance
- `assessments` - Client assessments and evaluations
- `cases` - Case management records
- `case_notes` - Notes attached to cases
- `services` - Available services directory
- `service_connections` - Client-service referrals
- `messages` - Internal messaging system

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- CORS protection
- Input validation
- SQL injection prevention through parameterized queries

## Contributing

This is a community project to support individuals experiencing homelessness in Northumberland, Ontario. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this for your community's needs.

## Support

For questions or support, please open an issue on GitHub.

## Acknowledgments

Built for the Northumberland community to provide better support and coordination for individuals experiencing homelessness.
