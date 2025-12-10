# AWS Amplify Environment Variables

## Important: Variable Naming Restrictions

AWS Amplify **does not allow** environment variables that start with `AWS_` as this prefix is reserved for internal AWS use.

We use the `SES_` prefix instead for all AWS SES configuration variables.

---

## Required Environment Variables for Amplify

### SES Email Configuration

Add these variables in **AWS Amplify Console → Environment variables**:

\`\`\`bash
# Email Method
EMAIL_METHOD=aws-ses

# AWS SES Configuration (using SES_ prefix for Amplify compatibility)
SES_REGION=eu-west-2
SES_ACCESS_KEY_ID=AKIA...
SES_SECRET_ACCESS_KEY=...
SES_FROM_EMAIL=cti-gpe-communications@sky.uk
SES_FROM_NAME=GPE Communications Team
\`\`\`

### Azure AD Authentication

\`\`\`bash
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_TENANT_ID=your-tenant-id
MICROSOFT_CLIENT_SECRET=your-client-secret
\`\`\`

### Supabase Database (if using)

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

---

## How to Add Variables in Amplify Console

### Step-by-Step Instructions

1. **Go to AWS Amplify Console**
   \`\`\`
   https://console.aws.amazon.com/amplify
   \`\`\`

2. **Select Your App**
   - Click on your app name

3. **Navigate to Environment Variables**
   - Click "Environment variables" in the left sidebar

4. **Add Each Variable**
   - Click "Add variable"
   - Enter variable name (e.g., `SES_REGION`)
   - Enter variable value (e.g., `eu-west-2`)
   - Click "Save"

5. **Redeploy**
   - After adding all variables, trigger a new deployment
   - Go to "App settings" → "Build settings"
   - Click "Redeploy this version"

---

## Complete Variable List for Copy/Paste

Copy these to Amplify Console (replace values with your actual credentials):

| Variable Name | Value |
|---------------|-------|
| `EMAIL_METHOD` | `aws-ses` |
| `SES_REGION` | `eu-west-2` |
| `SES_ACCESS_KEY_ID` | `AKIA...` (from IAM user) |
| `SES_SECRET_ACCESS_KEY` | `...` (from IAM user) |
| `SES_FROM_EMAIL` | `cti-gpe-communications@sky.uk` |
| `SES_FROM_NAME` | `GPE Communications Team` |
| `MICROSOFT_CLIENT_ID` | `...` (from Azure AD) |
| `MICROSOFT_TENANT_ID` | `...` (from Azure AD) |
| `MICROSOFT_CLIENT_SECRET` | `...` (from Azure AD) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://...supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `...` |

---

## Getting Your AWS Credentials

### SES_REGION
\`\`\`
Use: eu-west-2 (London region for Sky UK)
\`\`\`

### SES_ACCESS_KEY_ID and SES_SECRET_ACCESS_KEY

**Create IAM User:**

1. Go to AWS Console → IAM → Users
2. Click "Create user"
3. User name: `gpe-communications-ses`
4. Click "Next"
5. Select "Attach policies directly"
6. Search for and select: `AmazonSESFullAccess`
7. Click "Next" → "Create user"

**Generate Access Keys:**

1. Click on the newly created user
2. Go to "Security credentials" tab
3. Scroll to "Access keys"
4. Click "Create access key"
5. Choose "Application running outside AWS"
6. Click "Next" → "Create access key"
7. **SAVE BOTH VALUES:**
   - Access key ID → `SES_ACCESS_KEY_ID`
   - Secret access key → `SES_SECRET_ACCESS_KEY`

---

## Verification Checklist

After adding all variables:

- [ ] All required variables are added in Amplify Console
- [ ] Variable names use `SES_` prefix (not `AWS_`)
- [ ] No syntax errors in variable values
- [ ] cti-gpe-communications@sky.uk is verified in AWS SES
- [ ] IAM user has AmazonSESFullAccess policy
- [ ] App redeployed after adding variables

---

## Testing After Deployment

1. **Check Build Logs**
   \`\`\`
   Amplify Console → Build history → Latest build → View logs
   Look for: "Build succeeded"
   \`\`\`

2. **Test Email Sending**
   \`\`\`
   1. Visit your Amplify app URL
   2. Log in with Azure AD
   3. Go to /communications
   4. Fill in form with cti-gpe-communications@sky.uk
   5. Send test email
   6. Check recipient inbox
   \`\`\`

3. **Check Runtime Logs**
   \`\`\`
   Amplify Console → Logs → Function logs
   Look for: "[v0] Email sent successfully via AWS SES"
   \`\`\`

---

## Common Issues

### Issue: "Cannot find environment variable"

**Solution:** 
- Verify variable names are spelled correctly
- Ensure no extra spaces in variable names
- Redeploy after adding variables

### Issue: "Access Denied" or "Invalid Credentials"

**Solution:**
- Verify SES_ACCESS_KEY_ID and SES_SECRET_ACCESS_KEY are correct
- Check IAM user has SES permissions
- Regenerate access keys if needed

### Issue: "Email address not verified"

**Solution:**
- Go to AWS SES → Verified identities
- Verify cti-gpe-communications@sky.uk
- Check mailbox for verification email
- Click verification link

---

## Variable Name Comparison

For reference, here's how variable names differ between v0 preview and Amplify:

| Purpose | v0 Preview | AWS Amplify |
|---------|------------|-------------|
| Region | `AWS_REGION` | `SES_REGION` |
| Access Key | `AWS_ACCESS_KEY_ID` | `SES_ACCESS_KEY_ID` |
| Secret Key | `AWS_SECRET_ACCESS_KEY` | `SES_SECRET_ACCESS_KEY` |
| From Email | `AWS_SES_FROM_EMAIL` | `SES_FROM_EMAIL` |
| From Name | `AWS_SES_FROM_NAME` | `SES_FROM_NAME` |

**Why the change?** AWS Amplify reserves the `AWS_` prefix for internal use.

---

## Need Help?

If you encounter issues:

1. Check Amplify build logs for errors
2. Verify all variables are set correctly
3. Ensure email is verified in SES
4. Check IAM permissions
5. Review runtime logs for error messages
