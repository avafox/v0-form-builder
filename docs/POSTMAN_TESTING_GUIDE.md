# Postman Testing Guide

Complete guide for testing the GPE Communications Tool API using Postman.

---

## Setup

### 1. Import Collection and Environment

**Import Collection:**
\`\`\`
1. Open Postman
2. Click "Import" button
3. Select file: postman/GPE-Communications-API.postman_collection.json
4. Click "Import"
\`\`\`

**Import Environment:**
\`\`\`
1. Click "Import" button
2. Select file: postman/GPE-Communications-API.postman_environment.json
3. Click "Import"
4. Select the environment from dropdown (top right)
\`\`\`

### 2. Configure Environment Variables

Click the eye icon (top right) → Edit environment:

**Required Variables:**
- `base_url`: `http://localhost:3000` (or your Amplify URL)
- `user_email`: Your test user email
- `client_id`: Your Azure AD Application (Client) ID
- `client_secret`: Your Azure AD Client Secret
- `tenant_id`: Your Azure AD Tenant ID

**Optional Variables:**
- `access_token`: Will be populated after authentication

---

## Testing Access Control

### Test 1: Check Access with Delegated Token

**Purpose:** Verify user can check their own group memberships

**Steps:**
1. Get an access token (see Authentication section)
2. Open request: "Check Access - With Token (Delegated)"
3. Update `user_email` in body
4. Add `access_token` in body
5. Click "Send"

