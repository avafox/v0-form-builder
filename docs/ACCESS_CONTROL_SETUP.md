## Azure AD Configuration

### Required Permissions (Delegated - Least Privilege)

**Old Approach (Too Privileged):**
- ❌ Directory.Read.All (Application)
- ❌ User.Read.All (Application)
- ❌ GroupMember.Read.All (Application)

**New Approach (Secure):**
- ✅ User.Read (Delegated)
- ✅ GroupMember.Read.All (Delegated)

### Setup Steps

1. **Azure Portal → App Registrations → Your App**

2. **API Permissions → Add a permission**

3. **Microsoft Graph → Delegated permissions**

4. **Add these permissions:**
   - `User.Read` - Read signed-in user's profile
   - `GroupMember.Read.All` - Read signed-in user's group memberships

5. **Grant admin consent** (if required by your organization)

6. **Remove old application permissions:**
   - Remove `Directory.Read.All`
   - Remove `User.Read.All`
   - Remove `GroupMember.Read.All` (application)

### Key Differences

| Aspect | Application Permissions | Delegated Permissions |
|--------|------------------------|----------------------|
| **Scope** | All users in directory | Only signed-in user |
| **Privilege** | High (admin-level) | Low (user-level) |
| **Consent** | Admin consent required | User consent possible |
| **Security** | Broad access | Least privilege |
| **Use Case** | Background jobs | User-initiated actions |

### Why This Is More Secure

1. **Principle of Least Privilege**: Users can only read their own group memberships
2. **No Admin Secrets**: No need for client secret with broad permissions
3. **User Context**: Actions performed in user's security context
4. **Audit Trail**: Actions tied to specific user, not application
5. **Reduced Risk**: Compromised token only affects one user


## Testing

### Test Delegated Permissions

\`\`\`bash
# The access token is now the user's own token
# Test by signing in as different users

# User in allowed group
curl http://localhost:3000/api/check-access \
  -H "Cookie: next-auth.session-token=..."

# Expected: { "hasAccess": true, "groups": [...] }
\`\`\`

### Verify Token Scopes

\`\`\`typescript
// In your API route, log the token to verify scopes
const session = await getServerSession(authOptions)
console.log("[v0] Token scopes:", session.accessToken)
\`\`\`
