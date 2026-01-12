# Authentication & MFA Setup

## Azure AD Authentication with MFA

This application uses Azure AD (Microsoft Entra ID) for Single Sign-On (SSO) authentication with Multi-Factor Authentication (MFA) support.

### How MFA Works

When users access the Amplify URL, the following authentication flow occurs:

1. **User visits app** → `https://main.d2baofxalff7ki.amplifyapp.com`
2. **NextAuth middleware checks session** → No valid session found
3. **Redirect to Azure AD login** → User sees Microsoft login page
4. **User enters Sky UK credentials** → email@sky.uk + password
5. **Azure AD enforces MFA** → Authenticator app, SMS, or phone call
6. **MFA verification complete** → Azure AD issues token
7. **App validates email domain** → Must be @sky.uk
8. **Session created** → User granted access to communications builder

### MFA Configuration in Azure AD

MFA is configured **in your Azure AD tenant**, not in the application code. The application automatically inherits your organization's MFA policies.

**To verify MFA is enabled:**

1. Go to **Azure Portal** → **Microsoft Entra ID** → **Security** → **Conditional Access**
2. Check if there's a policy requiring MFA for this application
3. Common policies:
   - Require MFA for all users
   - Require MFA for admin roles
   - Require MFA for external access

### Force MFA Explicitly (Optional)

If your organization doesn't have a blanket MFA policy, you can force MFA at the application level by uncommenting this line in `auth-options.ts`:

```typescript
authorization: {
  params: {
    scope: "openid profile email User.Read",
    prompt: "login",
    acr_values: "urn:microsoft:req1", // Uncomment to require MFA
  },
}
```

**Note:** This requires the application to have the appropriate permissions in Azure AD.

### Access Control Layers

| Layer | Method | Enforced By |
|-------|--------|-------------|
| **Authentication** | Azure AD SSO | NextAuth middleware |
| **MFA** | Configured in Azure AD | Azure AD Conditional Access |
| **Domain Check** | @sky.uk validation | Application code |
| **IP Restriction** | Office IP ranges (optional) | Middleware |

### Protected Routes

The following routes require authentication:

- `/communications` - Main form builder
- `/api/send-email` - Email sending API
- All routes except `/`, `/auth/signin`, `/auth/error`

### Environment Variables Required

```env
MICROSOFT_CLIENT_ID=your-azure-app-client-id
MICROSOFT_CLIENT_SECRET=your-azure-app-client-secret
MICROSOFT_TENANT_ID=your-azure-tenant-id
NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=https://main.d2baofxalff7ki.amplifyapp.com
```

### Testing MFA

1. Clear browser cookies/session
2. Visit: `https://main.d2baofxalff7ki.amplifyapp.com/communications`
3. Should redirect to Azure AD login
4. Enter Sky UK credentials
5. Complete MFA verification (app/SMS/call)
6. Should redirect back to communications builder

### Troubleshooting

**Problem:** Users not prompted for MFA  
**Solution:** Check Azure AD Conditional Access policies. MFA may not be enabled for this app.

**Problem:** Users get "Access Denied" after login  
**Solution:** Verify email ends with @sky.uk. Non-Sky emails are blocked.

**Problem:** "Admin consent required" error  
**Solution:** Azure AD admin must grant consent in Azure Portal → App registrations → Your app → API permissions

### Security Best Practices

- MFA is enforced by Azure AD tenant policies
- Sessions expire after inactivity
- Email domain validated on both client and server side
- IP restriction available for additional security
- Rate limiting prevents brute force attacks
