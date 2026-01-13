# Azure AD MFA Authentication Setup

## Overview

Your Form Builder application uses **Azure Active Directory (Azure AD)** for authentication with **Multi-Factor Authentication (MFA)** enforcement. MFA is enforced at the Azure AD tenant level and automatically applies when users sign in.

## Allowed Domains

The application now supports multiple email domains:
- **@sky.uk** - Primary Sky UK employees
- **@3dflyingmonsters.co.uk** - Test users for Azure AD testing

Domain access is managed in `lib/access-control.ts` and can be easily updated.

## How It Works

```
User visits app → Redirects to /auth/signin → Click "Sign in with Microsoft"
    ↓
Azure AD Login Page → User enters @sky.uk or @3dflyingmonsters.co.uk email
    ↓
Azure AD MFA Challenge → SMS/Authenticator App/Phone Call
    ↓
User completes MFA → Azure AD validates → Token issued
    ↓
App validates email domain → Session created → Access granted
```

## Authentication Flow

### 1. User Access
- User navigates to: `https://main.d2baofxalff7ki.amplifyapp.com`
- Middleware detects no session
- Redirects to `/auth/signin`

### 2. Azure AD Sign-In
- User clicks "Sign in with Microsoft"
- NextAuth initiates OAuth flow with Azure AD
- User is redirected to Microsoft login page

### 3. MFA Enforcement
- **MFA is enforced by Azure AD tenant settings, NOT by the application**
- If MFA is enabled in your Azure AD tenant (Conditional Access policies), users will be prompted for:
  - SMS code
  - Microsoft Authenticator app approval
  - Phone call verification
  - FIDO2 security key
  - etc.

### 4. Domain Validation
- After successful Azure AD authentication (including MFA), the app validates the email domain
- Only `@sky.uk` and `@3dflyingmonsters.co.uk` emails are allowed
- Non-Sky UK and non-test emails are rejected with an "Access Denied" error

### 5. Session Creation
- Valid users get an 8-hour JWT session
- Users are redirected to `/communications`

## Configuration

### Required Environment Variables (Already Set in Amplify)

| Variable | Value | Purpose |
|----------|-------|---------|
| `MICROSOFT_CLIENT_ID` | `6a4e7950-9c5d-4ee7-b644-8d1f86235d8d` | Azure AD App Client ID |
| `MICROSOFT_CLIENT_SECRET` | `[hidden]` | Azure AD App Client Secret |
| `MICROSOFT_TENANT_ID` | `2fdb7e27-9b62-44f7-a0fe-9836eaa1f161` | Sky UK Azure AD Tenant ID |
| `NEXTAUTH_SECRET` | `[hidden]` | Session encryption key |
| `NEXTAUTH_URL` | `https://main.d2baofxalff7ki.amplifyapp.com` | Application URL |

### Azure AD App Registration Settings

In your Azure AD App Registration:

1. **Redirect URIs**
   - `https://main.d2baofxalff7ki.amplifyapp.com/api/auth/callback/azure-ad`

2. **API Permissions**
   - `User.Read` (Delegated)
   - `openid` (Delegated)
   - `profile` (Delegated)
   - `email` (Delegated)

3. **Supported Account Types**
   - "Accounts in this organizational directory only (Sky UK)"

## MFA Enforcement

### Where MFA is Configured

**MFA is NOT configured in this application.** It is configured in Azure AD:

1. **Azure Portal** → **Azure Active Directory**
2. **Security** → **Conditional Access** → **Policies**
3. Create or edit a policy:
   - Assignments: All users (or specific groups)
   - Cloud apps: All apps (or specific apps including your Form Builder)
   - Grant: Require multi-factor authentication

### Checking if MFA is Enabled

To verify MFA is working:

1. Clear your browser cookies/cache
2. Visit: `https://main.d2baofxalff7ki.amplifyapp.com`
3. Sign in with your @sky.uk or @3dflyingmonsters.co.uk account
4. **You should be prompted for MFA** (SMS, app approval, etc.)
5. Complete MFA challenge
6. You should be redirected to the communications builder

### MFA Options in Azure AD

Users can set up MFA methods at: **https://mysignins.microsoft.com/security-info**

