# Render Backend Deployment Guide

This guide will help you deploy only the Python backend to Render when you have a full-stack repository with both frontend and backend code.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **MongoDB Database**: Set up a MongoDB Atlas cluster or use another MongoDB service
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)

## Method 1: Using render.yaml (Recommended)

### Step 1: Repository Setup

Your repository structure should look like this:
```
your-repo/
├── frontend/          # React app (deployed separately to Vercel)
├── backend/           # Python FastAPI backend (deploy this to Render)
│   ├── server.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── start.sh
├── render.yaml        # Render configuration
└── README.md
```

### Step 2: Configure Environment Variables

Before deploying, you'll need these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `DB_NAME` | Database name | `shop_inventory` |
| `CORS_ORIGINS` | Allowed frontend URLs | `https://your-app.vercel.app` |

### Step 3: Deploy to Render

1. **Connect Repository**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub/GitLab repository
   - Render will automatically detect the `render.yaml` file

2. **Set Environment Variables**:
   - In the Render dashboard, go to your service
   - Click "Environment"
   - Add the required environment variables:
     ```
     MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
     DB_NAME=shop_inventory
     CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000
     ```

3. **Deploy**:
   - Click "Deploy Latest Commit"
   - Render will build and deploy only the backend from the `/backend` directory

## Method 2: Manual Web Service Creation

If you prefer not to use `render.yaml`:

### Step 1: Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your repository
4. Configure the service:

   **Basic Settings:**
   - **Name**: `shop-inventory-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`

   **Build & Deploy:**
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

### Step 2: Environment Variables

Add these in the "Environment" section:
```
MONGO_URL=your_mongodb_connection_string
DB_NAME=shop_inventory
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

## Method 3: Using Docker (Alternative)

If you want to use the provided Dockerfile:

1. **Render Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `docker build -t backend .`
   - **Start Command**: `docker run -p $PORT:10000 backend`

## MongoDB Setup (MongoDB Atlas)

1. **Create Cluster**:
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a free cluster
   - Create a database user
   - Whitelist your IP (or use 0.0.0.0/0 for all IPs)

2. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## Testing Your Deployment

After deployment, test these endpoints:

1. **Health Check**: `https://your-app.onrender.com/api`
2. **Get Products**: `https://your-app.onrender.com/api/products`
3. **API Docs**: `https://your-app.onrender.com/docs`

## Updating Frontend Configuration

Once your backend is deployed, update your frontend's environment variables:

**In Vercel Dashboard:**
```
REACT_APP_BACKEND_URL=https://your-backend-app.onrender.com
```

**Or in your frontend config:**
```javascript
// frontend/src/config.js
const config = {
  BACKEND_URL: 'https://your-backend-app.onrender.com',
  // ... other config
};
```

## Common Issues & Solutions

### 1. Build Failures

**Issue**: "No module named 'xyz'"
**Solution**: Ensure all dependencies are in `requirements.txt`

### 2. Database Connection Issues

**Issue**: "Connection refused" or "Authentication failed"
**Solution**: 
- Check MongoDB Atlas network access
- Verify connection string and credentials
- Ensure database user has proper permissions

### 3. CORS Errors

**Issue**: Frontend can't connect to backend
**Solution**:
- Add your Vercel domain to `CORS_ORIGINS`
- Format: `https://your-app.vercel.app,http://localhost:3000`

### 4. Port Issues

**Issue**: Application not responding
**Solution**: Ensure your app uses the `$PORT` environment variable:
```python
# In server.py, use:
import os
port = int(os.environ.get("PORT", 10000))
```

### 5. Slow Cold Starts

**Issue**: First request takes long time
**Solution**: 
- Upgrade to a paid plan for faster cold starts
- Implement a keep-alive mechanism
- Consider using Render's cron jobs to ping your service

## Performance Optimization

1. **Database Indexing**: Add indexes to frequently queried fields
2. **Connection Pooling**: Motor (MongoDB driver) handles this automatically
3. **Caching**: Consider adding Redis for caching frequent queries
4. **Environment**: Use production settings in `server.py`

## Monitoring & Logs

1. **Logs**: View in Render dashboard under "Logs"
2. **Metrics**: Monitor CPU, memory usage in dashboard
3. **Health Checks**: Render automatically monitors `/api` endpoint
4. **Alerts**: Set up email alerts for service failures

## Scaling

1. **Vertical Scaling**: Upgrade to higher-tier plans for more CPU/RAM
2. **Horizontal Scaling**: Not available on free tier
3. **Database Scaling**: MongoDB Atlas handles this automatically

## Security Best Practices

1. **Environment Variables**: Never commit secrets to git
2. **CORS**: Restrict to specific domains in production
3. **HTTPS**: Render provides SSL certificates automatically
4. **Database**: Use strong passwords and IP whitelisting

## Cost Optimization

1. **Free Tier**: 750 hours/month free (about 1 month of continuous running)
2. **Sleep Mode**: Free services sleep after 15 minutes of inactivity
3. **Paid Plans**: Start at $7/month for always-on services

## Deployment Checklist

- [ ] MongoDB database is set up and accessible
- [ ] Environment variables are configured in Render
- [ ] Backend deploys successfully
- [ ] Health check endpoint returns 200
- [ ] API endpoints work correctly
- [ ] Frontend can connect to backend
- [ ] CORS is properly configured
- [ ] Database operations work (CRUD)

## Support Resources

- [Render Documentation](https://render.com/docs)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Render Community](https://community.render.com/)

## Next Steps

1. Deploy your backend using this guide
2. Update your frontend configuration with the backend URL
3. Test the full-stack application
4. Set up monitoring and alerts
5. Consider upgrading to paid plans for production use 