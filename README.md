# SapphireIQ Notes/Task API

A REST API built with Node.js, Express, MongoDB, and Mongoose. It includes CRUD operations, request validation, consistent error responses, filtering, sorting, search, and pagination.

## Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas database

## Run locally
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env`.
3. Put your MongoDB connection string in `.env` as `MONGODB_URI`.
4. Start development server: `npm run dev`
5. Open `http://localhost:5000/health`.

Do not commit `.env` or share database credentials.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | API overview |
| GET | `/health` | Health and database status |
| POST | `/api/notes` | Create a note |
| GET | `/api/notes` | List notes |
| GET | `/api/notes/:id` | Get one note |
| PATCH | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |

### Create a note
`POST /api/notes` with JSON:
```json
{
  "title": "Prepare project report",
  "content": "Finish the API documentation",
  "category": "College",
  "completed": false,
  "tags": ["project", "college"]
}
```

### Query features
- `GET /api/notes?page=1&limit=10`
- `GET /api/notes?completed=false`
- `GET /api/notes?category=College`
- `GET /api/notes?search=report`
- `GET /api/notes?sortBy=title&order=asc`
- Combine options: `/api/notes?completed=false&search=project&sortBy=createdAt&order=desc&page=1&limit=5`

Supported `sortBy`: `createdAt`, `updatedAt`, `title`, `category`, `completed`. Limit is 1–100.

## Example curl requests
Create:
```bash
curl -X POST http://localhost:5000/api/notes -H "Content-Type: application/json" -d "{\"title\":\"Demo note\",\"content\":\"Testing CRUD\"}"
```
List:
```bash
curl "http://localhost:5000/api/notes?page=1&limit=10"
```
Update:
```bash
curl -X PATCH http://localhost:5000/api/notes/NOTE_ID -H "Content-Type: application/json" -d "{\"completed\":true}"
```
Delete:
```bash
curl -X DELETE http://localhost:5000/api/notes/NOTE_ID
```

## Deploy
Deploy the repository as a Node web service on Render (or another Node-compatible host). Set the build command to `npm install`, start command to `npm start`, and add `MONGODB_URI` as a secret environment variable in the hosting dashboard. Use MongoDB Atlas for a hosted database and configure its network access for the deployment host. Never put real credentials in source control.
