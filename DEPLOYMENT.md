# ApplyLog Deployment Guide

## Quick Deploy to Vercel (Frontend) + Railway (Backend)

### 1. Deploy Backend to Railway (FREE)
```bash
# 1. Go to https://railway.app and sign up with GitHub
# 2. Create new project → Deploy from GitHub repo
# 3. Select your ApplyLog repository
# 4. Set these environment variables in Railway:
#    - PORT=8000
#    - MONGODB_URL=your_mongodb_connection_string
# 5. Railway will auto-detect Python and deploy your FastAPI app
```

### 2. Deploy Frontend to Vercel (FREE)
```bash
# 1. Go to https://vercel.com and sign up with GitHub
# 2. Import your ApplyLog repository
# 3. Set build settings:
#    - Framework Preset: Vite
#    - Root Directory: ApplyLog-frontend
#    - Build Command: npm run build
#    - Output Directory: dist
# 4. Add environment variable:
#    - VITE_API_URL=https://your-railway-backend-url.railway.app
```

### 3. Update Frontend Config
Update your API calls to use the environment variable:
```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
```

## Alternative Options:

### Option 2: Netlify + Render (Also FREE)
- Frontend: Netlify (similar to Vercel)
- Backend: Render (similar to Railway)

### Option 3: Self-Hosted VPS
- DigitalOcean Droplet ($5/month)
- AWS EC2 (Free tier for 1 year)
- Linode ($5/month)

### Option 4: Local Network Access
- Keep running locally but access from any device on your network
- Set up dynamic DNS for remote access

## Security Features:
- Add authentication (login/password)
- Environment-based configuration
- HTTPS encryption (automatic with Vercel/Railway)
- Private repository keeps your code secure

## Custom Domain (Optional):
- Buy a domain ($10-15/year)
- Connect to Vercel for professional URL
- Example: applylog.yourdomain.com
