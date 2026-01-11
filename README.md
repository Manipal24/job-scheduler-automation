# Job Scheduler & Automation Dashboard

**A full-stack web application for managing background jobs with real-time status tracking and webhook integration.**

## Features

✅ **Create Jobs** - Submit background tasks with custom payload and priority  
✅ **Job Runner** - Simulate long-running processes with status transitions  
✅ **Real-time Dashboard** - Track job status (pending, running, completed)  
✅ **Filtering** - Filter jobs by status and priority  
✅ **Webhook Integration** - Automatic notifications on job completion  
✅ **REST API** - Complete API for job management  
✅ **Responsive UI** - Built with React and Tailwind CSS  

## Tech Stack

**Frontend:**
- React 18
- Next.js 13
- Tailwind CSS
- Axios

**Backend:**
- Node.js with Express
- SQLite3
- Axios for HTTP requests
- CORS enabled

**Deployment:**
- Vercel (Frontend)
- Render.com (Backend)

## Project Structure

```
job-scheduler-automation/
├── backend/
│   ├── index.js              # Express server & API endpoints
│   ├── package.json          # Backend dependencies
│   └── .env                  # Environment variables
├── frontend/
│   ├── pages/
│   │   ├── index.js          # Main dashboard
│   │   └── jobs/[id].js      # Job detail view
│   ├── components/
│   │   ├── JobTable.jsx      # Jobs table with filters
│   │   ├── CreateJobForm.jsx # Job creation form
│   │   └── JobDetailModal.jsx
│   ├── styles/
│   │   └── globals.css       # Tailwind CSS
│   └── package.json
├── README.md
└── .gitignore
```

## API Endpoints

### Create Job
```
POST /jobs
Body: { taskName: string, payload: object, priority: "Low"|"Medium"|"High" }
Response: { id, taskName, payload, priority, status: "pending" }
```

### List Jobs
```
GET /jobs?status=pending&priority=High
Response: [ { id, taskName, payload, priority, status, createdAt, updatedAt } ]
```

### Get Job Details
```
GET /jobs/:id
Response: { id, taskName, payload, priority, status, createdAt, updatedAt, completedAt }
```

### Run Job
```
POST /run-job/:id
Response: { message: "Job started", jobId }
(Sets status to "running", waits 3 seconds, then "completed", triggers webhook)
```

## Webhook Integration

When a job completes, the backend sends a POST request to `webhook.site` with:
```json
{
  "jobId": 1,
  "taskName": "Send Email",
  "priority": "High",
  "payload": { "email": "user@example.com", "subject": "Welcome" },
  "completedAt": "2025-01-11T10:30:45.123Z"
}
```

## Setup Instructions

### Backend Setup
```bash
cd backend
npm install
echo "PORT=5000" > .env
echo "WEBHOOK_URL=https://webhook.site/YOUR-UNIQUE-ID" >> .env
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

## Database Schema

```sql
CREATE TABLE jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  taskName TEXT NOT NULL,
  payload TEXT,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  completedAt DATETIME
);
```

## UI Screenshots

**Dashboard View:**
- Jobs table with sortable columns
- Real-time status badges
- Run Job and View Details buttons
- Filter sidebar

**Job Creation:**
- Task name input
- JSON payload editor
- Priority selector
- Submit button

**Job Details:**
- Full job information
- Formatted JSON payload
- Status timeline
- Completion timestamp

## AI Usage Log

This project was built with AI assistance for:

1. **Backend API Design** - Express.js structure and SQLite integration
2. **Frontend Components** - React component architecture with Tailwind CSS
3. **Webhook Integration** - Implementation of axios for outbound requests
4. **UI/UX** - Dashboard layout and form design
5. **Documentation** - README and inline code comments

**Tools Used:**
- OpenAI GPT-4 for code generation
- Perplexity AI for architectural decisions

## Deployment

### Deploy Backend to Render.com
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables
5. Deploy

### Deploy Frontend to Vercel
1. Import GitHub repository
2. Set API endpoint environment variable
3. Deploy

## Future Enhancements

- [ ] Job retry logic
- [ ] Job scheduling with cron
- [ ] Persistent database (PostgreSQL)
- [ ] Authentication & authorization
- [ ] Job history and analytics
- [ ] WebSocket for real-time updates
- [ ] Email notifications
- [ ] Advanced filtering and search

## License

MIT

## Author

Built for Dotix Technologies Full Stack Developer Assessment  
Created: January 2025
