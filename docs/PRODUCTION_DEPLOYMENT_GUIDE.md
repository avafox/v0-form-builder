# Production Deployment Guide - Form Builder

Complete guide to deploy the Form Builder application to production with Azure AD production tenancy.

---

## Pre-Deployment Checklist

- [ ] Production Azure AD tenant access
- [ ] AWS account with appropriate permissions
- [ ] Amplify hosting setup
- [ ] Domain name (optional but recommended)
- [ ] Sky UK IT approval for production deployment

---

## Part 1: Azure AD Production App Registration

### Important: What You Can Do Yourself

✅ **You CAN do without admin privileges:**
- Create Azure AD app registration
- Configure redirect URIs
- Set up OAuth settings
- Generate client secret
- Get all credentials (Client ID, Tenant ID, Secret)
- Test the entire authentication flow

❌ **Requires Azure AD Admin:**
- Grant admin consent (one-time approval)
- This is specifically required by Sky UK's tenant security policy
- Admin just clicks one button, takes 30 seconds

### Step 1: Create Azure AD App Registration

1. **Sign in to Azure Portal** (production tenant)
   - Go to: https://portal.azure.com
   - Navigate to **Microsoft Entra ID** (formerly Azure AD)

2. **Create New App Registration**
   - Click **App registrations** → **New registration**
   - Configure:
     - **Name**: `Sky UK Form Builder - Production`
     - **Supported account types**: `Accounts in this organizational directory only (Sky UK only - Single tenant)`
     - **Redirect URI**: 
       - Platform: `Web`
       - URI: `https://your-production-domain.amplifyapp.com/api/auth/callback/azure-ad`
       - (Update with your actual production Amplify URL)

3. **Save the Application (client) ID**
   - After creation, copy the **Application (client) ID**
   - This will be your `MICROSOFT_CLIENT_ID`

4. **Save the Directory (tenant) ID**
   - Copy the **Directory (tenant) ID** from the Overview page
   - This will be your `MICROSOFT_TENANT_ID`

### Step 2: Create Client Secret

1. Go to **Certificates & secrets** → **Client secrets** → **New client secret**
2. Configure:
   - **Description**: `Form Builder Production Secret`
   - **Expires**: Choose appropriate expiration (90 days, 1 year, or 2 years)
