# Junction Two Travel Management System

A comprehensive travel management system built with React frontend and Python FastAPI backend.

## Project Overview

Junction Two is a travel management system that allows users to:

- Search for and book flights, hotels, car rentals, and train tickets
- Manage travel itineraries and reservations
- Create and manage trips with multiple travelers
- Apply travel policies and approvals
- Manage organizations, users, and roles
- Process payments for bookings

## Technology Stack

### Frontend

- React.js
- Redux for state management
- React Router for navigation
- Styled Components with Tailwind CSS for styling
- Axios for API requests

### Backend

- Python with FastAPI
- PostgreSQL for database
- Redis for caching
- Celery for asynchronous task processing
- JWT for authentication
- SQLAlchemy for ORM

## Project Structure

```
Junction Two/
├── frontend/          # React frontend
├── backend/           # FastAPI backend
├── docker/            # Docker configuration
└── docs/              # Documentation
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local frontend development)
- Python 3.10+ (for local backend development)

### Running with Docker

1. Clone the repository:

```bash
git clone https://github.com/yourusername/Junction Two.git
cd Junction Two
```

2. Start the application with Docker Compose:

```bash
cd docker
docker-compose up -d
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Local Development

#### Frontend

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

#### Backend

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Start the development server:

```bash
uvicorn main:app --reload
```

## API Documentation

The API documentation is available at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## License

This project is licensed under the MIT License - see the LICENSE file for details.
