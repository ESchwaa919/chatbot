# CHE Chat Widget Deployment Guide

## Render.com Deployment

### Prerequisites
- GitHub account with this repository
- Render.com account
- OpenAI API key

### Step 1: Create Git Repository
```bash
git init
git add .
git commit -m "Initial commit - CHE chat widget"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/che-chat-widget.git
git push -u origin main
```

### Step 2: Deploy to Render
1. Go to [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Use these settings:
   - **Name**: `che-chat-widget`
   - **Environment**: `Node`
   - **Build Command**: `./install.sh`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Step 3: Environment Variables
Add these environment variables in Render dashboard:
- `OPENAI_API_KEY`: Your OpenAI API key
- `NODE_ENV`: `production`
- `PORT`: `10000` (Render default)

### Step 4: Deploy
Click "Create Web Service" and wait for deployment to complete.

## Thinkrific Integration

### Single-Line Script
Copy and paste this into Thinkrific's site footer code section:

```html
<script>(function(){var t=document.querySelector('title'),e=t?t.textContent:'',i=e?btoa(e.split(' ')[0]).replace(/[^a-zA-Z0-9]/g,'').substring(0,8):'87',n=document.createElement('script');n.src='https://YOUR_RENDER_DOMAIN.onrender.com/widget/dist/chat-widget.js',n.defer=!0,n.onload=function(){window.ChatWidget&&window.ChatWidget.init({apiUrl:'https://YOUR_RENDER_DOMAIN.onrender.com',videoId:i,position:'bottom-right',colors:{buttonBackground:'#6B8E5A',buttonHover:'#5A7B4A',userMessageBg:'#6B8E5A',headerBg:'#6B8E5A',chatBorder:'#6B8E5A'},behavior:{autoOpen:!1,persistState:!0}})},document.head.appendChild(n)})();</script>
```

**Important**: Replace `YOUR_RENDER_DOMAIN` with your actual Render domain (e.g., `che-chat-widget.onrender.com`)

### How it Works
1. Extracts video title from page `<title>` tag
2. Creates a consistent video ID from the title
3. Loads the chat widget with CHE branding
4. Positions widget in bottom-right corner
5. Uses CHE green color scheme

### Video ID Mapping
The script automatically maps video titles to IDs:
- Title: "1. Introduction to Homeopathy - Tony Hurley.mp4"
- Generated ID: First 8 characters of base64 encoded first word
- Falls back to ID "87" if no title found

### Customization
You can modify the script to:
- Change widget position
- Adjust colors
- Enable auto-open
- Modify behavior settings

## Testing

### Local Testing
```bash
npm run dev
# Visit http://localhost:3000
```

### Production Testing
1. Test widget load: `https://YOUR_DOMAIN.onrender.com/widget/dist/chat-widget.js`
2. Test API: `https://YOUR_DOMAIN.onrender.com/health`
3. Test chat: `https://YOUR_DOMAIN.onrender.com/video/87`

## Troubleshooting

### Common Issues
1. **Widget not loading**: Check console for 404 errors
2. **Chat not responding**: Verify OpenAI API key is set
3. **CORS errors**: Check domain configuration
4. **Build fails**: Verify all dependencies are installed

### Support
- Check Render logs for deployment issues
- Verify environment variables are set correctly
- Test locally before deploying to production