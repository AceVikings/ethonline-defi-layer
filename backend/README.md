# DeFlow Backend API

Express.js backend for DeFlow with Vincent authentication and MongoDB storage.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Required environment variables:
- `MONGODB_URI`: MongoDB connection string
- `VINCENT_APP_ID`: Your Vincent App ID from dashboard
- `VINCENT_ALLOWED_AUDIENCE`: Frontend URL (e.g., http://localhost:5176)
- `VINCENT_DELEGATEE_PRIVATE_KEY`: Private key of delegatee EOA

4. Start MongoDB (if running locally):
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or with Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

5. Run development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with Vincent JWT
- `GET /api/auth/profile` - Get user profile

### Workflows
- `GET /api/workflows` - Get all user workflows
- `GET /api/workflows/:id` - Get specific workflow
- `POST /api/workflows` - Create new workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `GET /api/workflows/:workflowId/executions` - Get execution history

All endpoints require Vincent JWT in `Authorization: Bearer <token>` header.

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration (database, vincent)
│   ├── models/          # MongoDB schemas
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   └── index.js         # App entry point
├── package.json
└── .env.example
```

## MongoDB Schemas

### User
- pkpEthAddress (unique)
- pkpPublicKey
- pkpTokenId
- authenticationMethod
- authenticationValue
- lastLogin

### Workflow
- userId (references User.pkpEthAddress)
- name
- description
- nodes[]
- edges[]
- triggers
- isActive
- lastExecuted
- executionCount

### ExecutionHistory
- workflowId (references Workflow._id)
- userId
- status
- nodeResults[]
- errors[]
- gasUsed
- costUSD
