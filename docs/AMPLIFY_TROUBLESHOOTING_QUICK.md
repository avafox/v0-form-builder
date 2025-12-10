# Quick Amplify Troubleshooting

## Getting 403 Error?

### 1. Check Build Logs
\`\`\`
Amplify Console → Your App → Latest Build → Expand all phases
Look for RED errors
\`\`\`

### 2. Most Common Issues

**Missing Environment Variables**
\`\`\`
Amplify Console → Environment variables
Add all variables from ENVIRONMENT_VARIABLES.md
Click "Save"
Redeploy
\`\`\`

**Wrong Output Directory**
\`\`\`yaml
# In amplify.yml, should be:
artifacts:
  baseDirectory: .next
\`\`\`

**Node.js Version**
\`\`\`yaml
# In amplify.yml, add to preBuild:
- nvm use 18
\`\`\`

**Missing package-lock.json**
\`\`\`bash
# In your local repo:
npm install
git add package-lock.json
git commit -m "Add lock file"
git push
\`\`\`

### 3. Quick Test

**Build Locally:**
\`\`\`bash
npm ci
npm run build
npm start
\`\`\`

If it works locally but fails on Amplify → Environment variable issue

### 4. Emergency Simple Config

Replace `next.config.mjs` with:

\`\`\`javascript
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
}
export default nextConfig
\`\`\`

### 5. Check These URLs

After deployment:
- `https://your-app.amplifyapp.com/` → Should show homepage
- `https://your-app.amplifyapp.com/communications` → Should show editor
- Browser console → Should show no 403 errors

### 6. Still Broken?

1. Check build image: Amazon Linux 2023
2. Check Node version: 18+
3. Verify all env vars have no typos
4. Check app uses `output: 'standalone'`

### 7. Get Help

Post in Amplify support with:
- App ID
- Build ID  
- Screenshot of error
- Build logs (copy/paste)