Available MFA methods:
- Microsoft Authenticator app (recommended)
- SMS text message
- Phone call
- FIDO2 security key
- Windows Hello for Business

## Testing the Setup

### Test Authentication Configuration

Visit the test endpoint:
```
https://main.d2baofxalff7ki.amplifyapp.com/api/auth/test
```

You should see:
```json
{
  "status": "ok",
  "message": "NextAuth configuration test",
  "config": {
    "hasClientId": true,
    "hasClientSecret": true,
    "hasTenantId": true,
    "hasNextAuthSecret": true,
    "nextAuthUrl": "https://main.d2baofxalff7ki.amplifyapp.com"
  }
}
```

All values should be `true`.

### Test Full Authentication Flow

1. Open incognito/private browser window
2. Navigate to: `https://main.d2baofxalff7ki.amplifyapp.com/communications`
3. You should be redirected to `/auth/signin`
4. Click "Sign in with Microsoft"
5. Enter your @sky.uk or @3dflyingmonsters.co.uk email
6. Complete Azure AD MFA challenge (if enabled in tenant)
7. You should be redirected back to `/communications`

## Security Features

### Access Control
- **Authentication**: Azure AD OAuth 2.0
- **MFA**: Enforced by Azure AD Conditional Access
- **Domain Restriction**: Only @sky.uk and @3dflyingmonsters.co.uk emails allowed
- **Session Duration**: 8 hours
- **Session Type**: JWT (server-side validation)

### Middleware Protection
- All routes except `/`, `/auth/*`, and `/api/auth/*` require authentication
- Invalid sessions are redirected to sign-in page
- Non-@sky.uk and non-test emails are blocked with "Access Denied" error

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Troubleshooting

### Error: "Authentication Error - There is a problem with the server configuration"

**Cause**: Missing or invalid environment variables

**Solution**:
1. Check Amplify Console → Environment Variables
2. Verify all required variables are set
3. Trigger a new deployment
4. Test with `/api/auth/test` endpoint

### Error: "Access Denied. You may not have permission to access this application"

**Cause**: Email domain is not @sky.uk or @3dflyingmonsters.co.uk

**Solution**:
- Only Sky UK employees with @sky.uk emails and test users with @3dflyingmonsters.co.uk emails can access this app
- External users and non-allowed emails are blocked

### MFA Not Prompting

**Cause**: MFA is not enabled in Azure AD tenant

**Solution**:
1. Contact Azure AD administrator
2. Request MFA enforcement via Conditional Access policy
3. Target: All users or specific security group
4. Apps: All cloud apps or specific app registration

### Session Expires Too Quickly

**Cause**: Default session is 8 hours

**Solution**:
To change session duration, update `auth-options.ts`:
```typescript
session: {
  strategy: "jwt",
  maxAge: 24 * 60 * 60, // 24 hours
}
```

## Important Notes

1. **MFA is enforced by Azure AD, not the application**
   - The app cannot bypass or disable MFA if it's configured in Azure AD
   - The app simply trusts Azure AD's authentication decision

2. **Prompt: "login" forces re-authentication**
   - The auth configuration uses `prompt: "login"`
   - This forces users to re-authenticate each time (including MFA)
   - This is intentional for security

3. **Email domain is validated server-side**
   - Even if a user has a valid Azure AD account, they must have @sky.uk or @3dflyingmonsters.co.uk email
   - This validation happens in both the `signIn` callback and middleware

4. **Sessions are JWT-based**
   - Sessions are stored client-side as encrypted JWTs
   - No session database required
   - Sessions are validated on every protected route request

## Azure AD Admin Requirements

If you need to modify Azure AD settings, contact your Azure AD administrator for:

1. **Enabling MFA**
   - Conditional Access policy configuration
   - MFA method requirements

2. **App Registration Updates**
   - Redirect URI changes
   - Permission scope modifications

3. **User Access Management**
   - Adding/removing users
   - Group-based access control

## Next Steps

1. Verify all environment variables are correctly set in Amplify
2. Test the authentication flow in incognito mode
3. Confirm MFA is working (you should be prompted)
4. If MFA is not prompting, contact Azure AD admin to enable Conditional Access policy
5. Deploy to production and test with multiple @sky.uk and @3dflyingmonsters.co.uk users
