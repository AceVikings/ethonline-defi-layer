# GCP Deployment Guide

This guide will help you deploy both backend services (Node.js and Python) to a single GCP VM using GitHub Actions.

## Prerequisites

1. **GCP Account** with a project created
2. **GitHub Repository** with admin access
3. **Render** account for frontend hosting (already setup)

## Step 1: Create GCP VM

### Option A: Using GCP Console

1. Go to [GCP Compute Engine](https://console.cloud.google.com/compute/instances)
2. Click "CREATE INSTANCE"
3. Configure the VM:
   - **Name**: `deflow-backend` (or your preferred name)
   - **Region**: Choose closest to your users (e.g., `us-central1`)
   - **Zone**: `us-central1-a` (or any zone in your region)
   - **Machine type**: `e2-micro` (cheapest option, 2 vCPU, 1GB RAM)
   - **Boot disk**: Ubuntu 22.04 LTS, 10GB standard persistent disk
   - **Firewall**: Allow HTTP and HTTPS traffic
4. Click "CREATE"

### Option B: Using gcloud CLI

```bash
gcloud compute instances create deflow-backend \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=10GB \
  --boot-disk-type=pd-standard \
  --tags=http-server,https-server
```

## Step 2: Configure Firewall Rules

Allow traffic on ports 3001 (Node.js) and 8080 (Python):

```bash
# Create firewall rule for Node.js backend
gcloud compute firewall-rules create allow-nodejs-backend \
  --allow tcp:3001 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server

# Create firewall rule for Python backend  
gcloud compute firewall-rules create allow-python-backend \
  --allow tcp:8080 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server
```

## Step 3: Create GCP Service Account

1. Go to [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click "CREATE SERVICE ACCOUNT"
3. Fill in:
   - **Name**: `github-actions-deployer`
   - **Description**: Service account for GitHub Actions deployments
4. Click "CREATE AND CONTINUE"
5. Grant roles:
   - **Compute Admin** (`roles/compute.admin`)
   - **Service Account User** (`roles/iam.serviceAccountUser`)
6. Click "CONTINUE" then "DONE"
7. Click on the created service account
8. Go to "KEYS" tab
9. Click "ADD KEY" > "Create new key"
10. Select JSON format
11. Click "CREATE" - this downloads the JSON key file

## Step 4: Set Up GitHub Secrets

Go to your GitHub repository > Settings > Secrets and variables > Actions

Add the following secrets:

### GCP Configuration
- `GCP_SA_KEY`: Paste the entire contents of the JSON key file
- `GCP_VM_NAME`: `deflow-backend` (or your VM name)
- `GCP_ZONE`: `us-central1-a` (or your zone)
- `GCP_PROJECT_ID`: Your GCP project ID

### Node.js Backend (.env variables)
- `MONGODB_URI`: Your MongoDB connection string (e.g., MongoDB Atlas)
- `VINCENT_APP_ID`: Your Vincent app ID
- `VINCENT_ALLOWED_AUDIENCE`: Your production frontend URL (e.g., `https://your-app.onrender.com/auth/callback`)
- `VINCENT_DELEGATEE_PRIVATE_KEY`: Your Vincent delegatee private key
- `LIT_NETWORK`: `datil` (or `habanero` for testnet)
- `RPC_ETHEREUM`: Alchemy/Infura RPC URL
- `RPC_SEPOLIA`: Testnet RPC URL
- `RPC_POLYGON`: Polygon RPC URL
- `RPC_ARBITRUM`: Arbitrum RPC URL
- `RPC_OPTIMISM`: Optimism RPC URL
- `RPC_BASE`: Base RPC URL
- `RPC_BNB`: BNB Chain RPC URL
- `RPC_AVALANCHE`: Avalanche RPC URL
- `RPC_CELO`: Celo RPC URL
- `RPC_BASESEPOLIA`: Base Sepolia RPC URL
- `RPC_ARBITRUMSEPOLIA`: Arbitrum Sepolia RPC URL
- `RPC_OPTIMISMSEPOLIA`: Optimism Sepolia RPC URL
- `RPC_AVALANCHEFUJI`: Avalanche Fuji RPC URL
- `RPC_POLYGONMUMBAI`: Polygon Amoy RPC URL
- `RPC_BNBTESTNET`: BNB Testnet RPC URL

### Python Backend (.env variables)
- `ASI_ONE_API_KEY`: Your ASI:One API key
- `AGENTVERSE_API_TOKEN`: Your Agentverse API token
- `UAGENT_SEED`: Random seed for uAgent (change in production)
- `UAGENT_MAILBOX_KEY`: Your uAgent mailbox key

## Step 5: Setup MongoDB (if needed)

If you don't have MongoDB yet:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist all IPs (0.0.0.0/0) or your VM's IP
5. Get connection string and add to `MONGODB_URI` secret

## Step 6: Deploy

Once all secrets are configured:

1. Push to main branch:
```bash
git add .
git commit -m "Setup GCP deployment"
git push origin main
```

2. GitHub Actions will automatically:
   - Authenticate to GCP
   - SSH into your VM
   - Install dependencies (Node.js, Python, PM2)
   - Clone/update the repository
   - Create .env files from secrets
   - Install npm and pip packages
   - Start both backends with PM2
   - Configure PM2 to auto-start on reboot

3. Monitor deployment:
   - Go to GitHub > Actions tab
   - Click on the running workflow
   - Watch the logs

## Step 7: Verify Deployment

SSH into your VM:
```bash
gcloud compute ssh deflow-backend --zone=us-central1-a
```

Check running services:
```bash
pm2 list
pm2 logs
```

Test endpoints:
```bash
curl http://localhost:3001/health
curl http://localhost:8080/health
```

## Step 8: Update Frontend Environment

Update your frontend on Render to point to your GCP VM:

1. Get your VM's external IP:
```bash
gcloud compute instances describe deflow-backend --zone=us-central1-a --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

2. Update Render environment variable:
   - Go to Render Dashboard > Your Frontend Service
   - Environment tab
   - Update `VITE_API_URL` to `http://YOUR_VM_IP:3001`
   - Save changes

## Monitoring & Maintenance

### View Logs
```bash
pm2 logs deflow-backend
pm2 logs deflow-python
```

### Restart Services
```bash
pm2 restart deflow-backend
pm2 restart deflow-python
```

### Update Code Manually
```bash
cd /opt/deflow
git pull origin main
pm2 restart all
```

### Monitor Resources
```bash
pm2 monit
```

## Cost Optimization

The e2-micro instance is part of GCP's free tier (1 instance per month in us-central1, us-east1, or us-west1).

**Estimated monthly cost**: $0 - $7/month
- VM: Free (if in free tier region) or ~$7/month
- Network egress: First 1GB free, then $0.12/GB
- Storage: 10GB standard disk ~$0.40/month

## Troubleshooting

### Deployment fails
- Check GitHub Actions logs
- Verify all secrets are set correctly
- Ensure VM has enough resources

### Services won't start
```bash
# SSH into VM
gcloud compute ssh deflow-backend --zone=us-central1-a

# Check logs
journalctl -u pm2-$USER -f
pm2 logs --err
```

### Out of memory
Upgrade to e2-small (2GB RAM) for $13/month:
```bash
gcloud compute instances stop deflow-backend --zone=us-central1-a
gcloud compute instances set-machine-type deflow-backend --machine-type=e2-small --zone=us-central1-a
gcloud compute instances start deflow-backend --zone=us-central1-a
```

## Security Recommendations

1. **Firewall**: Restrict source IPs if possible
2. **HTTPS**: Set up nginx reverse proxy with Let's Encrypt SSL
3. **Secrets**: Rotate keys regularly
4. **Updates**: Keep packages updated
5. **Monitoring**: Set up Cloud Monitoring alerts

## Next Steps

- [ ] Configure custom domain
- [ ] Set up HTTPS with nginx + Let's Encrypt
- [ ] Enable GCP Cloud Monitoring
- [ ] Set up automated backups
- [ ] Configure log rotation
