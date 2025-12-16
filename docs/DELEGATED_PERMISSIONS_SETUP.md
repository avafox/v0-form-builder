# Delegated Permissions Setup Guide

## Overview

This guide explains how to configure **delegated permissions** instead of high-privilege application permissions for group-based access control.

## Why Delegated Permissions?

| Aspect | Application Permissions | Delegated Permissions |
|--------|------------------------|----------------------|
| **Privilege Level** | ❌ High (Directory.Read.All) | ✅ Low (User.Read, GroupMember.Read.All) |
| **Scope** | All users in directory | Only signed-in user |
| **Security Risk** | High - compromised token = full directory access | Low - compromised token = one user |
| **Audit Trail** | Actions by application | Actions by specific user |
| **Admin Consent** | Always required | Often not required |

## Azure AD Configuration

### Step 1: Remove Old Application Permissions

```
1. Azure Portal → App Registrations → Your App
2. API Permissions
3. Remove these permissions:
   - Directory.Read.All (Application)
   - User.Read.All (Application)
   - GroupMember.Read.All (Application)
```

### Step 2: Add Delegated Permissions

```
1. API Permissions → Add a permission
2. Microsoft Graph → Delegated permissions
3. Add:
   - User.Read
   - GroupMember.Read.All
4. Grant admin consent (if required)
```

### Step 3: Configure Group IDs

Edit `lib/access-control.ts`:

```typescript
export const ALLOWED_GROUPS = [
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // Your actual group ID
]
```

**To find group IDs:**

```bash
# Azure Portal
Azure AD → Groups → [Your Group] → Copy Object ID

# PowerShell
Get-AzureADGroup -SearchString "GPE-Communications" | Select ObjectId

# Graph Explorer
GET https://graph.microsoft.com/v1.0/groups?$filter=startswith(displayName,'GPE')
```

## Implementation Details

### How It Works

1. User signs in with Microsoft OAuth
2. User's access token is stored in session
3. When checking access, we use **user's own token** to read their groups
4. Groups are cached in Redis for 15 minutes
5. Access granted if user is in any allowed group

### Code Flow

```typescript
// 1. User authenticates
const session = await getServerSession()

// 2. Get user's groups using their token
const groups = await getUserGroups(email, session.accessToken)

// 3. Check if user is in allowed groups
const hasAccess = checkUserAccess(groups)
```

## Testing

### Test Access Control

```bash
# Test with user email
curl -X POST http://localhost:3000/api/check-access \
  -H "Content-Type: application/json" \
  -d '{"email":"user@company.com"}'
```

### Expected Responses

**User in allowed group:**
```json
{
  "hasAccess": true,
  "groups": ["xxx-xxx-xxx"],
  "cached": false
}
```

**User not in allowed group:**
```json
{
  "hasAccess": false,
  "groups": ["yyy-yyy-yyy"],
  "cached": false
}
```

## Security Benefits

✅ **Least Privilege**: Users can only read their own data
✅ **Reduced Attack Surface**: No broad directory access
✅ **Better Audit Trail**: Actions tied to specific users
✅ **Compliance**: Easier to meet security requirements
✅ **Token Scope**: Compromised token only affects one user

## Troubleshooting

### "Failed to get user groups"

**Cause**: Missing permissions or invalid token

**Fix**:
1. Verify delegated permissions are granted
2. Check user has signed in recently
3. Verify token is being passed correctly

### "Access denied" for authorized users

**Cause**: Wrong group ID or cache issue

**Fix**:
1. Verify group ID in `lib/access-control.ts`
2. Check user is actually in the group (Azure Portal)
3. Clear cache: Wait 15 minutes or manually clear Redis

### No groups returned

**Cause**: User not in any groups or permission issue

**Fix**:
1. Verify user is in at least one group
2. Check `GroupMember.Read.All` permission is granted
3. Test with Graph Explorer to verify API access

## Migration from Application Permissions

If you're migrating from the old high-privilege approach:

1. ✅ Add delegated permissions (don't remove old ones yet)
2. ✅ Deploy code changes
3. ✅ Test with multiple users
4. ✅ Verify access control works
5. ✅ Remove old application permissions
6. ✅ Update documentation

## Environment Variables

Required variables remain the same:

```bash
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_TENANT_ID=your-tenant-id
MICROSOFT_CLIENT_SECRET=your-client-secret
KV_REST_API_URL=your-redis-url
KV_REST_API_TOKEN=your-redis-token
```

## Next Steps

1. Configure delegated permissions in Azure AD
2. Add your group IDs to `lib/access-control.ts`
3. Deploy to Amplify
4. Test with different user accounts
5. Remove old application permissions once verified
