# GCP Deployment Checklist

Quick checklist to deploy both backends to GCP VM.

## ✅ Pre-Deployment Checklist

- [ ] GCP account created
- [ ] GCP project created
- [ ] Billing enabled (for non-free tier regions)
- [ ] GitHub repository access
- [ ] MongoDB Atlas cluster created (or MongoDB URI ready)
- [ ] Vincent App credentials
- [ ] ASI:One API key
- [ ] Agentverse API token
- [ ] Alchemy/RPC provider keys

## 🚀 Quick Deployment Steps

### 1. Create GCP VM (one command)
```bash
gcloud compute instances create deflow-backend \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=10GB \
  --tags=http-server,https-server
```

### 2. Create Firewall Rules
```bash
gcloud compute firewall-rules create allow-nodejs-backend --allow tcp:3001 --source-ranges 0.0.0.0/0 --target-tags http-server
gcloud compute firewall-rules create allow-python-backend --allow tcp:8080 --source-ranges 0.0.0.0/0 --target-tags http-server
```

### 3. Run Initial Setup on VM
```bash
# Copy setup script
gcloud compute scp scripts/gcp-vm-setup.sh deflow-backend:~/ --zone=us-central1-a

# Run setup
gcloud compute ssh deflow-backend --zone=us-central1-a --command="bash ~/gcp-vm-setup.sh"
```

### 4. Create Service Account & Get Key
```bash
# Create service account
gcloud iam service-accounts create github-actions-deployer \
  --display-name="GitHub Actions Deployer"

# Grant permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/compute.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create key
gcloud iam service-accounts keys create gcp-key.json \
  --iam-account=github-actions-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Copy the contents of gcp-key.json for GitHub secret
cat gcp-key.json
```

### 5. Add GitHub Secrets

Go to: `https://github.com/YOUR_USERNAME/ethonline-defi-layer/settings/secrets/actions`

**Required Secrets:**

```
GCP_SA_KEY=<contents of gcp-key.json>
GCP_VM_NAME=deflow-backend
GCP_ZONE=us-central1-a

# Node.js Backend
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/deflow
VINCENT_APP_ID=your_app_id
VINCENT_ALLOWED_AUDIENCE=https://your-frontend.onrender.com/auth/callback
VINCENT_DELEGATEE_PRIVATE_KEY=your_private_key
LIT_NETWORK=datil
RPC_ETHEREUM=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
RPC_SEPOLIA=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
RPC_BASESEPOLIA=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
# ... (add all RPC URLs from .env.example)

# Python Backend
ASI_ONE_API_KEY=your_asi_one_key
AGENTVERSE_API_TOKEN=your_agentverse_token
UAGENT_SEED=production-seed-change-this
UAGENT_MAILBOX_KEY=your_mailbox_key
```

### 6. Deploy
```bash
git add .
git commit -m "Setup GCP deployment"
git push origin main
```

### 7. Get VM IP & Update Frontend
```bash
# Get external IP
gcloud compute instances describe deflow-backend \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# Update Render env var VITE_API_URL to: http://<VM_IP>:3001
```

## 📊 Verify Deployment

```bash
# SSH into VM
gcloud compute ssh deflow-backend --zone=us-central1-a

# Check services
pm2 list
pm2 logs

# Test endpoints
curl http://localhost:3001/health
curl http://localhost:8080/health
```

## 🔧 Useful Commands

```bash
# View logs
pm2 logs deflow-backend
pm2 logs deflow-python

# Restart services  
pm2 restart all

# Monitor resources
pm2 monit

# Manual redeploy
cd /opt/deflow && git pull && pm2 restart all
```

## 💰 Cost Estimate

**Free Tier (us-central1, us-east1, us-west1):**
- VM: $0 (e2-micro included)
- Storage: $0.40/month (10GB)
- Network: $0 (first 1GB free)
- **Total: ~$0.40/month**

**Non-Free Tier:**
- VM: $7/month (e2-micro)
- Storage: $0.40/month (10GB)  
- Network: ~$1/month (estimated)
- **Total: ~$8.40/month**

## ⚠️ Troubleshooting

**Deployment fails:**
- Check GitHub Actions logs
- Verify all secrets are set
- Ensure VM is running

**Out of memory:**
```bash
# Upgrade to e2-small
gcloud compute instances stop deflow-backend --zone=us-central1-a
gcloud compute instances set-machine-type deflow-backend \
  --machine-type=e2-small --zone=us-central1-a
gcloud compute instances start deflow-backend --zone=us-central1-a
```

**Services won't start:**
```bash
# Check system logs
sudo journalctl -u pm2-$USER -f

# Check PM2 logs
pm2 logs --err
```
