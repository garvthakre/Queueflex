#!/bin/bash

echo "=========================================="
echo "TESTING MICROSERVICES"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Register a user
echo -e "\n${BLUE}1. Registering user...${NC}"
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }')
echo "$SIGNUP_RESPONSE"

# 2. Login
echo -e "\n${BLUE}2. Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')
echo "$LOGIN_RESPONSE"

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Failed to get token${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Got token: ${TOKEN:0:50}...${NC}"

# 3. Add to queue
echo -e "\n${BLUE}3. Adding to queue...${NC}"
QUEUE_RESPONSE=$(curl -s -X POST http://localhost:4000/queue/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "purpose": "Consultation",
    "serviceType": "General"
  }')
echo "$QUEUE_RESPONSE"

if echo "$QUEUE_RESPONSE" | grep -q "queue_id"; then
  echo -e "${GREEN}✓ Successfully added to queue${NC}"
else
  echo -e "${RED}✗ Failed to add to queue${NC}"
fi

# 4. Get queue
echo -e "\n${BLUE}4. Getting queue...${NC}"
GET_QUEUE=$(curl -s -X GET http://localhost:4000/queue/get \
  -H "Authorization: Bearer $TOKEN")
echo "$GET_QUEUE"

# 5. Try admin endpoint (should fail - not admin)
echo -e "\n${BLUE}5. Testing admin endpoint (should fail)...${NC}"
ADMIN_RESPONSE=$(curl -s -X GET http://localhost:5000/admin/data \
  -H "Authorization: Bearer $TOKEN")
echo "$ADMIN_RESPONSE"

if echo "$ADMIN_RESPONSE" | grep -q "Admin access required"; then
  echo -e "${GREEN}✓ Correctly blocked non-admin access${NC}"
else
  echo -e "${RED}✗ Admin check not working${NC}"
fi

echo -e "\n${GREEN}=========================================="
echo "TESTS COMPLETE"
echo "==========================================${NC}"