3. **Copy the secret VALUE immediately** (it won't be shown again)
   - This will be your `MICROSOFT_CLIENT_SECRET`

### Step 3: Configure API Permissions

1. Go to **API permissions** → **Add a permission**
2. Select **Microsoft Graph** → **Delegated permissions**
3. Add these permissions:
   - `openid` (Sign users in)
   - `profile` (View users' basic profile)
   - `email` (View users' email address)
   - `User.Read` (Sign in and read user profile)

4. **Admin Consent Required (Sky UK Policy)**
   - ✅ **You CAN create and configure the app registration yourself**
   - ❌ **Admin privileges are ONLY needed for**: Clicking "Grant admin consent for [Your Organization]"
   - **Why needed**: Sky UK's Azure AD tenant has a policy requiring admin approval for all OAuth apps
   - **What to do**: Ask your Azure AD admin to grant consent (30-second task)
   - **Without this**: Users will see error `AADSTS90097` when trying to sign in
   
   **Note**: The permissions we use (`User.Read`, `openid`, `profile`, `email`) are normally user-consentable, but Sky UK's tenant policy requires admin approval for any OAuth app regardless of permissions.

### Step 4: Configure Authentication Settings

1. Go to **Authentication**
2. Under **Implicit grant and hybrid flows**, check:
   - ✅ **ID tokens** (used for implicit and hybrid flows)
3. Under **Advanced settings**:
   - Allow public client flows: **No**
4. Click **Save**

### Step 5: Verify Redirect URIs

Ensure these redirect URIs are added under **Authentication** → **Web**:
```
https://your-production-domain.amplifyapp.com/api/auth/callback/azure-ad
```

---

## Part 2: AWS Amplify Production Setup

### Step 1: Create Production Amplify App

1. **AWS Amplify Console**
   - Go to: https://console.aws.amazon.com/amplify/
   - Click **New app** → **Host web app**

2. **Connect Repository**
   - Choose your Git provider (GitHub, etc.)
   - Select the repository
   - Choose the `main` branch (or your production branch)

3. **Build Settings**
   - Amplify will auto-detect Next.js
   - Verify `amplify.yml` is detected

### Step 2: Configure Production Environment Variables

In **Amplify Console** → **Environment variables**, add:

#### Authentication Variables
```
NEXTAUTH_SECRET=<generate-new-production-secret>
NEXTAUTH_URL=https://your-production-domain.amplifyapp.com
MICROSOFT_CLIENT_ID=<from-azure-step-1.3>
MICROSOFT_CLIENT_SECRET=<from-azure-step-2.3>
MICROSOFT_TENANT_ID=<from-azure-step-1.4>
```

**Generate NEXTAUTH_SECRET:**
- Online: https://generate-secret.vercel.app/32
- Or CLI: `openssl rand -base64 32`

#### Email Variables (AWS SES)
```
SES_FROM_EMAIL=gpe-communications@contact.sky
SES_FROM_NAME=GPE Communications Team
SES_REGION=eu-west-2
SES_ACCESS_KEY_ID=<your-production-ses-access-key>
SES_SECRET_ACCESS_KEY=<your-production-ses-secret-key>
```

#### Access Control (Optional)
```
ALLOWED_EMAIL_DOMAINS=sky.uk
ALLOWED_EMAILS=user1@sky.uk,user2@sky.uk
```

#### Security Variables (Optional)
```
ENABLE_IP_RESTRICTION=true
ALLOWED_IP_RANGES=<sky-uk-office-ip-ranges>
```

### Step 3: Configure Custom Domain (Optional but Recommended)

1. **In Amplify Console** → **Domain management**
2. **Add domain**: `forms.sky.uk` (or your chosen subdomain)
3. **Configure DNS** with provided CNAME records in Sky UK's DNS
4. **Update Azure AD Redirect URI** to use custom domain:
   ```
   https://forms.sky.uk/api/auth/callback/azure-ad
   ```
5. **Update NEXTAUTH_URL** environment variable:
   ```
   NEXTAUTH_URL=https://forms.sky.uk
   ```

---

## Part 3: AWS SES Production Setup

### Step 1: Move SES Out of Sandbox

**In AWS Console:**
1. Go to **Amazon SES** → **Account dashboard**
2. Click **Request production access**
3. Fill out the form:
   - **Mail type**: Transactional
   - **Website URL**: Your production Amplify URL
   - **Use case description**: 
     ```
     Internal corporate communications tool for Sky UK employees.
     Sends formatted HTML email notifications to @sky.uk addresses only.
     Expected volume: ~500 emails/month for internal team communications.
     ```
4. Wait for AWS approval (usually 24-48 hours)

### Step 2: Verify Production Sender Email

1. **In AWS SES** → **Verified identities**
2. Click **Create identity**
3. Select **Email address**
4. Enter: `gpe-communications@contact.sky`
5. Click **Create identity**
6. **Check the email inbox** and click the verification link

### Step 3: Create Production IAM User (if needed)

If you need new production credentials:

1. **IAM Console** → **Users** → **Create user**
2. User name: `sky-form-builder-production`
3. **Attach policies**:
   - `AmazonSESFullAccess` (or create custom policy with least privilege)
4. **Create access key** → **Application running outside AWS**
5. **Save credentials**:
   - Access Key ID → `SES_ACCESS_KEY_ID`
   - Secret Access Key → `SES_SECRET_ACCESS_KEY`

---

## Part 4: Database & Cache (Production)

### Supabase (Already Connected)

Your Supabase connection is environment-agnostic. No changes needed unless you want a separate production database:

**If creating separate production database:**
1. Create new Supabase project for production
2. Update environment variables with production Supabase credentials
3. Run database migration scripts in production environment

### Upstash Redis (Already Connected)

Your Upstash Redis connection is environment-agnostic. Consider:

**Production-specific Redis instance:**
1. Create new Upstash database for production
2. Update environment variables:
   ```
   KV_URL=<production-redis-url>
   KV_REST_API_URL=<production-rest-api-url>
   KV_REST_API_TOKEN=<production-token>
   ```

---

## Part 5: Security Hardening for Production

### 1. Enable IP Restriction (Recommended)

**Get Sky UK Office IP Ranges** from IT:
```
ENABLE_IP_RESTRICTION=true
ALLOWED_IP_RANGES=10.0.0.0/8,172.16.0.0/12
```

### 2. Enable Strict Email Whitelisting

```
ALLOWED_EMAILS=ava.foxwell@sky.uk,team-member-1@sky.uk,team-member-2@sky.uk
```

### 3. Configure Rate Limiting

Already implemented via Upstash Redis. Verify limits are appropriate:
- Email sending: 10 per minute per user
- Authentication attempts: 5 per minute per IP

### 4. Enable HTTPS Only

Amplify automatically provides HTTPS. Ensure:
- All redirect URIs use `https://`
- No mixed content warnings

### 5. Configure Security Headers

Already implemented in `middleware.ts`:
- CSP (Content Security Policy)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin

---

## Part 6: Testing Checklist

### Pre-Launch Testing

- [ ] **Authentication Flow**
  - [ ] User can sign in with @sky.uk email
  - [ ] MFA is enforced (if enabled in Azure AD)
  - [ ] Non-@sky.uk emails are rejected
  - [ ] Session persists correctly

- [ ] **Email Sending**
  - [ ] Send test email to @sky.uk address
  - [ ] Verify HTML formatting renders correctly
  - [ ] Check sender shows as `gpe-communications@contact.sky`
  - [ ] Verify emails arrive in inbox (not spam)

- [ ] **Rate Limiting**
  - [ ] Test email rate limit (10/min)
  - [ ] Test auth rate limit (5/min)

- [ ] **IP Restriction** (if enabled)
  - [ ] Access from office IP works
  - [ ] Access from external IP blocked

- [ ] **Error Handling**
  - [ ] Test with invalid credentials
  - [ ] Test with missing required fields
  - [ ] Verify error messages are user-friendly

### Performance Testing

- [ ] Page load times < 3 seconds
- [ ] Form submission < 2 seconds
- [ ] Email delivery < 30 seconds

---

## Part 7: Deployment Process

### Initial Production Deployment

1. **Commit Production Changes**
   ```bash
   git checkout main
   git pull origin main
   # Verify all code is production-ready
   ```

2. **Deploy to Amplify**
   - Amplify automatically deploys on push to main
   - Monitor build in Amplify Console
   - Build should complete in ~3-5 minutes

3. **Verify Environment Variables**
   - Visit: `https://your-production-url/api/auth/check-env`
   - Verify all required variables are present

4. **Test Authentication**
   - Visit production URL
   - Click "Sign In"
   - Complete Azure AD MFA flow
   - Verify successful login

5. **Test Email Sending**
   - Access Communications Builder
   - Fill out test form
   - Send test email
   - Verify receipt

### Ongoing Deployments

1. **Make changes in development/staging first**
2. **Test thoroughly**
3. **Merge to main branch**
4. **Amplify auto-deploys**
5. **Monitor logs in Amplify Console**

---

## Part 8: Monitoring & Maintenance

### Monitoring

**AWS CloudWatch** (automatic via Amplify):
- Monitor Lambda function errors
- Track API response times
- Set up alarms for failures

**Amplify Console**:
- Build success/failure notifications
- Application logs
- Performance metrics

### Regular Maintenance

**Monthly:**
- [ ] Review application logs for errors
- [ ] Check SES sending statistics
- [ ] Review authentication logs

**Quarterly:**
- [ ] Rotate Azure AD client secret (if expiring)
- [ ] Review and update dependencies
- [ ] Security audit

**Annually:**
- [ ] Review AWS SES usage and costs
- [ ] Update Azure AD permissions (if needed)
- [ ] Comprehensive security review

---

## Part 9: Troubleshooting Production Issues

### Issue: Azure AD Authentication Fails

**Check:**
1. Redirect URI matches exactly in Azure AD
2. `NEXTAUTH_URL` matches production URL
3. Admin consent granted in Azure AD
4. Client secret hasn't expired

### Issue: Emails Not Sending

**Check:**
1. SES is out of sandbox mode
2. Sender email is verified in SES
3. SES credentials are correct
4. Check AWS SES sending statistics for bounces

### Issue: Build Failures

**Check:**
1. Environment variables are set in Amplify
2. `amplify.yml` is creating `.env.production` correctly
3. Review build logs in Amplify Console
4. Verify Node.js version compatibility

### Issue: Rate Limiting Too Strict

**Adjust in code:**
- Update `lib/rate-limit.ts`
- Modify limits for production volume
- Redeploy

---

## Part 10: Rollback Plan

### If Production Issues Occur

1. **Amplify Console** → **Deployments**
2. Find last working deployment
3. Click **Redeploy this version**
4. Investigate issue in development environment
5. Deploy fix once verified

### Emergency Rollback

1. Revert commit in Git
2. Push to main branch
3. Amplify automatically redeploys previous version

---

## Summary Checklist

### Azure AD Setup
- [ ] Production app registration created
- [ ] Client ID, Secret, and Tenant ID saved
- [ ] Redirect URI configured
- [ ] API permissions added and consented
- [ ] Authentication settings configured

### AWS Setup
- [ ] Production Amplify app created
- [ ] Environment variables configured
- [ ] SES out of sandbox
- [ ] Sender email verified
- [ ] Production domain configured (optional)

### Testing
- [ ] Authentication works
- [ ] MFA enforced
- [ ] Email sending works
- [ ] Rate limiting verified
- [ ] Security headers active

### Documentation
- [ ] Team trained on using the application
- [ ] Support contacts documented
- [ ] Incident response plan created

---

## Support Contacts

**Azure AD Issues:**
- Sky UK Azure AD Admin Team

**AWS/Amplify Issues:**
- AWS Support (via AWS Console)
- Internal DevOps team

**Application Issues:**
- Development team
- GitHub issues: [repository-link]

---

## Appendix: Environment Variables Reference

```bash
# Authentication (Required)
NEXTAUTH_SECRET=<32-char-random-string>
NEXTAUTH_URL=https://your-production-domain.amplifyapp.com
MICROSOFT_CLIENT_ID=<azure-application-id>
MICROSOFT_CLIENT_SECRET=<azure-client-secret>
MICROSOFT_TENANT_ID=<azure-tenant-id>

# Email (Required)
SES_FROM_EMAIL=gpe-communications@contact.sky
SES_FROM_NAME=GPE Communications Team
SES_REGION=eu-west-2
SES_ACCESS_KEY_ID=<aws-ses-access-key>
SES_SECRET_ACCESS_KEY=<aws-ses-secret-key>

# Access Control (Optional)
ALLOWED_EMAIL_DOMAINS=sky.uk
ALLOWED_EMAILS=user1@sky.uk,user2@sky.uk

# Security (Optional)
ENABLE_IP_RESTRICTION=true
ALLOWED_IP_RANGES=10.0.0.0/8

# Database (Already configured)
POSTGRES_URL=<from-supabase>
SUPABASE_URL=<from-supabase>
SUPABASE_ANON_KEY=<from-supabase>

# Cache (Already configured)
KV_URL=<from-upstash>
KV_REST_API_URL=<from-upstash>
KV_REST_API_TOKEN=<from-upstash>
```

---

**Last Updated:** January 2026
**Version:** 1.0
**Status:** Ready for Production Deployment
