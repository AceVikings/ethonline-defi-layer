# 🚀 Quick Setup Guide

## ✅ Completed
- Vincent App ID configured: `4842169595`
- Frontend .env created with correct App ID
- Backend .env created with correct App ID
- .gitignore updated to prevent .env commits
- MongoDB URI set to: `mongodb://localhost:27017/deflow`

## ⚠️ Action Required

### 1. Add Delegatee Private Key

You need to add a delegatee EOA private key to the backend `.env` file:

```bash
cd backend
# Edit .env and add your delegatee private key:
VINCENT_DELEGATEE_PRIVATE_KEY=your_private_key_here
```

**To get a delegatee address:**
- Use an existing EOA you control (e.g., MetaMask wallet)
- OR create a new one: https://vanity-eth.tk/
- Export the private key (without 0x prefix)
- Add it to Vincent App settings on the dashboard

### 2. Configure Vincent App on Dashboard

Go to [Vincent Dashboard](https://dashboard.heyvincent.ai) and configure your app (ID: 4842169595):

1. **Add Delegatee Address:**
   - Settings → Delegatee Addresses
   - Add the Ethereum address for your private key

2. **Add Redirect URI:**
   - Settings → Redirect URIs
   - Add: `http://localhost:5176/auth/callback`

3. **Add Abilities:**
   - Go to Abilities tab
   - Add these abilities:
     - ✅ Uniswap Swap
     - ✅ Aave V3 Supply/Borrow
     - ✅ ERC20 Approval
     - ✅ ERC20 Transfer

4. **Publish App Version:**
   - Click "Publish App Version"
   - This registers your app on-chain

### 3. Start MongoDB

If MongoDB isn't running:

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or check if already running
brew services list | grep mongodb

# Or with Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Install Backend Dependencies

```bash
cd backend
npm install
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Test the Application

1. Open http://localhost:5176
2. Click "Connect with Vincent"
3. Authenticate with Vincent (email/phone/passkey)
4. You should be redirected to `/app` dashboard
5. Check user info is displayed correctly

## 🔍 Troubleshooting

### "No delegatee private key" error
- Make sure you added `VINCENT_DELEGATEE_PRIVATE_KEY` in `backend/.env`
- Remove any "0x" prefix from the private key

### "Invalid redirect URI" error
- Check that `http://localhost:5176/auth/callback` is added to Vincent App settings
- Make sure the URL exactly matches (including http vs https)

### MongoDB connection error
- Check MongoDB is running: `brew services list | grep mongodb`
- Test connection: `mongosh mongodb://localhost:27017/deflow`

### Vincent authentication fails
- Verify App ID in both `.env` files matches: `4842169595`
- Check Vincent App is published
- Clear browser localStorage and try again

## 📝 Environment Variables Summary

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3001
VITE_VINCENT_APP_ID=4842169595
VITE_REDIRECT_URI=http://localhost:5176/auth/callback
```

**Backend (.env):**
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/deflow
VINCENT_APP_ID=4842169595
VINCENT_ALLOWED_AUDIENCE=http://localhost:5176
VINCENT_DELEGATEE_PRIVATE_KEY=<YOUR_PRIVATE_KEY>
CORS_ORIGIN=http://localhost:5176
```

## ✅ Verification Checklist

- [ ] MongoDB is running
- [ ] Backend dependencies installed (`npm install` in backend/)
- [ ] Delegatee private key added to `backend/.env`
- [ ] Delegatee address added to Vincent App settings
- [ ] Redirect URI added to Vincent App settings
- [ ] Abilities added to Vincent App
- [ ] App version published
- [ ] Backend running on port 3001
- [ ] Frontend running on port 5176
- [ ] Successfully connected with Vincent
- [ ] User info displayed on dashboard

## 🎯 Next Steps

Once authentication is working:
1. Build the workflow builder UI
2. Integrate Avail Nexus SDK
3. Create custom AI decision ability
4. Test end-to-end workflows
5. Deploy to production

---

**Need Help?**
- Vincent Docs: https://docs.heyvincent.ai
- Vincent Dashboard: https://dashboard.heyvincent.ai
- Avail Docs: https://docs.availproject.org
