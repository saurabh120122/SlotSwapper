# SlotSwapper: A Peer-to-Peer Time-Slot Scheduling App

SlotSwapper is a full-stack MERN application built as a technical challenge for the ServiceHive Full Stack Intern position. [cite_start]The application allows users to manage their calendar and request "swaps" with other users for time slots they've marked as swappable [cite: 7-9].

## 🚀 Core Features

* [cite_start]**Secure Authentication:** Users can sign up for an account and log in[cite: 19]. [cite_start]The application uses a robust JWT (JSON Web Token) strategy, issuing both an `accessToken` and a secure `httpOnly` `refreshToken` for persistent and secure sessions[cite: 20].
* [cite_start]**Full Calendar Management (CRUD):** Logged-in users can view, create, **edit (title, time)**, and **delete** their personal calendar events[cite: 30, 55].
* [cite_start]**"Swappable" Status:** Users can mark any of their "Busy" events as "Swappable," making them available on the marketplace [cite: 8-9, 58].
* [cite_start]**Swap Marketplace:** A dedicated page where users can browse all available "Swappable" slots from other users [cite: 59-61].
* **Core Swap Logic:**
    * [cite_start]Users can request a swap by offering one of their swappable slots for a desired slot[cite: 62].
    * [cite_start]Slots involved in a request are "locked" with a `SWAP_PENDING` status to prevent other swap offers[cite: 44].
* [cite_start]**Request Management:** A "Notifications" page where users can see two lists[cite: 64]:
    * [cite_start]**Incoming Requests:** To `Accept` or `Reject` offers from others[cite: 65].
    * [cite_start]**Outgoing Requests:** To track the status of offers they have made[cite: 66].
* [cite_start]**Atomic Swaps:** When a swap is accepted, the backend atomically exchanges the `owner` ID of the two event slots and sets their status back to `BUSY` [cite: 49-50].

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Backend** | **Node.js**, **Express.js**, **Mongoose** |
| **Frontend** | **React.js**, **React Router v6** |
| **Database** | **MongoDB** (used with MongoDB Atlas) |
| **Authentication** | **JWT** (`jsonwebtoken`), **`bcryptjs`** (Password Hashing) |
| **UI/UX** | **Material-UI (MUI)**, **MUI-X Date Pickers** |
| **API Client** | **Axios** (with interceptors) |
| **State Management**| **React Context API** (`AuthContext`) |
| **Utilities** | **`react-hot-toast`** (Notifications), **`dayjs`** (Date handling) |

## 📐 Design Choices

This project was built with a professional, scalable structure in mind.

* **Professional Backend Structure:** The backend is organized by concern (`models`, `controllers`, `routes`, `utils`, `middleware`) to make it scalable and easy to maintain. Custom `ApiError`, `ApiResponse`, and `asyncHandler` utilities are used for clean, robust, and standardized code.
* **Robust Auth Strategy:** Instead of just one JWT, this app uses an `accessToken` (short-lived, stored in local storage) and a `refreshToken` (long-lived, stored in a secure `httpOnly` cookie) for a production-grade, secure auth flow. The `axios` client automatically handles 401 errors to log out users with expired tokens.
* **MUI Component Library:** The frontend uses **Material-UI (MUI)**. This choice was made to rapidly build a professional, consistent, and responsive UI. It provides a great user experience out-of-the-box, including:
    1.  A beautiful UI with pre-built components (Cards, Modals, AppBar).
    2.  Advanced `DateTimePicker` components.
    3.  Built-in button hover/focus effects.
* **Global Auth State:** User state is managed globally using a React `AuthContext`. This context handles the "loading" state to prevent users from being logged out on refresh, providing a smooth experience.
* **Centralized API Client:** All frontend API calls are handled through a single `axios` instance. An `interceptor` is used to automatically attach the `accessToken` to every request, keeping the component logic clean.

## Local Setup & Installation

Follow these instructions to run the project on your local machine.

### Prerequisites

* **Node.js** (v18 or later)
* **MongoDB:** A local MongoDB instance or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) connection string.

### 1. Backend Setup

```bash
# 1. Clone the repository
git clone [https://github.com/YOUR_USERNAME/SlotSwapper.git](https://github.com/YOUR_USERNAME/SlotSwapper.git)
cd SlotSwapper/backend

# 2. Install dependencies
npm install

# 3. Create your environment file
# Create a file named .env in the /backend folder
# and add the following:

PORT=5001
DATABASE_URL="your_mongodb_connection_string"
JWT_SECRET="your_super_strong_jwt_secret_key"
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
CORS_ORIGIN=http://localhost:3000

# 4. Run the server
npm run dev

### 1. Frontend Setup

# 1. Navigate to the frontend folder

cd SlotSwapper/frontend

# 2. Install dependencies
npm install

# 3. Create your environment file
# Create a file named .env in the /frontend folder
# and add the following:

REACT_APP_API_URL=http://localhost:5001/api

# 4. Run the React app

npm run dev

Method,Endpoint,Description,Protected
Auth,,,
POST,/users/register,Create a new user account.,No
POST,/users/login,Log in a user and receive tokens.,No
POST,/users/logout,Log out a user and clear refresh token.,Yes
Events (Slots),,,
POST,/events,Create a new event for the user.,Yes
GET,/events,Get all events for the logged-in user.,Yes
PATCH,/events/:eventId/status,"Update an event's status (e.g., to SWAPPABLE).",Yes
PUT,/events/:eventId,"Update an event's details (title, time).",Yes
DELETE,/events/:eventId,Delete an event.,Yes
Swap Logic,,,
GET,/swappable-slots,Get all slots from other users that are swappable.,Yes
POST,/swap-request,Create a new swap request.,Yes
POST,/swap-response/:reqId,Respond (Accept/Reject) to an incoming request.,Yes
GET,/swap-requests/incoming,Get all pending requests received by the user.,Yes
GET,/swap-requests/outgoing,Get all requests sent by the user (and their status).,Yes



