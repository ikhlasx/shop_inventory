# Vercel Deployment Guide

This guide will help you deploy your React app to Vercel successfully.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)
3. **Backend API**: Ensure your backend is deployed and accessible

## Step 1: Prepare Your Backend

Before deploying the frontend, make sure your backend is deployed and accessible:

1. Deploy your Python backend to a service like:
   - Heroku
   - Railway
   - DigitalOcean App Platform
   - AWS/GCP/Azure

2. Note your backend URL (e.g., `https://your-app.herokuapp.com`)

## Step 2: Configure Environment Variables

In your Vercel dashboard, set these environment variables:

```bash
REACT_APP_BACKEND_URL=https://your-backend-domain.com
DISABLE_HOT_RELOAD=true
```

## Step 3: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend` (if your repo has both frontend/backend)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Click "Deploy"

### Option B: Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Navigate to your frontend directory:
   ```bash
   cd frontend
   ```

3. Deploy:
   ```bash
   vercel
   ```

## Step 4: Configure Custom Domain (Optional)

1. In your Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Step 5: Verify Deployment

1. Check that your app loads without errors
2. Test all major functionality:
   - Scanning barcodes
   - Adding products
   - Viewing products
   - Sales tracking
3. Check browser console for any errors

## Troubleshooting

### Common Issues

#### 1. Build Failures
- **Error**: "Module not found"
- **Solution**: Ensure all dependencies are in `package.json` and run `npm install`

#### 2. Environment Variables Not Working
- **Error**: `BACKEND_URL` is undefined
- **Solution**: 
  - Check environment variables in Vercel dashboard
  - Ensure variable names start with `REACT_APP_`
  - Redeploy after adding variables

#### 3. Routing Issues
- **Error**: 404 errors on page refresh
- **Solution**: The `vercel.json` file should handle this automatically

#### 4. API Connection Issues
- **Error**: CORS errors or connection failures
- **Solution**: 
  - Check backend URL is correct
  - Ensure backend allows requests from your Vercel domain
  - Check backend is running and accessible

#### 5. Large Bundle Size
- **Warning**: Build size too large
- **Solution**: 
  - Use dynamic imports for heavy components
  - Optimize images and assets
  - Consider code splitting

### Performance Optimization

1. **Enable Compression**: Vercel automatically compresses static assets
2. **CDN**: Vercel provides global CDN for fast loading
3. **Caching**: Static assets are cached automatically

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `REACT_APP_BACKEND_URL` | Your backend API URL | Yes | `https://api.yourapp.com` |
| `DISABLE_HOT_RELOAD` | Disable hot reload in production | No | `true` |

## Post-Deployment Checklist

- [ ] App loads without errors
- [ ] All routes work correctly
- [ ] API calls to backend succeed
- [ ] Mobile responsiveness works
- [ ] Performance is acceptable
- [ ] Environment variables are set correctly
- [ ] Custom domain configured (if applicable)

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review browser console errors
3. Verify environment variables
4. Test locally with production environment
5. Check Vercel status page for service issues

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment/)
- [React Router Deployment](https://reactrouter.com/en/main/start/overview#deployment) 