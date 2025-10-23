#  Node.js API Project

##  Description
This is a simple Node.js REST API using Express. It includes:
- Authentication using a custom header x-api-key
- Protected API routes
- Environment variable support using .env
- Organized folder structure (server.js, routes, middleware)

---

## How to Run the Server

### 1️⃣ Install Dependencies
```bash
npm install
Create a .env file in the root folder and add:
PORT=5000
API_KEY=12345
Start server 
node server.js
The server will run at:
http://localhost:5000
Every request to a protected route must include this header:
x-api-key: 12345
If the key is missing or wrong → Response:
{
  "message": "Unauthorized"
}
API Endpoints
GET /
Response:{ "message": "Welcome to the API!" }