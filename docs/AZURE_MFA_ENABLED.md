# Azure AD MFA Authentication - Enabled

## Overview

Your GPE Communications Builder now requires Azure AD authentication with MFA for all Sky UK users.

## Authentication Flow

1. **User visits Amplify URL** → Middleware checks for valid session
2. **No session found** → Redirect to `/auth/signin`
3. **User clicks "Sign in with Microsoft"** → Redirects to Azure AD OAuth
4. **Azure AD authentication** → User signs in with @sky.uk account
5. **MFA enforcement** → Azure AD triggers MFA if configured in tenant (Conditional Access)
6. **Session created** → User redirected to `/communications`
7. **Email domain validated** → Only @sky.uk emails allowed

## Security Layers

| Layer | Protection | Location |
|-------|-----------|----------|
| Middleware | Session validation + @sky.uk check | `middleware.ts` |
| Server component | `getServerSession()` check | `app/communications/page.tsx` |
| NextAuth callback | Email domain validation | `auth-options.ts` |
| Azure AD | MFA enforcement | Azure AD tenant settings |

## MFA Configuration

MFA is enforced through your **Azure AD Conditional Access policies**, not the app code. To configure:

1. Go to **Azure Portal → Azure Active Directory**
2. Navigate to **Security → Conditional Access**
3. Create/edit policy for your app
4. Set **Grant controls** → Require multifactor authentication
5. Assign to users/groups who access the form builder

## Testing Authentication

1. Visit: `https://main.d2baofxalff7ki.amplifyapp.com`
2. You're redirected to `/auth/signin`
3. Click "Sign in with Microsoft"
4. Authenticate with @sky.uk account
5. Complete MFA if prompted (depends on Conditional Access policy)
6. Access the communications builder

## Troubleshooting

**Issue: Users not prompted for MFA**
- Check Azure AD Conditional Access policies
- Ensure policy is enabled and assigned to users
- Verify MFA is configured for the user's account

**Issue: Authentication error**
- Check Amplify environment variables (MICROSOFT_CLIENT_ID, etc.)
- Verify Azure AD app registration redirect URIs include:
  - `https://main.d2baofxalff7ki.amplifyapp.com/api/auth/callback/azure-ad`

**Issue: Access denied for @sky.uk users**
- Check middleware email validation logic
- Verify `signIn` callback in auth-options.ts

## Environment Variables Required

```
MICROSOFT_CLIENT_ID=<your-client-id>
MICROSOFT_CLIENT_SECRET=<your-client-secret>
MICROSOFT_TENANT_ID=<your-tenant-id>
NEXTAUTH_SECRET=<random-32-char-string>
NEXTAUTH_URL=https://main.d2baofxalff7ki.amplifyapp.com
```

## Current State

- ✅ Azure AD authentication enabled
- ✅ MFA enforcement through Conditional Access
- ✅ @sky.uk email domain restriction
- ✅ Session management with 8-hour expiry
- ✅ Server-side and middleware protection
- ✅ Email sending via AWS SES working
