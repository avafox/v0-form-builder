# Current Application State

**Last Updated:** December 2024

## Working Features

### Email Sending via AWS SES
- **Status:** ✅ Working
- **Configuration:** Using AWS SES (eu-west-2)
- **Sender:** `cti-gpe-communications@sky.uk` (will change to `@contact.sky`)
- **Recipients:** Internal Sky UK employees (`@sky.uk`)
- **Known Issue:** Some emails may be filtered by Sky UK's corporate email system

### Communication Form Builder
- **Status:** ✅ Working
- **Features:**
  - Create formatted HTML communications
  - Multiple sections (greeting, details, action, contact)
  - Priority levels (Low, Medium, High, Urgent)
  - Department targeting
  - Full preview before sending
  - Email delivery via AWS SES

### Security
- **Status:** ✅ Basic security implemented
- **Features:**
  - Security headers (XSS, clickjacking protection)
  - Suspicious path blocking
  - Optional IP restriction (not enabled)
  - Rate limiting available (not fully enabled)

## Not Yet Implemented

### Authentication
- **Status:** ❌ Disabled (was causing errors)
- **Plan:** Azure AD SSO with MFA enforcement
- **Blocker:** NextAuth configuration issues with Amplify environment
- **Workaround:** App is currently publicly accessible

### Features Pending
- ServiceNow integration
- Advanced analytics
- Email templates library
- Bulk sending

## Known Issues

1. **Email Filtering:** Sky UK corporate email may filter/quarantine emails from SES
   - **Solution:** Switching to `@contact.sky` domain (pending)

2. **Authentication Disabled:** App is accessible without login
   - **Security Risk:** Medium (mitigated by URL obscurity)
   - **Solution:** Fix NextAuth + Azure AD integration separately

3. **SNS Notifications:** Users receive delivery notifications instead of actual emails
   - **Solution:** Unsubscribe from SNS topic or use alternative email service

## Environment Setup

### Required Environment Variables (Amplify)
```
AWS_SES_FROM_EMAIL=cti-gpe-communications@sky.uk
AWS_SES_FROM_NAME=GPE Communications Team
SES_REGION=eu-west-2
SES_ACCESS_KEY_ID=<configured>
SES_SECRET_ACCESS_KEY=<configured>
```

### Optional Environment Variables
```
ENABLE_IP_RESTRICTION=false
ALLOWED_IP_RANGES=<Sky UK office IPs>
```

## Access

- **URL:** https://main.d2baofxalff7ki.amplifyapp.com
- **Authentication:** None (currently open access)
- **Protected Routes:** None

## Next Steps

1. Complete migration to `@contact.sky` sender domain
2. Fix Azure AD authentication separately (optional)
3. Add email whitelist for authorized senders
4. Test with various Sky UK email clients
