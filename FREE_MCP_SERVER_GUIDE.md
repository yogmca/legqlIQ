# Free Open Source MCP Servers for Node.js on AWS EC2

## What is MCP (Model Context Protocol)?

MCP is an open protocol developed by Anthropic that enables AI assistants to securely connect to external data sources and tools. It provides a standardized way for AI models to interact with various services.

## Top Free Open Source MCP Servers for Node.js

### 1. **@modelcontextprotocol/server-everything** (Official)
- **Repository**: https://github.com/modelcontextprotocol/servers
- **License**: MIT
- **Description**: Official MCP server implementation with multiple built-in integrations
- **Features**:
  - File system access
  - Database connections
  - API integrations
  - Tool execution
  - Resource management

### 2. **@modelcontextprotocol/server-filesystem**
- **Repository**: https://github.com/modelcontextprotocol/servers
- **License**: MIT
- **Description**: Lightweight MCP server for file system operations
- **Best for**: File management, document processing

### 3. **@modelcontextprotocol/server-memory**
- **Repository**: https://github.com/modelcontextprotocol/servers
- **License**: MIT
- **Description**: In-memory storage MCP server
- **Best for**: Caching, session management

### 4. **Custom Node.js MCP Server**
- Build your own using the official SDK
- Full control over features and resources
- Minimal dependencies

## Recommended: Official MCP Server SDK

The best option is to use the official **@modelcontextprotocol/sdk** to build a custom server.

### Installation

```bash
npm install @modelcontextprotocol/sdk
```

### Basic MCP Server Example

```javascript
// server.js
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Create server instance
const server = new Server(
  {
    name: "my-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "echo",
        description: "Echoes back the input text",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "Text to echo",
            },
          },
          required: ["text"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "echo") {
    return {
      content: [
        {
          type: "text",
          text: args.text,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running on stdio");
}

main().catch(console.error);
```

## AWS EC2 Free Tier Setup

### 1. **EC2 Instance Specifications**
- **Instance Type**: t2.micro (Free tier eligible)
- **OS**: Ubuntu 22.04 LTS or Amazon Linux 2023
- **Storage**: 30GB EBS (Free tier)
- **Memory**: 1GB RAM
- **vCPUs**: 1

### 2. **Setup Steps**

#### Step 1: Launch EC2 Instance
```bash
# Use AWS Console or CLI
aws ec2 run-instances \
  --image-id ami-xxxxxxxxx \
  --instance-type t2.micro \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxxxxxx
```

#### Step 2: Connect to Instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

#### Step 3: Install Node.js
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Step 4: Setup MCP Server
```bash
# Create project directory
mkdir mcp-server
cd mcp-server

# Initialize project
npm init -y

# Install dependencies
npm install @modelcontextprotocol/sdk

# Create server file
nano server.js
# (Paste the server code from above)
```

#### Step 5: Setup PM2 for Process Management
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start server with PM2
pm2 start server.js --name mcp-server

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs
```

#### Step 6: Configure Security Group
```bash
# Open required ports in AWS Console:
# - Port 22 (SSH)
# - Port 3000 (or your MCP server port)
# - Port 80/443 (if using HTTP/HTTPS)
```

### 3. **Environment Configuration**

Create `.env` file:
```bash
# .env
NODE_ENV=production
PORT=3000
MCP_SERVER_NAME=my-mcp-server
LOG_LEVEL=info
```

### 4. **Nginx Reverse Proxy (Optional)**

```bash
# Install Nginx
sudo apt install nginx -y

# Configure Nginx
sudo nano /etc/nginx/sites-available/mcp-server
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mcp-server /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Alternative Free MCP Servers

### 1. **mcp-server-sqlite**
```bash
npm install @modelcontextprotocol/server-sqlite
```
- SQLite database integration
- Perfect for lightweight data storage

### 2. **mcp-server-fetch**
```bash
npm install @modelcontextprotocol/server-fetch
```
- HTTP request capabilities
- API integration

### 3. **mcp-server-github**
```bash
npm install @modelcontextprotocol/server-github
```
- GitHub API integration
- Repository management

## Cost Optimization Tips

1. **Use AWS Free Tier**
   - 750 hours/month of t2.micro
   - 30GB EBS storage
   - 15GB data transfer out

2. **Monitor Usage**
   ```bash
   # Check resource usage
   htop
   df -h
   free -m
   ```

3. **Setup Alerts**
   - Configure AWS CloudWatch alarms
   - Monitor billing dashboard

4. **Optimize Node.js**
   ```bash
   # Use production mode
   NODE_ENV=production node server.js
   
   # Limit memory
   node --max-old-space-size=512 server.js
   ```

## Testing Your MCP Server

```bash
# Test locally
node server.js

# Test with curl (if HTTP endpoint)
curl http://localhost:3000/health

# Check PM2 status
pm2 status
pm2 logs mcp-server
```

## Monitoring and Maintenance

```bash
# View logs
pm2 logs mcp-server

# Restart server
pm2 restart mcp-server

# Update server
git pull
npm install
pm2 restart mcp-server

# Monitor resources
pm2 monit
```

## Security Best Practices

1. **Firewall Configuration**
```bash
sudo ufw enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
```

2. **Keep System Updated**
```bash
sudo apt update && sudo apt upgrade -y
```

3. **Use Environment Variables**
- Never commit secrets to Git
- Use `.env` files
- Rotate credentials regularly

4. **Enable HTTPS**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## Resources

- **MCP Documentation**: https://modelcontextprotocol.io
- **GitHub Repository**: https://github.com/modelcontextprotocol/servers
- **AWS Free Tier**: https://aws.amazon.com/free
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

## Quick Start Command Summary

```bash
# On EC2 instance
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
mkdir mcp-server && cd mcp-server
npm init -y
npm install @modelcontextprotocol/sdk
# Create server.js with your code
pm2 start server.js --name mcp-server
pm2 save
pm2 startup
```

## Conclusion

The **@modelcontextprotocol/sdk** is the best choice for building a custom MCP server on AWS EC2 free tier. It's:
- ✅ Free and open source (MIT license)
- ✅ Official implementation by Anthropic
- ✅ Well-documented
- ✅ Actively maintained
- ✅ Lightweight enough for t2.micro
- ✅ Fully compatible with Node.js

Start with the basic example above and extend it based on your specific needs!
