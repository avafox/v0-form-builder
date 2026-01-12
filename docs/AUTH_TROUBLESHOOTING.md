# Azure AD Authentication Troubleshooting

## Current Status

Authentication has been **temporarily disabled** to allow access to the application while troubleshooting Azure AD configuration issues.

## Issue

Users were receiving a "Configuration" error when attempting to sign in via Azure AD, despite all required environment variables being correctly configured in AWS Amplify:

- ✓ `MICROSOFT_CLIENT_ID`
- ✓ `MICROSOFT_CLIENT_SECRET`
- ✓ `MICROSOFT_TENANT_ID`
- ✓ `NEXTAUTH_SECRET`
- ✓ `NEXTAUTH_URL`

## Temporary Workaround

The following files have been modified to disable authentication:

1. **middleware.ts** - Authentication checks commented out
2. **app/communications/page.tsx** - Session validation commented out

This allows users to access the communications builder without authentication.

## Next Steps to Fix Azure AD

### Step 1: Verify Azure AD App Registration

Go to **Azure Portal → Azure Active Directory → App registrations** and verify:

1. **Redirect URIs** are correctly configured:
   ```
   https://main.d2baofxalff7ki.amplifyapp.com/api/auth/callback/azure-ad
   ```

2. **Supported account types**: 
   - Should be "Accounts in this organizational directory only (Sky UK)"

3. **API Permissions**:
   - Microsoft Graph: `User.Read` (Delegated) - **Admin consent granted**
   - Microsoft Graph: `email` (Delegated)
   - Microsoft Graph: `openid` (Delegated)
   - Microsoft Graph: `profile` (Delegated)

4. **Authentication → ID tokens**: Should be checked

### Step 2: Test Azure AD Configuration

Create a test endpoint to verify Azure AD connectivity:

```typescript
// app/api/test-auth/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    microsoft_client_id: process.env.MICROSOFT_CLIENT_ID ? "Set" : "Missing",
    microsoft_tenant_id: process.env.MICROSOFT_TENANT_ID ? "Set" : "Missing",
    microsoft_client_secret: process.env.MICROSOFT_CLIENT_SECRET ? "Set (hidden)" : "Missing",
    nextauth_secret: process.env.NEXTAUTH_SECRET ? "Set (hidden)" : "Missing",
    nextauth_url: process.env.NEXTAUTH_URL || "Missing",
  })
}
```

Visit: `https://main.d2baofxalff7ki.amplifyapp.com/api/test-auth`

### Step 3: Enable Debug Logging

The auth configuration already has `debug: true` enabled. Check server logs in AWS Amplify Console → Monitoring → Logs for detailed authentication flow errors.

### Step 4: Re-enable Authentication

Once Azure AD is properly configured and tested:

1. Uncomment authentication checks in **middleware.ts**
2. Uncomment session validation in **app/communications/page.tsx**
3. Redeploy the application

## Security Note

**The application is currently accessible without authentication.** This is a temporary measure for development/troubleshooting only. Do not use this configuration in production until authentication is re-enabled.

## Common Azure AD Issues

| Issue | Solution |
|-------|----------|
| "Configuration" error | Check redirect URI matches exactly in Azure AD |
| "AADSTS90097" admin consent error | Remove permissions that require admin consent, or have admin grant consent |
| "AADSTS50020" user not found | Verify user's email domain matches tenant |
| Token validation fails | Verify NEXTAUTH_SECRET is a strong random string (32+ chars) |
| Redirect loop | Check NEXTAUTH_URL matches your actual domain exactly |

## Contact

For Azure AD configuration assistance, contact Sky UK IT support or your Azure AD administrator.
