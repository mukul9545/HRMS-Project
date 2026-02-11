# Employee Attendance & Management System

An integrated web application designed to manage employee records and track monthly attendance with real-time statistics.

## Project Overview

This project is a Full-Stack application that allows HR administrators to:

- **Manage Employees**: Create, search, and delete employee profiles.
- **Track Attendance**: Mark daily attendance (Present/Absent) for employees.
- **View Analytics**: Generate monthly attendance rates and statistics for individual employees through a dynamic dashboard.
- **Real-time Dashboard**: Overview of today’s attendance status, including total employees and attendance gaps.

## Tech Stack

### Frontend

- **React.js**: Library for building the user interface.
- **Vite**: Build tool for fast development and bundling.
- **React**: Icon library for UI components.
- **CSS3**: Custom styling for responsive design.

### Backend

- **FastAPI**: High-performance Python framework for building APIs.
- **MongoDB**: NoSQL database for flexible data storage.
- **Motor**: Asynchronous Python driver for MongoDB.
- **Uvicorn**: ASGI server implementation.

## Steps to Run the Project Locally

### 1. Prerequisites

- Node.js (v16+) and Python (v3.9+).
- MongoDB running locally (`mongodb://localhost:27017`).

### 2. Backend Setup

1. Navigate to the backend directory: `cd backend`
2. Create and activate a virtual environment:
   - `python -m venv venv`
   - Windows: `venv\Scripts\activate` | Mac/Linux: `source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Configure `.env`: Set `MONGODB_URL=mongodb://localhost:27017`
5. Start server: `python app.py`

### 3. Frontend Setup

1. Navigate to the frontend directory: `cd frontend`
2. Install packages: `npm install`
3. Configure `.env`: Set `VITE_API_URL=http://localhost:8000`
4. Start development server: `npm run dev`

## Assumptions & Limitations

- **Authentication**: The system currently operates without a login/password layer.
- **Concurrency**: Marking attendance for the same date overwrites the previous status.
- **Validation**: Basic email validation is implemented; department lists are currently open-ended.

## Developer Information

- **Name**: Mukul Yadav
- **Enrollment No**: A2305222616
