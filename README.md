# 🎨 Real-Time Collaborative Whiteboard

A real-time collaborative whiteboard application built using the **MERN Stack** and **Socket.IO**, enabling multiple users to draw, brainstorm, and collaborate on a shared canvas simultaneously.

Users can create or join rooms using unique room codes, draw with customizable colors and stroke widths, view other participants' cursors in real time, and clear the shared canvas collaboratively.

## ✨ Features

- **Room Management:** Create or join collaborative rooms using unique room codes.
- **Real-Time Drawing:** Draw and see other users' strokes instantly.
- **Live Cursor Tracking:** View other participants' cursor positions in real time.
- **Customizable Drawing Tools:** Select drawing colors and adjust stroke width.
- **Shared Canvas:** Synchronize canvas updates across all connected users.
- **Clear Canvas:** Clear the whiteboard for everyone in the room.
- **MongoDB Persistence:** Store room information and drawing data.
- **Active User Display:** View the users currently participating in a room.
- **Responsive UI:** Access the whiteboard across different screen sizes.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| Node.js | Backend runtime environment |
| Express.js | REST API and server |
| MongoDB | Database for room and drawing data |
| Mongoose | MongoDB object modeling |
| Socket.IO | Real-time communication |
| HTML5 Canvas | Drawing and rendering |
| CSS | Styling and responsive design |
| npm | Package management |

## 📂 Project Structure

```text
Collaborative-Whiteboard/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── RoomJoin.js
│   │   │   ├── Whiteboard.js
│   │   │   ├── DrawingCanvas.js
│   │   │   ├── Toolbar.js
│   │   │   └── UserCursors.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── ...
│   └── package.json
├── server/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── server.js
│   └── package.json
├── README.md
└── package.json
```

*Note: The component names and folders above represent the documented architecture. Adjust the structure to match your actual repository.*

## ⚙️ Prerequisites

Before running the application, ensure you have installed:

