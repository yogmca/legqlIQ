# AWS Console Fix - Open Port 5173 for Vite Dev Server

## 🎯 Quick AWS Console Steps

### Step 1: Open AWS Console
1. Go to: https://console.aws.amazon.com/
2. Sign in to your AWS account
3. Make sure you're in the correct region (top right corner)

### Step 2: Navigate to Security Groups
1. In the search bar at the top, type: **EC2**
2. Click on **EC2** (Virtual Servers in the Cloud)
3. In the left sidebar, scroll down to **Network & Security**
4. Click on **Security Groups**

### Step 3: Find Your Security Group
1. You'll see a list of security groups
2. Look for the one with your 3 rules (SSH, HTTP, HTTPS)
3. It's likely named **"launch-wizard-1"** or **"default"**
4. Click the checkbox next to it to select it

### Step 4: Edit Inbound Rules
1. At the bottom of the screen, you'll see tabs
2. Click on the **"Inbound rules"** tab
3. Click the **"Edit inbound rules"** button (orange button on the right)

### Step 5: Add Port 5173 Rule
1. Click **"Add rule"** button at the bottom
2. Fill in the new rule:
   - **Type**: Select **"Custom TCP"** from dropdown
   - **Port range**: Type **5173**
   - **Source**: Select **"My IP"** from dropdown (this will auto-fill your IP)
     - OR manually enter: **Custom** → Type your IP with `/32` (e.g., `203.0.113.45/32`)
   - **Description**: Type **"Vite dev server - temporary"**

### Step 6: Save Rules
1. Click the **"Save rules"** button (orange button at bottom right)
2. Wait for confirmation message: "Successfully modified security group rules"

### Step 7: Verify
1. Go back to the **Inbound rules** tab
2. You should now see **4 rules**:
   - SSH (22) from 0.0.0.0/0
   - HTTP (80) from 0.0.0.0/0
   - HTTPS (443) from 0.0.0.0/0
   - **Custom TCP (5173) from YOUR_IP/32** ← New rule

### Step 8: Test Access
1. Open your browser
2. Go to: `http://13.62.225.158:5173`
3. Your application should now load

## 📸 Visual Guide

```
AWS Console → EC2 → Security Groups → Select your group
                                      ↓
                              Inbound rules tab
                                      ↓
                           Edit inbound rules
                                      ↓
                                 Add rule
                                      ↓
                    Type: Custom TCP, Port: 5173
                    Source: My IP (or YOUR_IP/32)
                                      ↓
                                 Save rules
```

## ⚠️ Important Notes

### Security Warning
- Port 5173 is the **Vite development server**
- This should **NOT** be used in production
- Only open it temporarily for testing
- Restrict to **"My IP"** not **"Anywhere"** (0.0.0.0/0)

### What Each Field Means
- **Type**: The protocol type (Custom TCP for non-standard ports)
- **Port range**: The port number your application uses (5173 for Vite)
- **Source**: Who can access this port
  - **My IP**: Only your current IP address (SECURE)
  - **Anywhere-IPv4** (0.0.0.0/0): Anyone on the internet (INSECURE)
  - **Custom**: Specific IP addresses or ranges

## 🔧 Alternative: Use Port 80 Instead (Better)

Instead of opening port 5173, you can serve your app on port 80 (already open):

### Quick Steps:
1. SSH into your EC2: `ssh -i your-key.pem ec2-user@13.62.225.158`
2. Go to project: `cd ~/karnataka-bar-association`
3. Build app: `npm run build`
4. Install Nginx: `sudo amazon-linux-extras install nginx1 -y`
5. Configure Nginx to serve from `dist` folder
6. Start Nginx: `sudo systemctl start nginx`
7. Access: `http://13.62.225.158` (no port needed)

See [`FIX_PORT_5173_ACCESS.md`](FIX_PORT_5173_ACCESS.md) for detailed Nginx setup.

## 🆘 Troubleshooting

### "I don't see the Edit inbound rules button"
- Make sure you've **selected** the security group (checkbox)
- Check you have permissions to modify security groups

### "My IP option is grayed out"
- Click **Custom** instead
- Get your IP: Open new tab → Google "what is my ip"
- Enter: `YOUR_IP/32` (e.g., `203.0.113.45/32`)

### "Still can't access after adding rule"
1. **Check if Vite is running on EC2**:
   - SSH into EC2
   - Run: `sudo netstat -tulpn | grep 5173`
   - If nothing shows, Vite is not running
   
2. **Start Vite with host flag**:
   ```bash
   cd ~/karnataka-bar-association
   npm run dev -- --host 0.0.0.0 --port 5173
   ```

3. **Check firewall on EC2**:
   ```bash
   # Check if firewall is running
   sudo systemctl status firewalld
   
   # If running, allow port 5173
   sudo firewall-cmd --permanent --add-port=5173/tcp
   sudo firewall-cmd --reload
   ```

### "Changes not taking effect"
- Wait 30-60 seconds for AWS to apply changes
- Refresh your browser
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

## ✅ Verification Checklist

After adding the rule:
- [ ] Security group shows 4 inbound rules
- [ ] Port 5173 rule shows your IP (not 0.0.0.0/0)
- [ ] Vite dev server is running on EC2
- [ ] Can access `http://13.62.225.158:5173` in browser
- [ ] Application loads correctly

## 🔒 Don't Forget: Fix SSH Security

While you're in the security group settings, also fix the SSH rule:

1. Find the **SSH (22)** rule with source **0.0.0.0/0**
2. Click the **X** to delete it
3. Click **Add rule**
4. Type: **SSH**, Port: **22**, Source: **My IP**
5. Description: **"SSH from my IP only"**
6. Save rules

This prevents unauthorized SSH access attempts.

---

**⏱️ Time to complete**: 2-3 minutes

**🎯 Result**: You'll be able to access `http://13.62.225.158:5173`
