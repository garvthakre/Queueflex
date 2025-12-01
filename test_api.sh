#!/bin/bash

echo "=========================================="
echo "TESTING MICROSERVICES - COMPLETE SUITE"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Generate unique emails to avoid conflicts
TIMESTAMP=$(date +%s)
USER_EMAIL="testuser${TIMESTAMP}@example.com"
ADMIN_EMAIL="admin${TIMESTAMP}@example.com"

# ==========================================
# PART 1: REGULAR USER TESTS
# ==========================================
echo -e "\n${YELLOW}=========================================="
echo "PART 1: REGULAR USER TESTS"
echo "==========================================${NC}"

# 1. Register a regular user
echo -e "\n${BLUE}1. Registering regular user...${NC}"
echo -e "${YELLOW}Email: ${USER_EMAIL}${NC}"
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "'"${USER_EMAIL}"'",
    "password": "password123",
    "is_admin": false
  }')
echo "$SIGNUP_RESPONSE"

if echo "$SIGNUP_RESPONSE" | grep -q "user_id"; then
  echo -e "${GREEN}✓ User registered successfully${NC}"
else
  echo -e "${RED}✗ Failed to register user${NC}"
  exit 1
fi

# 2. Login as regular user
echo -e "\n${BLUE}2. Logging in as regular user...${NC}"
echo -e "${YELLOW}Email: ${USER_EMAIL}${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"${USER_EMAIL}"'",
    "password": "password123"
  }')
echo "$LOGIN_RESPONSE"

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//' | sed 's/"$//')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Failed to get token${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Got token: ${TOKEN:0:50}...${NC}"

# 3. Add to queue (Item 1)
echo -e "\n${BLUE}3. Adding first item to queue...${NC}"
QUEUE_RESPONSE_1=$(curl -s -X POST http://localhost:4000/queue/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "purpose": "Consultation",
    "serviceType": "General"
  }')
echo "$QUEUE_RESPONSE_1"

QUEUE_ID_1=$(echo "$QUEUE_RESPONSE_1" | grep -o '"queue_id": "[^"]*' | sed 's/"queue_id": "//')

if [ -z "$QUEUE_ID_1" ]; then
  echo -e "${RED}✗ Failed to add to queue${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Successfully added to queue: $QUEUE_ID_1${NC}"

# 4. Add to queue (Item 2)
echo -e "\n${BLUE}4. Adding second item to queue...${NC}"
QUEUE_RESPONSE_2=$(curl -s -X POST http://localhost:4000/queue/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "purpose": "Follow-up",
    "serviceType": "Premium"
  }')
echo "$QUEUE_RESPONSE_2"

QUEUE_ID_2=$(echo "$QUEUE_RESPONSE_2" | grep -o '"queue_id": "[^"]*' | sed 's/"queue_id": "//')

if [ -z "$QUEUE_ID_2" ]; then
  echo -e "${RED}✗ Failed to add second item${NC}"
else
  echo -e "${GREEN}✓ Successfully added second item: $QUEUE_ID_2${NC}"
fi

# 5. Get all queue items (user's own)
echo -e "\n${BLUE}5. Getting all queue items...${NC}"
GET_QUEUE=$(curl -s -X GET http://localhost:4000/queue/get \
  -H "Authorization: Bearer $TOKEN")
echo "$GET_QUEUE"

if echo "$GET_QUEUE" | grep -q "$QUEUE_ID_1"; then
  echo -e "${GREEN}✓ Queue items retrieved successfully${NC}"
else
  echo -e "${RED}✗ Failed to retrieve queue items${NC}"
fi

# 6. Get specific queue item by ID
echo -e "\n${BLUE}6. Getting specific queue item by ID...${NC}"
GET_QUEUE_BY_ID=$(curl -s -X GET "http://localhost:4000/queue/get/$QUEUE_ID_1" \
  -H "Authorization: Bearer $TOKEN")
echo "$GET_QUEUE_BY_ID"

if echo "$GET_QUEUE_BY_ID" | grep -q "$QUEUE_ID_1"; then
  echo -e "${GREEN}✓ Specific queue item retrieved successfully${NC}"
else
  echo -e "${RED}✗ Failed to retrieve specific queue item${NC}"
fi

# 7. Update queue item
echo -e "\n${BLUE}7. Updating queue item...${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT "http://localhost:4000/queue/update/$QUEUE_ID_1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "purpose": "Emergency Consultation",
    "serviceType": "Premium"
  }')
echo "$UPDATE_RESPONSE"

if echo "$UPDATE_RESPONSE" | grep -q "John Doe Updated"; then
  echo -e "${GREEN}✓ Queue item updated successfully${NC}"
else
  echo -e "${RED}✗ Failed to update queue item${NC}"
fi