- [Node.js and npm](https://nodejs.org/)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) or a MongoDB Atlas database
- [Git](https://git-scm.com/)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Collaborative-Whiteboard
```

Replace the placeholder with your actual GitHub repository URL.

### 2. Configure the Backend

Navigate to the server directory:

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:3000
```

Replace `your_mongodb_connection_string` with your local MongoDB URI or MongoDB Atlas connection string.

**Example local MongoDB URI:**

```env
MONGO_URI=mongodb://127.0.0.1:27017/collaborative_whiteboard
```

Start the backend:

```bash
npm start
```

Make sure the start script is configured in `server/package.json`. If it is not, use the appropriate command for your project, such as:

```bash
node server.js
```

### 3. Configure the Frontend

Open a new terminal and navigate to the client directory:

```bash
cd client
npm install
npm start
```

The React application typically runs at:

```text
http://localhost:3000
```

Ensure the frontend Socket.IO client and API requests point to the correct backend URL.

### 4. Run the Complete Application

1. Start MongoDB if you are using a local database.
2. Start the backend server.
3. Start the React frontend.
4. Open the application in your browser.
5. Create a room or enter an existing room code.
6. Open the same room in another browser or device to test real-time collaboration.

## 🔌 API Documentation

### REST API Endpoints

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/rooms/join` | Create or join a room | `{ "roomId": "ROOM123" }` |
| `GET` | `/api/rooms/:roomId` | Retrieve room information | Not required |

### Join or Create a Room

**Endpoint:**

```http
POST /api/rooms/join
Content-Type: application/json
```

**Request body:**

```json
{
  "roomId": "ROOM123"
}
```

**Expected behavior:**

- Create the room if it does not exist.
- Join the room if it already exists.
- Return the appropriate room information.

*The exact response format depends on your backend implementation.*

### Get Room Information

**Endpoint:**

```http
GET /api/rooms/ROOM123
```

**Purpose:** Retrieve room details and, if supported by the implementation, its saved drawing data.

## 🔄 Socket.IO Events

Socket.IO enables low-latency communication between users in the same room.

| Event | Payload | Description |
|---|---|---|
| `join-room` | `{ roomId, socketId }` | Join a collaborative room |
| `leave-room` | `{ roomId }` | Leave a room |
| `cursor-move` | `{ x, y, userId }` | Broadcast cursor position |
| `draw-start` | `{ x, y, color, width }` | Start a drawing stroke |
| `draw-move` | `{ x, y }` | Continue the current stroke |
| `draw-end` | `null` | Finish the current stroke |
| `clear-canvas` | `null` | Clear the shared canvas |

### Event Workflow

1. A user joins a room using a room code.
2. The server associates the user's socket connection with that room.
3. Cursor movements and drawing events are broadcast to other users in the same room.
4. Users render incoming drawing updates on their local canvases.
5. A clear-canvas event synchronizes the clearing action across connected participants.

**Implementation note:** Ensure your actual Socket.IO event handlers use consistent event names and payload structures on both the client and server. Broadcast drawing events to other room members as appropriate, while handling the sender's local drawing separately.

## 🗄️ Database Schema

MongoDB stores room information and drawing history.

### Room Schema

```javascript
{
  roomId: String,
  createdAt: Date,
  lastActivity: Date,
  drawingData: [DrawingCommand]
}
```

### Drawing Command Schema

```javascript
{
  type: "stroke" | "clear",
  data: {
    path: [
      {
        x: Number,
        y: Number
      }
    ],
    color: String,
    width: Number
  },
  timestamp: Date
}
```

The schema above illustrates the intended data structure. The exact fields and validation rules depend on your Mongoose models.

## 🏗️ Architecture Overview

### Frontend

- **RoomJoin.js:** Handles room-code input and joining or creating rooms.
- **Whiteboard.js:** Manages the primary whiteboard interface and collaboration state.
- **DrawingCanvas.js:** Implements HTML5 Canvas drawing and stroke rendering.
- **Toolbar.js:** Provides drawing controls, color selection, stroke-width adjustment, and canvas clearing.
- **UserCursors.js:** Displays cursor positions for other connected users.

### Backend

- **Express.js:** Provides REST API endpoints for room operations.
- **Socket.IO:** Handles real-time drawing, cursor tracking, and room communication.
- **MongoDB:** Persists room details and drawing history.
- **Mongoose:** Defines database models and manages MongoDB interactions.

## 🔐 Environment Variables

Keep sensitive configuration values in environment variables instead of hardcoding them in source files.

| Variable | Description | Example |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/collaborative_whiteboard` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:3000` |

Do not commit your `.env` file or database credentials to GitHub. Add `.env` to your `.gitignore` file.

## ☁️ Deployment Guide

### Recommended Platforms

| Component | Platform |
|---|---|
| Frontend | [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/) |
| Backend | [Render](https://render.com/) or another Node.js hosting provider supporting WebSockets |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) |

### Deployment Steps

1. Push the project to GitHub.
2. Create a MongoDB Atlas cluster and configure database access.
3. Deploy the backend to your selected hosting platform.
4. Add the required environment variables, including `MONGO_URI`, `PORT` if needed, and `CLIENT_URL`.
5. Configure the production frontend URL in the backend's CORS settings.
6. Deploy the React frontend and configure its API and Socket.IO server URLs.
7. Verify that WebSocket connections, room joining, drawing synchronization, and database persistence work in production.

**Production considerations:**

- Use HTTPS and secure WebSocket connections (`wss://`).
- Configure CORS for trusted frontend origins.
- Ensure your hosting provider supports persistent Socket.IO connections.
- For multiple backend instances, configure a compatible Socket.IO adapter, such as the Redis adapter, when needed.

## ⚡ Performance and Best Practices

- Throttle or batch cursor updates to avoid excessive network traffic.
- Keep drawing events lightweight and transmit only the required coordinates and drawing properties.
- Batch or debounce database writes for completed strokes instead of writing every mouse movement.
- Assign stable user identifiers and distinguish cursors with consistent colors.
- Validate incoming room identifiers and socket event payloads.
- Clean up inactive rooms according to your application's retention policy.
- Handle canvas resizing and coordinate scaling carefully.
- Test reconnecting users and synchronize saved drawing history when they rejoin.
- Avoid trusting client-supplied socket IDs as proof of user identity.

## 🧪 Testing Checklist

- [ ] Create a new room.
- [ ] Join an existing room using its code.
- [ ] Draw simultaneously from multiple browser sessions.
- [ ] Verify real-time cursor synchronization.
- [ ] Test color selection and stroke-width adjustment.
- [ ] Clear the canvas and verify that all participants see the change.
- [ ] Refresh a browser and test drawing-history persistence.
- [ ] Verify room behavior when users disconnect or reconnect.
- [ ] Test the responsive interface on desktop and mobile.
- [ ] Test the deployed application with production WebSocket settings.

## 🔮 Future Enhancements

- User authentication and personalized profiles.
- Undo and redo functionality.
- Text, shapes, and image-upload tools.
- Export the whiteboard as PNG or PDF.
- Invite links and room access controls.
- Drawing history playback.
- User presence indicators and collaborative notifications.
- Improved synchronization for large whiteboards.

## 👨‍💻 Author

**Nikhil Jadhav**

- **LinkedIn:** [Connect with Nikhil Jadhav](https://www.linkedin.com/in/nikhil-jadhav-213275240/)
- **Portfolio:** [Visit Portfolio Website](https://nikhiljadhav0.github.io/NikhilJadhav0.github.io-portfolio/#contact)

## 📄 License

Free To Use
---

⭐ If you find this project interesting, consider giving the repository a star!
