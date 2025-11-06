# SlotSwapper: A Peer-to-Peer Time-Slot Scheduling App

**SlotSwapper** is a full-stack MERN application built as a technical challenge for the **ServiceHive Full Stack Intern** position. It enables users to manage calendars, mark events as “swappable,” and exchange time slots with others through a peer-to-peer system.

---

## 🚀 Core Features

- **Secure Authentication:**  
  Users can sign up and log in using a JWT-based system with both `accessToken` and `httpOnly refreshToken` for persistent sessions.

- **Full Calendar Management (CRUD):**  
  Logged-in users can view, create, edit (title/time), and delete their calendar events.

- **Swappable Status:**  
  Any “Busy” event can be marked as “Swappable,” making it visible to other users on the marketplace.

- **Swap Marketplace:**  
  A public view where users can browse all available swappable slots from others.

- **Core Swap Logic:**  
  - Users can request a swap by offering one of their own swappable slots.  
  - Slots involved in a request are temporarily locked (`SWAP_PENDING`) to prevent duplicate offers.

- **Request Management:**  
  - **Incoming Requests:** Accept or reject swap offers from others.  
  - **Outgoing Requests:** Track the status of swaps initiated by the user.

- **Atomic Swaps:**  
  When accepted, the backend atomically exchanges the event `owner` IDs and resets both statuses to `BUSY`.

---

## 🛠️ Tech Stack

| Category | Technology |
|-----------|-------------|
| **Backend** | Node.js, Express.js, Mongoose |
| **Frontend** | React.js, React Router v6 |
| **Database** | MongoDB (Atlas) |
| **Authentication** | JWT, bcryptjs |
| **UI/UX** | Material-UI (MUI), MUI-X Date Pickers |
| **API Client** | Axios (with interceptors) |
| **State Management** | React Context API (`AuthContext`) |
| **Utilities** | react-hot-toast, dayjs |

---

## 📐 Design Choices

- **Professional Backend Architecture:**  
  Organized by concern — `models`, `controllers`, `routes`, `utils`, `middleware`.  
  Includes custom `ApiError`, `ApiResponse`, and `asyncHandler` for clean and uniform handling.

- **Robust Auth Strategy:**  
  Two-token flow using short-lived `accessToken` (localStorage) and long-lived `refreshToken` (secure cookie).  
  The Axios interceptor auto-refreshes tokens or logs out on expiry.

- **Material-UI Integration:**  
  Built with **MUI** for fast, consistent, responsive design and advanced components like `DateTimePicker`, Modals, and Cards.

- **Global Auth State:**  
  Managed using `AuthContext` to maintain login sessions smoothly even after page refresh.

- **Centralized API Client:**  
  All API calls go through a single Axios instance that automatically attaches the token to each request.

---

## ⚙️ Local Setup & Installation

### Prerequisites

- Node.js (v18+)
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register))

---

### 1️. Backend Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/SlotSwapper.git
cd SlotSwapper/backend

# Install dependencies
npm install

# Create .env file
PORT=5001
DATABASE_URL="your_mongodb_connection_string"
JWT_SECRET="your_super_strong_jwt_secret_key"
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
CORS_ORIGIN=http://localhost:3000

# Start server
npm run dev
```
### 2. Frontend Setup
```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Create .env file
REACT_APP_API_URL=http://localhost:5001/api

# Run React app
npm run dev
```
## 📋 API Endpoints
This is a list of the main API endpoints as required. All routes are prefixed with `/api`.

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| **Auth** | | | |
| `POST` | `/users/register` | Create a new user account. | No |
| `POST` | `/users/login` | Log in a user and receive tokens. | No |
| `POST` | `/users/logout` | Log out a user and clear refresh token. | Yes |
| **Events (Slots)** | | | |
| `POST` | `/events` | Create a new event for the user. | Yes |
| `GET` | `/events` | Get all events for the logged-in user. | Yes |
| `PATCH` | `/events/:eventId/status` | Update an event's status (e.g., to `SWAPPABLE`). | Yes |
| `PUT` | `/events/:eventId` | Update an event's details (title, time). | Yes |
| `DELETE` | `/events/:eventId` | Delete an event. | Yes |
| **Swap Logic** | | | |
| `GET` | `/swappable-slots` | Get all slots from *other* users that are swappable. | Yes |
| `POST` | `/swap-request` | Create a new swap request. | Yes |
| `POST` | `/swap-response/:reqId` | Respond (Accept/Reject) to an incoming request. | Yes |
| `GET` | `/swap-requests/incoming` | Get all pending requests received by the user. | Yes |
| `GET` | `/swap-requests/outgoing` | Get all requests sent by the user (and their status). | Yes |