# 8. Try admin endpoint (should fail - not admin)
echo -e "\n${BLUE}8. Testing admin endpoint (should fail)...${NC}"
ADMIN_RESPONSE=$(curl -s -X GET http://localhost:5000/admin/data \
  -H "Authorization: Bearer $TOKEN")
echo "$ADMIN_RESPONSE"

if echo "$ADMIN_RESPONSE" | grep -q "Admin access required"; then
  echo -e "${GREEN}✓ Correctly blocked non-admin access${NC}"
else
  echo -e "${RED}✗ Admin check not working${NC}"
fi

# 9. Try accessing admin queue endpoint (should fail)
echo -e "\n${BLUE}9. Testing admin queue endpoint (should fail)...${NC}"
ADMIN_QUEUE=$(curl -s -X GET http://localhost:5000/admin/queue/all \
  -H "Authorization: Bearer $TOKEN")
echo "$ADMIN_QUEUE"

if echo "$ADMIN_QUEUE" | grep -q "Admin access required"; then
  echo -e "${GREEN}✓ Correctly blocked non-admin queue access${NC}"
else
  echo -e "${RED}✗ Admin queue check not working${NC}"
fi

# ==========================================
# PART 2: ADMIN USER TESTS
# ==========================================
echo -e "\n${YELLOW}=========================================="
echo "PART 2: ADMIN USER TESTS"
echo "==========================================${NC}"

# 10. Register an admin user
echo -e "\n${BLUE}10. Registering admin user...${NC}"
echo -e "${YELLOW}Email: ${ADMIN_EMAIL}${NC}"
ADMIN_SIGNUP=$(curl -s -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "'"${ADMIN_EMAIL}"'",
    "password": "admin123",
    "is_admin": true
  }')
echo "$ADMIN_SIGNUP"

if echo "$ADMIN_SIGNUP" | grep -q '"is_admin":true'; then
  echo -e "${GREEN}✓ Admin user registered successfully${NC}"
else
  echo -e "${RED}✗ Failed to register admin user${NC}"
fi

# 11. Login as admin
echo -e "\n${BLUE}11. Logging in as admin...${NC}"
echo -e "${YELLOW}Email: ${ADMIN_EMAIL}${NC}"
ADMIN_LOGIN=$(curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"${ADMIN_EMAIL}"'",
    "password": "admin123"
  }')
echo "$ADMIN_LOGIN"

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"token":"[^"]*' | sed 's/"token":"//' | sed 's/"$//')

if [ -z "$ADMIN_TOKEN" ]; then
  echo -e "${RED}✗ Failed to get admin token${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Got admin token: ${ADMIN_TOKEN:0:50}...${NC}"

