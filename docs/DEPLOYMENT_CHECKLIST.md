# AWS Amplify Deployment Checklist

Quick checklist to deploy GPE Communications Form Builder to AWS Amplify with SES email.

---

## Pre-Deployment

### 1. AWS SES Setup

- [ ] Sign in to AWS Console
- [ ] Navigate to SES (region: eu-west-2)
- [ ] Verify email: `ava.foxwell@sky.uk`
- [ ] Check verification email and click link
- [ ] Request production access (optional but recommended)
- [ ] Create IAM user: `gpe-communications-ses`
- [ ] Attach policy: `AmazonSESFullAccess`
- [ ] Generate access keys
- [ ] Save Access Key ID and Secret Access Key securely
- [ ] Send test email from SES console to verify

### 2. Code Repository

- [ ] Code pushed to GitHub (or Git provider)
- [ ] `amplify.yml` file present in root
- [ ] `package.json` has correct dependencies
- [ ] All code committed and pushed

### 3. Azure AD Configuration

- [ ] Azure AD app created
- [ ] Client ID, Tenant ID, and Client Secret available
- [ ] Redirect URIs configured (will update after Amplify deployment)

### 4. Database Setup

- [ ] Supabase project created
- [ ] Database tables created
- [ ] Connection strings available

---

## Deployment

### 5. Create Amplify App

- [ ] Go to Amplify Console
- [ ] Click: New app → Host web app
- [ ] Connect to GitHub
- [ ] Select repository and branch
- [ ] App name: `gpe-communications-form-builder`

### 6. Configure Environment Variables

Add these variables in Amplify Console:

**AWS SES:**
- [ ] `AWS_REGION=eu-west-2`
- [ ] `AWS_ACCESS_KEY_ID=AKIA...`
- [ ] `AWS_SECRET_ACCESS_KEY=...`
- [ ] `AWS_SES_FROM_EMAIL=ava.foxwell@sky.uk`
- [ ] `AWS_SES_FROM_NAME=GPE Communications Team`

**Azure AD:**
- [ ] `MICROSOFT_CLIENT_ID=...`
- [ ] `MICROSOFT_TENANT_ID=...`
- [ ] `MICROSOFT_CLIENT_SECRET=...`

**NextAuth:**
- [ ] `NEXTAUTH_URL=https://your-app.amplifyapp.com`
- [ ] `NEXTAUTH_SECRET=` (generate with: `openssl rand -base64 32`)

**Database:**
- [ ] `POSTGRES_URL=...`
- [ ] `POSTGRES_PRISMA_URL=...`
- [ ] `SUPABASE_URL=...`
- [ ] `NEXT_PUBLIC_SUPABASE_URL=...`
- [ ] `SUPABASE_ANON_KEY=...`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- [ ] `SUPABASE_SERVICE_ROLE_KEY=...`

### 7. Deploy

- [ ] Review build settings
- [ ] Click: Save and deploy
- [ ] Monitor deployment progress
- [ ] Wait for: Deployed status
- [ ] Note your Amplify URL

---

## Post-Deployment

### 8. Update Azure AD

- [ ] Go to Azure Portal → App registrations
- [ ] Select your app
- [ ] Add redirect URI: `https://your-app.amplifyapp.com/api/auth/callback/azure-ad`
- [ ] Save changes

### 9. Test Application

- [ ] Visit Amplify URL
- [ ] Sign in with Azure AD
- [ ] Verify successful login
- [ ] Navigate to Communications page
- [ ] Create test communication
- [ ] Send test email via SES
- [ ] Verify email received
- [ ] Check email formatting

### 10. Verify Functionality

- [ ] Authentication works
- [ ] User menu shows correct info
- [ ] Communications form loads
- [ ] Preview renders correctly
- [ ] Email sends successfully
- [ ] Database saves data
- [ ] No console errors
- [ ] Logout works

---

## Optional

### 11. Custom Domain

- [ ] Add domain in Amplify Console
- [ ] Configure DNS records
- [ ] Verify SSL certificate
- [ ] Update Azure AD redirect URL

### 12. Monitoring

- [ ] Enable CloudWatch logs
- [ ] Set up alarms
- [ ] Configure notifications

### 13. Branch Previews

- [ ] Enable preview deployments
- [ ] Select branches for previews

---

## Troubleshooting

If something doesn't work:

1. **Check Amplify build logs** for errors
2. **Verify environment variables** are all present
3. **Check browser console** for frontend errors
4. **Review Azure AD redirect URLs** match exactly
5. **Test SES** from AWS Console directly
6. **Check IAM permissions** for SES user
7. **Verify region** is eu-west-2 everywhere

---

## Success Criteria

Application is successfully deployed when:

- ✓ Amplify shows "Deployed" status
- ✓ App accessible via Amplify URL
- ✓ Users can sign in with Azure AD
- ✓ Communications page loads without errors
- ✓ Emails send successfully via SES
- ✓ Emails are properly formatted
- ✓ Data saves to database
- ✓ No critical errors in logs

---

**Ready to deploy? Start with AWS SES Setup!**

For detailed instructions, see: [AWS_AMPLIFY_DEPLOYMENT.md](./AWS_AMPLIFY_DEPLOYMENT.md)
