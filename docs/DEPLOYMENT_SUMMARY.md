# Deployment Setup Complete! 🎉

## What Was Created

### 1. GitHub Actions Workflow
- **File**: `.github/workflows/deploy-gcp.yml`
- **Purpose**: Automatically deploy both backends to GCP VM on push to main
- **Features**:
  - Authenticates to GCP using service account
  - Installs Node.js, Python, and PM2 on VM
  - Creates .env files from GitHub secrets
  - Deploys and starts both backends with PM2
  - Auto-restarts services on VM reboot

### 2. Environment Files
- **`backend/.env.example`**: Already existed, verified correct
- **`backend-python/.env.example`**: Created with all required variables

### 3. Documentation
- **`docs/GCP_DEPLOYMENT.md`**: Comprehensive deployment guide
- **`docs/DEPLOYMENT_CHECKLIST.md`**: Quick checklist and commands
- **`scripts/gcp-vm-setup.sh`**: Initial VM setup script

## Required GitHub Secrets

You need to add these secrets to your GitHub repository:

### GCP Configuration (4 secrets)
```
GCP_SA_KEY              # JSON key from service account
GCP_VM_NAME             # deflow-backend
GCP_ZONE                # us-central1-a
GCP_PROJECT_ID          # Your GCP project ID
```

### Node.js Backend (20+ secrets)
```
MONGODB_URI
VINCENT_APP_ID
VINCENT_ALLOWED_AUDIENCE
VINCENT_DELEGATEE_PRIVATE_KEY
LIT_NETWORK
RPC_ETHEREUM
RPC_SEPOLIA
RPC_POLYGON
RPC_ARBITRUM
RPC_OPTIMISM
RPC_BASE
RPC_BNB
RPC_AVALANCHE
RPC_CELO
RPC_BASESEPOLIA
RPC_ARBITRUMSEPOLIA
RPC_OPTIMISMSEPOLIA
RPC_AVALANCHEFUJI
RPC_POLYGONMUMBAI
RPC_BNBTESTNET
```

### Python Backend (4 secrets)
```
ASI_ONE_API_KEY
AGENTVERSE_API_TOKEN
UAGENT_SEED
UAGENT_MAILBOX_KEY
```

## Quick Start

### Step 1: Create GCP VM
```bash
gcloud compute instances create deflow-backend \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=10GB \
  --tags=http-server,https-server
```

### Step 2: Create Firewall Rules
```bash
gcloud compute firewall-rules create allow-nodejs-backend \
  --allow tcp:3001 --source-ranges 0.0.0.0/0 --target-tags http-server

gcloud compute firewall-rules create allow-python-backend \
  --allow tcp:8080 --source-ranges 0.0.0.0/0 --target-tags http-server
```

### Step 3: Create Service Account
```bash
# Create service account
gcloud iam service-accounts create github-actions-deployer \
  --display-name="GitHub Actions Deployer"

# Grant permissions
PROJECT_ID=$(gcloud config get-value project)

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/compute.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create and download key
gcloud iam service-accounts keys create gcp-key.json \
  --iam-account=github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com

# Display key for copying
cat gcp-key.json
```

### Step 4: Add GitHub Secrets
1. Go to: `https://github.com/AceVikings/ethonline-defi-layer/settings/secrets/actions`
2. Click "New repository secret"
3. Add all secrets listed above

### Step 5: Deploy
```bash
git add .
git commit -m "Setup GCP deployment"
git push origin main
```

### Step 6: Get VM IP for Frontend
```bash
gcloud compute instances describe deflow-backend \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

Update your Render frontend environment variable:
- Variable: `VITE_API_URL`
- Value: `http://<VM_IP>:3001`

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Users                                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend (Render.com)                           │
│              React + Vite                                    │
│              https://your-app.onrender.com                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│          GCP VM (e2-micro - Free Tier)                       │
│          Managed by PM2                                      │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │   Node.js Backend (Port 3001)                      │    │
│  │   - Express API                                    │    │
│  │   - Vincent SDK                                    │    │
│  │   - Workflow execution                             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │   Python Backend (Port 8080)                       │    │
│  │   - Flask API                                      │    │
│  │   - uAgents                                        │    │
│  │   - MeTTa RAG                                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services                               │
│  - MongoDB Atlas                                             │
│  - Vincent/Lit Protocol                                      │
│  - ASI:One                                                   │
│  - Agentverse                                                │
│  - RPC Providers (Alchemy)                                   │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Flow

```
Push to main
     │
     ▼
GitHub Actions Triggered
     │
     ├─► Authenticate to GCP
     │
     ├─► Copy deployment script to VM
     │
     ├─► SSH into VM and execute:
     │   ├─► Install dependencies (Node, Python, PM2)
     │   ├─► Clone/update repository
     │   ├─► Create .env files from secrets
     │   ├─► Install npm packages
     │   ├─► Install pip packages
     │   ├─► Start/restart services with PM2
     │   └─► Configure auto-start on reboot
     │
     └─► Verify deployment
```

## Cost Breakdown

**Monthly Costs (Free Tier Region):**
- VM (e2-micro): $0 (included in free tier)
- Storage (10GB): $0.40
- Network egress: $0 (first 1GB free)
- **Total: ~$0.40/month**

**Monthly Costs (Non-Free Tier):**
- VM (e2-micro): $7.00
- Storage (10GB): $0.40
- Network egress: ~$1.00
- **Total: ~$8.40/month**

**External Services:**
- MongoDB Atlas: $0 (free tier 512MB)
- Render (Frontend): $0 (free tier)
- Alchemy RPC: $0 (free tier)
- **Total External: $0**

**Grand Total: $0.40 - $8.40/month** 🎉

## Monitoring

### View Logs
```bash
# SSH into VM
gcloud compute ssh deflow-backend --zone=us-central1-a

# View all logs
pm2 logs

# View specific service
pm2 logs deflow-backend
pm2 logs deflow-python
```

### Check Status
```bash
pm2 list
pm2 monit
```

### Restart Services
```bash
pm2 restart deflow-backend
pm2 restart deflow-python
pm2 restart all
```

## Next Steps

- [ ] Review `docs/GCP_DEPLOYMENT.md` for detailed guide
- [ ] Review `docs/DEPLOYMENT_CHECKLIST.md` for quick commands
- [ ] Create GCP VM
- [ ] Create service account and get key
- [ ] Add all GitHub secrets
- [ ] Push to main to deploy
- [ ] Update frontend environment variables
- [ ] Test the deployment
- [ ] Set up custom domain (optional)
- [ ] Configure HTTPS with nginx (optional)
- [ ] Set up monitoring alerts (optional)

## Support

If you encounter issues:
1. Check GitHub Actions logs
2. SSH into VM and check PM2 logs
3. Verify all secrets are set correctly
4. Check firewall rules
5. Ensure MongoDB is accessible
6. Verify RPC URLs are working

## Files Created

```
.github/workflows/deploy-gcp.yml    # GitHub Actions workflow
backend-python/.env.example         # Python backend env template
docs/GCP_DEPLOYMENT.md              # Comprehensive guide
docs/DEPLOYMENT_CHECKLIST.md        # Quick reference
scripts/gcp-vm-setup.sh             # VM initialization script
docs/DEPLOYMENT_SUMMARY.md          # This file
```

Happy Deploying! 🚀
