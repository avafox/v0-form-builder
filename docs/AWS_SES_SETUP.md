# AWS SES Setup Guide

This guide walks you through setting up AWS SES (Simple Email Service) for the GPE Communications Tool.

---

## Why AWS SES?

AWS SES is recommended when:
- Your company blocks Microsoft Graph API Mail.Send permissions
- You need high email volume (>100k emails/month)
- You want independence from Microsoft 365
- You need detailed email analytics and monitoring
- You want flexible sender addresses

**Benefits:**
- No Microsoft Graph API permissions needed
- No mailbox "Send As" permissions needed
- Cost-effective ($0.10 per 1,000 emails)
- Excellent deliverability
- Highly scalable

---

## Prerequisites

- AWS account
- IAM user with SES permissions
- Verified email address or domain in AWS SES
- Production access (if sending to non-verified addresses)

---

## Step 1: Create AWS Account

If you don't have an AWS account:

\`\`\`
1. Go to: https://aws.amazon.com
2. Click "Create an AWS Account"
3. Follow the signup process
4. Add payment method
\`\`\`

---

## Step 2: Access AWS SES Console

\`\`\`
1. Sign in to AWS Console: https://console.aws.amazon.com
2. Search for "SES" or "Simple Email Service"
3. Select your region: eu-west-2 (London) recommended for UK
\`\`\`

---

## Step 3: Verify Email Address

For testing and initial setup, verify your email address:

\`\`\`
1. In SES Console, click "Verified identities"
2. Click "Create identity"
3. Select "Email address"
4. Enter: ava.foxwell@sky.uk
5. Click "Create identity"
6. Check your email inbox
7. Click the verification link in the email
8. Wait for status to show "Verified"
\`\`\`

**Status Check:**
\`\`\`
Verified identities → ava.foxwell@sky.uk → Status: Verified ✓
\`\`\`

---

## Step 4: Request Production Access

By default, AWS SES starts in "sandbox mode" with limitations:
- Can only send to verified email addresses
- Limited to 200 emails per day
- Limited to 1 email per second

**Request Production Access:**

\`\`\`
1. SES Console → Account dashboard
2. Click "Request production access"
3. Fill in the form:
   - Mail type: Transactional
   - Website URL: https://your-app.amplifyapp.com
   - Use case description:
     "Internal communications tool for GPE team at Sky UK.
      Sends transactional emails for team communications.
      Estimated volume: 1,000-5,000 emails/month."
   - Compliance: Confirm you follow AWS policies
4. Submit request
5. Wait for approval (usually 24 hours)
\`\`\`

**You'll receive an email when approved.**

---

## Step 5: Create IAM User for SES

Create a dedicated IAM user with SES permissions:

\`\`\`
1. AWS Console → IAM
2. Users → Add users
3. User name: gpe-communications-ses
4. Access type: Programmatic access (no console access needed)
5. Click "Next: Permissions"
\`\`\`

**Attach Policy:**

\`\`\`
1. Click "Attach existing policies directly"
2. Search for: AmazonSESFullAccess
3. Check the box next to it
4. Click "Next: Tags" (skip tags)
5. Click "Next: Review"
6. Click "Create user"
\`\`\`

**Save Credentials:**

\`\`\`
⚠️ IMPORTANT: Save these credentials immediately!

Access Key ID: AKIA...
Secret Access Key: wJalrXUtn...

You won't be able to see the secret key again.
\`\`\`

---

## Step 6: Configure Environment Variables

Add these environment variables to your Amplify app:

\`\`\`bash
# Email method
EMAIL_METHOD=aws-ses

# AWS SES Configuration
AWS_REGION=eu-west-2
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalrXUtn...
AWS_SES_FROM_EMAIL=ava.foxwell@sky.uk
AWS_SES_FROM_NAME=GPE Communications Team

# Keep Azure AD for authentication only
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_TENANT_ID=your-tenant-id
MICROSOFT_CLIENT_SECRET=your-client-secret
\`\`\`

**In AWS Amplify Console:**

\`\`\`
1. Go to your app in Amplify Console
2. App settings → Environment variables
3. Click "Manage variables"
4. Add each variable above
5. Click "Save"
6. Redeploy your app
\`\`\`

---

## Step 7: Test AWS SES

Run the test script to verify everything works:

\`\`\`bash
# Set environment variables locally
export AWS_REGION=eu-west-2
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=wJalrXUtn...
export AWS_SES_FROM_EMAIL=ava.foxwell@sky.uk
export AWS_SES_FROM_NAME="GPE Communications Team"
export TEST_EMAIL=ava.foxwell@sky.uk

# Run test script
npm run dev
# Then in another terminal:
npx tsx scripts/test-aws-ses.tsx
\`\`\`

**Expected Output:**

\`\`\`
=== AWS SES Connection Test ===

Testing AWS SES connection...
Region: eu-west-2
From Email: ava.foxwell@sky.uk

✅ AWS SES connection successful

Sending test email...
From: ava.foxwell@sky.uk
To: ava.foxwell@sky.uk

✅ Test email sent successfully

=== All Tests Passed ===
\`\`\`

---

## Step 8: Verify Domain (Optional - For Production)

For production use, verify your entire domain instead of individual emails:

\`\`\`
1. SES Console → Verified identities
2. Click "Create identity"
3. Select "Domain"
4. Enter: sky.uk
5. Click "Create identity"
6. Copy the DNS records shown
\`\`\`

**DNS Records to Add:**

You'll need to add these records to your DNS (contact IT team):

\`\`\`
Type: TXT
Name: _amazonses.sky.uk
Value: [provided by AWS]

Type: CNAME (DKIM 1)
Name: [random]._domainkey.sky.uk
Value: [provided by AWS]

Type: CNAME (DKIM 2)
Name: [random]._domainkey.sky.uk
Value: [provided by AWS]

Type: CNAME (DKIM 3)
Name: [random]._domainkey.sky.uk
Value: [provided by AWS]
\`\`\`

**Wait for Verification:**
- DNS propagation: 24-72 hours
- Check status in SES Console

---

## Troubleshooting

### Issue: "Email address is not verified"

**Solution:**
\`\`\`
1. Go to SES Console → Verified identities
2. Check if ava.foxwell@sky.uk shows "Verified"
3. If not, click on it and resend verification email
4. Check spam folder for verification email
\`\`\`

### Issue: "Account is in sandbox mode"

**Solution:**
\`\`\`
1. Request production access (Step 4)
2. While waiting, you can only send to verified addresses
3. Verify recipient email addresses in SES Console
\`\`\`

### Issue: "Access Denied" or "Invalid credentials"

**Solution:**
\`\`\`
1. Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are correct
2. Check IAM user has AmazonSESFullAccess policy
3. Verify credentials haven't expired
4. Try creating new access keys
\`\`\`

### Issue: "Rate exceeded"

**Solution:**
\`\`\`
1. Check your sending limits in SES Console
2. Sandbox mode: 200 emails/day, 1/second
3. Request production access for higher limits
4. Implement rate limiting in your app
\`\`\`

### Issue: "Email not received"

**Solution:**
\`\`\`
1. Check spam/junk folder
2. Verify sender email is verified in SES
3. Check SES Console → Reputation metrics
4. Review bounce/complaint rates
5. Check CloudWatch logs for errors
\`\`\`

---

## Monitoring and Analytics

### View Sending Statistics

\`\`\`
1. SES Console → Account dashboard
2. View:
   - Emails sent (last 24 hours)
   - Bounce rate
   - Complaint rate
   - Reputation status
\`\`\`

### CloudWatch Logs

\`\`\`
1. AWS Console → CloudWatch
2. Logs → Log groups
3. Find: /aws/ses/...
4. View detailed email sending logs
\`\`\`

### Set Up Alarms

\`\`\`
1. CloudWatch → Alarms
2. Create alarm for:
   - High bounce rate (>5%)
   - High complaint rate (>0.1%)
   - Sending quota exceeded
\`\`\`

---

## Cost Estimation

**AWS SES Pricing:**

\`\`\`
Emails sent: $0.10 per 1,000 emails
Data transfer: $0.12 per GB (outbound)

Monthly Cost Examples:
- 1,000 emails/month: $0.10
- 5,000 emails/month: $0.50
- 10,000 emails/month: $1.00
- 50,000 emails/month: $5.00
- 100,000 emails/month: $10.00
\`\`\`

**Free Tier:**
- 62,000 emails/month free (if using EC2)
- Otherwise, standard pricing applies

---

## Security Best Practices

1. **IAM Permissions:**
   - Use least privilege (only SES permissions)
   - Don't use root account credentials
   - Rotate access keys regularly

2. **Environment Variables:**
   - Never commit credentials to git
   - Use Amplify environment variables
   - Different credentials for dev/prod

3. **Email Verification:**
   - Verify all sender addresses
   - Use domain verification for production
   - Implement SPF, DKIM, DMARC

4. **Monitoring:**
   - Set up CloudWatch alarms
   - Monitor bounce/complaint rates
   - Review sending patterns regularly

---

## Next Steps

After setup is complete:

1. ✅ Test sending email from your app
2. ✅ Verify emails are received
3. ✅ Check spam folder placement
4. ✅ Monitor SES dashboard for issues
5. ✅ Set up CloudWatch alarms
6. ✅ Document credentials securely

---

## Support

**AWS SES Documentation:**
- https://docs.aws.amazon.com/ses/

**Common Issues:**
- https://docs.aws.amazon.com/ses/latest/dg/troubleshooting.html

**AWS Support:**
- https://console.aws.amazon.com/support/

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-03  
**Verified Email:** ava.foxwell@sky.uk  
**Region:** eu-west-2 (London)