**Expected Response (Authorized User):**
\`\`\`json
{
  "hasAccess": true,
  "groups": [
    "a50fe9e4-09e6-48d0-95ae-2352eff997ba"
  ],
  "cached": false
}
\`\`\`

**Expected Response (Unauthorized User):**
\`\`\`json
{
  "hasAccess": false,
  "groups": [
    "other-group-id-1",
    "other-group-id-2"
  ],
  "cached": false
}
\`\`\`

---

### Test 2: Check Access without Token

**Purpose:** Verify fallback to application credentials

**Steps:**
1. Open request: "Check Access - Without Token (Application)"
2. Update `user_email` in body
3. Remove `accessToken` field
4. Click "Send"

**Expected Response:**
\`\`\`json
{
  "hasAccess": true,
  "groups": ["a50fe9e4-09e6-48d0-95ae-2352eff997ba"],
  "cached": false
}
\`\`\`

**Note:** This requires application permissions (Mail.Send, etc.)

---

### Test 3: Verify Caching

**Purpose:** Confirm group memberships are cached

**Steps:**
1. Run "Check Access - With Token" (first time)
   - Response: `"cached": false`
2. Run same request again within 15 minutes
   - Response: `"cached": true`
3. Wait 15+ minutes and run again
   - Response: `"cached": false` (cache expired)

---

### Test 4: Error Handling

**Purpose:** Verify proper error responses

**Test Missing Email:**
\`\`\`
Request: "Check Access - Missing Email"
Expected: 400 Bad Request
Response: {"hasAccess": false, "error": "Email required"}
\`\`\`

**Test Invalid Token:**
\`\`\`
Request: "Check Access - With Token"
Body: Invalid access token
Expected: 500 Internal Server Error
Response: {"hasAccess": false, "error": "Failed to check access"}
\`\`\`

---

## Testing Email Functionality

### Test 5: Send Basic Email

**Purpose:** Verify email sending from shared mailbox

**Steps:**
1. Open request: "Send Email - Basic"
2. Update `fromEmail` to your shared mailbox
3. Update `to` array with test recipient
4. Click "Send"

**Expected Response:**
\`\`\`json
{
  "success": true
}
\`\`\`

**Verify:**
- Check recipient's inbox for email
- Check shared mailbox "Sent Items" folder

---

### Test 6: Send Email with CC/BCC

**Purpose:** Verify CC and BCC functionality

**Steps:**
1. Open request: "Send Email - With CC and BCC"
2. Update email addresses
3. Click "Send"

**Expected Response:**
\`\`\`json
{
  "success": true
}
\`\`\`

**Verify:**
- TO recipient sees email
- CC recipient sees email and is visible in CC field
- BCC recipient sees email but is NOT visible to others

---

## Authentication

### Getting an Access Token

**Method 1: Using Postman Request**

\`\`\`
1. Open request: "Get Access Token (Manual)"
2. Ensure environment variables are set:
   - client_id
   - client_secret
   - tenant_id
3. Click "Send"
4. Copy the "access_token" from response
5. Set it in environment variable "access_token"
\`\`\`

**Method 2: Using Browser (Delegated)**

\`\`\`
1. Go to: https://your-app.amplifyapp.com
2. Sign in with Microsoft
3. Open browser DevTools (F12)
4. Go to: Application → Cookies
5. Find session cookie
6. Copy the value
7. Use in Postman requests
\`\`\`

**Method 3: Using Azure CLI**

\`\`\`bash
# Get token for Microsoft Graph
az account get-access-token --resource https://graph.microsoft.com

# Copy the "accessToken" value
# Set in Postman environment variable
\`\`\`

---

## Common Test Scenarios

### Scenario 1: New User Access Check

**Goal:** Verify new user can/cannot access the app

**Steps:**
1. Add user to GPE-Communications-Team group in Azure AD
2. Wait 5-10 minutes for group membership to sync
3. Run "Check Access - With Token" with user's email
4. Verify `hasAccess: true`

**Troubleshooting:**
- If `hasAccess: false`, check group membership in Azure AD
- Clear cache by waiting 15 minutes or manually clearing Redis
- Verify group ID matches in `lib/access-control.ts`

---

### Scenario 2: Shared Mailbox Permission Test

**Goal:** Verify app can send from shared mailbox

**Steps:**
1. Ensure "Send As" permission granted (see docs)
2. Run "Send Email - Basic"
3. Check for errors in response

**Common Errors:**

**"Mailbox not found"**
- Cause: Shared mailbox doesn't exist or wrong email
- Fix: Verify mailbox exists in Microsoft 365 Admin Center

**"Insufficient privileges"**
- Cause: Missing "Send As" permission
- Fix: Grant permission using PowerShell (see AZURE_AD_REQUIREMENTS.md)

**"Access denied"**
- Cause: Missing Mail.Send permission or admin consent
- Fix: Grant admin consent in Azure AD

---

### Scenario 3: Cache Invalidation Test

**Goal:** Verify cache expires correctly

**Steps:**
1. Run "Check Access - With Token"
2. Note the groups returned
3. Remove user from group in Azure AD
4. Run request again immediately
   - Expected: Still shows old groups (cached)
5. Wait 15 minutes
6. Run request again
   - Expected: Shows updated groups (cache expired)

---

## Automated Testing

### Using Newman (Postman CLI)

**Install Newman:**
\`\`\`bash
npm install -g newman
\`\`\`

**Run Collection:**
\`\`\`bash
newman run postman/GPE-Communications-API.postman_collection.json \
  -e postman/GPE-Communications-API.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export results.json
\`\`\`

**Run Specific Folder:**
\`\`\`bash
newman run postman/GPE-Communications-API.postman_collection.json \
  -e postman/GPE-Communications-API.postman_environment.json \
  --folder "Access Control"
\`\`\`

---

## CI/CD Integration

### GitHub Actions Example

\`\`\`yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Newman
        run: npm install -g newman
      
      - name: Run API Tests
        env:
          CLIENT_ID: ${{ secrets.MICROSOFT_CLIENT_ID }}
          CLIENT_SECRET: ${{ secrets.MICROSOFT_CLIENT_SECRET }}
          TENANT_ID: ${{ secrets.MICROSOFT_TENANT_ID }}
        run: |
          newman run postman/GPE-Communications-API.postman_collection.json \
            -e postman/GPE-Communications-API.postman_environment.json \
            --env-var "client_id=$CLIENT_ID" \
            --env-var "client_secret=$CLIENT_SECRET" \
            --env-var "tenant_id=$TENANT_ID"
\`\`\`

---

## Troubleshooting

### Issue: "Could not get any response"

**Cause:** App not running or wrong URL

**Fix:**
\`\`\`bash
# Verify app is running
curl http://localhost:3000/api/health

# Check base_url in environment matches your app
\`\`\`

---

### Issue: "401 Unauthorized"

**Cause:** Missing or invalid access token

**Fix:**
1. Get fresh access token
2. Verify token hasn't expired (tokens expire after 1 hour)
3. Check token has correct scopes

---

### Issue: "403 Forbidden"

**Cause:** User doesn't have required permissions

**Fix:**
1. Verify user is in authorized group
2. Check group ID matches in code
3. Clear cache and try again

---

### Issue: "500 Internal Server Error"

**Cause:** Server-side error

**Fix:**
1. Check server logs in Amplify Console
2. Verify environment variables are set
3. Check Azure AD permissions are granted
4. Verify Redis (KV) is accessible

---

## Best Practices

1. **Use Environment Variables**
   - Never hardcode credentials in requests
   - Use separate environments for dev/test/prod

2. **Test in Order**
   - Start with health check
   - Then authentication
   - Then access control
   - Finally email sending

3. **Clear Cache Between Tests**
   - Wait 15 minutes or manually clear Redis
   - Ensures fresh data for each test

4. **Monitor Rate Limits**
   - Microsoft Graph has rate limits
   - Space out requests if testing repeatedly

5. **Use Test Mailboxes**
   - Don't send to real users during testing
   - Use dedicated test mailbox for recipients

---

## Quick Reference

### Useful curl Commands

**Check Access:**
\`\`\`bash
curl -X POST http://localhost:3000/api/check-access \
  -H "Content-Type: application/json" \
  -d '{"email":"user@company.com","accessToken":"YOUR_TOKEN"}'
\`\`\`

**Send Email:**
\`\`\`bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "fromEmail":"gpe-communications@company.com",
    "to":["test@company.com"],
    "subject":"Test",
    "htmlContent":"<h1>Test</h1>"
  }'
\`\`\`

**Health Check:**
\`\`\`bash
curl http://localhost:3000/api/health
\`\`\`

---

## Support

**Issues with Postman Collection:**
- Check collection version matches API version
- Re-import collection if requests fail
- Verify environment variables are set

**Issues with API:**
- Check application logs
- Verify Azure AD configuration
- Review environment variables
- Check Redis connectivity

---

**Last Updated:** [Current Date]  
**Collection Version:** 1.0  
**API Version:** 1.0
