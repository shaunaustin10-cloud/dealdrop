#!/bin/bash
echo "Starting Options & Sports Aggregator..."

# Start Backend
cd backend
npm run dev &
BACKEND_PID=$!
echo "Backend starting on port 3001 (PID: $BACKEND_PID)..."

# Start Frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend starting on port 3000 (PID: $FRONTEND_PID)..."

# Wait for both
wait $BACKEND_PID $FRONTEND_PID
