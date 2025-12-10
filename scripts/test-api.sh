#!/bin/bash

# GPE Communications Tool - API Testing Script
# This script tests the main API endpoints

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
USER_EMAIL="${USER_EMAIL:-user@yourcompany.com}"
ACCESS_TOKEN="${ACCESS_TOKEN:-}"

echo "========================================="
echo "GPE Communications Tool - API Tests"
echo "========================================="
echo ""
echo "Base URL: $BASE_URL"
echo "User Email: $USER_EMAIL"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "Response: $RESPONSE_BODY"
else
    echo -e "${RED}✗ Health check failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $RESPONSE_BODY"
fi
echo ""

# Test 2: Check Access (without token)
echo -e "${YELLOW}Test 2: Check Access (Application Credentials)${NC}"
ACCESS_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/check-access" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_EMAIL\"}")
HTTP_CODE=$(echo "$ACCESS_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$ACCESS_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Access check passed${NC}"
    echo "Response: $RESPONSE_BODY"
    
    # Parse hasAccess from response
    HAS_ACCESS=$(echo "$RESPONSE_BODY" | grep -o '"hasAccess":[^,}]*' | cut -d':' -f2)
    if [ "$HAS_ACCESS" = "true" ]; then
        echo -e "${GREEN}✓ User has access${NC}"
    else
        echo -e "${YELLOW}⚠ User does not have access${NC}"
    fi
else
    echo -e "${RED}✗ Access check failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $RESPONSE_BODY"
fi
echo ""

# Test 3: Check Access (with token)
if [ -n "$ACCESS_TOKEN" ]; then
    echo -e "${YELLOW}Test 3: Check Access (Delegated Token)${NC}"
    ACCESS_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/check-access" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$USER_EMAIL\",\"accessToken\":\"$ACCESS_TOKEN\"}")
    HTTP_CODE=$(echo "$ACCESS_RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$ACCESS_RESPONSE" | head -n-1)

    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ Access check with token passed${NC}"
        echo "Response: $RESPONSE_BODY"
    else
        echo -e "${RED}✗ Access check with token failed (HTTP $HTTP_CODE)${NC}"
        echo "Response: $RESPONSE_BODY"
    fi
    echo ""
else
    echo -e "${YELLOW}Test 3: Skipped (no ACCESS_TOKEN provided)${NC}"
    echo ""
fi

# Test 4: Check Access (missing email - error case)
echo -e "${YELLOW}Test 4: Check Access (Error Handling)${NC}"
ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/check-access" \
  -H "Content-Type: application/json" \
  -d "{}")
HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$ERROR_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✓ Error handling works correctly${NC}"
    echo "Response: $RESPONSE_BODY"
else
    echo -e "${RED}✗ Expected 400 error, got HTTP $HTTP_CODE${NC}"
    echo "Response: $RESPONSE_BODY"
fi
echo ""

echo "========================================="
echo "Tests Complete"
echo "========================================="
echo ""
echo "To run with custom values:"
echo "  BASE_URL=https://your-app.amplifyapp.com \\"
echo "  USER_EMAIL=user@company.com \\"
echo "  ACCESS_TOKEN=your_token \\"
echo "  ./scripts/test-api.sh"