# 12. Access admin data endpoint
echo -e "\n${BLUE}12. Accessing admin data endpoint...${NC}"
ADMIN_DATA=$(curl -s -X GET http://localhost:5000/admin/data \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$ADMIN_DATA"

if echo "$ADMIN_DATA" | grep -q "task"; then
  echo -e "${GREEN}✓ Admin data accessed successfully${NC}"
else
  echo -e "${RED}✗ Failed to access admin data${NC}"
fi

# 13. Get all queue items (admin view)
echo -e "\n${BLUE}13. Getting all queue items (admin view)...${NC}"
ADMIN_ALL_QUEUE=$(curl -s -X GET http://localhost:5000/admin/queue/all \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$ADMIN_ALL_QUEUE"

if echo "$ADMIN_ALL_QUEUE" | grep -q "$QUEUE_ID_1"; then
  echo -e "${GREEN}✓ Admin can see all queue items${NC}"
else
  echo -e "${RED}✗ Failed to get all queue items${NC}"
fi

# 14. Get specific queue item by ID (admin)
echo -e "\n${BLUE}14. Getting specific queue item by ID (admin)...${NC}"
ADMIN_QUEUE_BY_ID=$(curl -s -X GET "http://localhost:5000/admin/queue/$QUEUE_ID_1" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$ADMIN_QUEUE_BY_ID"

if echo "$ADMIN_QUEUE_BY_ID" | grep -q "$QUEUE_ID_1"; then
  echo -e "${GREEN}✓ Admin retrieved specific queue item${NC}"
else
  echo -e "${RED}✗ Failed to retrieve specific item${NC}"
fi

# 15. Update queue item as admin (including status)
echo -e "\n${BLUE}15. Updating queue item as admin (including status)...${NC}"
ADMIN_UPDATE=$(curl -s -X PUT "http://localhost:5000/admin/queue/$QUEUE_ID_1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe - Admin Updated",
    "status": "completed"
  }')
echo "$ADMIN_UPDATE"

if echo "$ADMIN_UPDATE" | grep -q "Admin Updated"; then
  echo -e "${GREEN}✓ Admin updated queue item with status${NC}"
else
  echo -e "${RED}✗ Failed to update as admin${NC}"
fi

# 16. Get queue statistics
echo -e "\n${BLUE}16. Getting queue statistics...${NC}"
QUEUE_STATS=$(curl -s -X GET http://localhost:5000/admin/queue/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$QUEUE_STATS"

if echo "$QUEUE_STATS" | grep -q "total_items"; then
  echo -e "${GREEN}✓ Queue statistics retrieved successfully${NC}"
else
  echo -e "${RED}✗ Failed to get queue statistics${NC}"
fi

# 17. Delete queue item as admin
echo -e "\n${BLUE}17. Deleting queue item as admin...${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE "http://localhost:5000/admin/queue/$QUEUE_ID_2" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$DELETE_RESPONSE"

if echo "$DELETE_RESPONSE" | grep -q "deleted successfully"; then
  echo -e "${GREEN}✓ Admin deleted queue item successfully${NC}"
else
  echo -e "${RED}✗ Failed to delete queue item${NC}"
fi

# 18. Verify deletion
echo -e "\n${BLUE}18. Verifying deletion...${NC}"
VERIFY_DELETE=$(curl -s -X GET http://localhost:5000/admin/queue/all \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$VERIFY_DELETE"

if echo "$VERIFY_DELETE" | grep -q "$QUEUE_ID_2"; then
  echo -e "${RED}✗ Item not deleted properly${NC}"
else
  echo -e "${GREEN}✓ Item deleted and verified${NC}"
fi

# 19. Regular user deletes their own item
echo -e "\n${BLUE}19. Regular user deleting their own item...${NC}"
USER_DELETE=$(curl -s -X DELETE "http://localhost:4000/queue/delete/$QUEUE_ID_1" \
  -H "Authorization: Bearer $TOKEN")
echo "$USER_DELETE"

if echo "$USER_DELETE" | grep -q "deleted successfully"; then
  echo -e "${GREEN}✓ User deleted their own item successfully${NC}"
else
  echo -e "${RED}✗ Failed to delete own item${NC}"
fi

# ==========================================
# PART 3: ERROR HANDLING TESTS
# ==========================================
echo -e "\n${YELLOW}=========================================="
echo "PART 3: ERROR HANDLING TESTS"
echo "==========================================${NC}"

# 20. Try accessing without token
echo -e "\n${BLUE}20. Testing access without token...${NC}"
NO_TOKEN=$(curl -s -X GET http://localhost:4000/queue/get)
echo "$NO_TOKEN"

if echo "$NO_TOKEN" | grep -q "Token required"; then
  echo -e "${GREEN}✓ Correctly requires token${NC}"
else
  echo -e "${RED}✗ Token requirement not working${NC}"
fi

# 21. Try accessing with invalid token
echo -e "\n${BLUE}21. Testing access with invalid token...${NC}"
INVALID_TOKEN=$(curl -s -X GET http://localhost:4000/queue/get \
  -H "Authorization: Bearer invalid_token_here")
echo "$INVALID_TOKEN"

if echo "$INVALID_TOKEN" | grep -q "Invalid token"; then
  echo -e "${GREEN}✓ Correctly rejects invalid token${NC}"
else
  echo -e "${RED}✗ Invalid token check not working${NC}"
fi

# 22. Try accessing non-existent queue item
echo -e "\n${BLUE}22. Testing access to non-existent queue item...${NC}"
NOT_FOUND=$(curl -s -X GET "http://localhost:4000/queue/get/non-existent-id-12345" \
  -H "Authorization: Bearer $TOKEN")
echo "$NOT_FOUND"

if echo "$NOT_FOUND" | grep -q "not found"; then
  echo -e "${GREEN}✓ Correctly handles non-existent items${NC}"
else
  echo -e "${RED}✗ Not found handling not working${NC}"
fi

# 23. Try adding queue item without required field
echo -e "\n${BLUE}23. Testing queue addition without required field...${NC}"
NO_NAME=$(curl -s -X POST http://localhost:4000/queue/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "purpose": "Test"
  }')
echo "$NO_NAME"

if echo "$NO_NAME" | grep -q "required"; then
  echo -e "${GREEN}✓ Correctly validates required fields${NC}"
else
  echo -e "${RED}✗ Field validation not working${NC}"
fi

# ==========================================
# SUMMARY
# ==========================================
echo -e "\n${GREEN}=========================================="
echo "ALL TESTS COMPLETE"
echo "==========================================${NC}"

echo -e "\n${YELLOW}Test Coverage:${NC}"
echo "✓ User registration (regular & admin)"
echo "✓ User login"
echo "✓ Queue CRUD operations"
echo "✓ Admin endpoints"
echo "✓ Queue statistics"
echo "✓ Permission checks"
echo "✓ Error handling"
echo "✓ Token validation"

echo -e "\n${BLUE}Note: Check the output above for any ${RED}✗ Failed${BLUE} tests${NC}"
echo -e "\n${YELLOW}Users created in this test:${NC}"
echo "Regular User: ${USER_EMAIL}"
echo "Admin User: ${ADMIN_EMAIL}"