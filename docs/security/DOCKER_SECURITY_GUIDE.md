# 🔐 Docker Security & Deployment Guide

This guide covers the secure Docker setup for the Local Byron Wade platform, implementing enterprise-grade security practices.

## 🛡️ Security Features Implemented

### Container Security
- **Non-root user**: Application runs as `nextjs` user (UID 1001)
- **Read-only filesystem**: Production containers use read-only root filesystem
- **Capability dropping**: Removes all unnecessary Linux capabilities
- **No new privileges**: Prevents privilege escalation
- **Resource limits**: CPU and memory constraints prevent resource exhaustion
- **Security options**: Implements `no-new-privileges` security context

### Application Security
- **Security headers**: Comprehensive HTTP security headers via Next.js
- **Content Security Policy**: Strict CSP to prevent XSS attacks
- **Health checks**: Built-in health monitoring endpoint
- **Minimal attack surface**: Only necessary files included in production image
- **Secrets management**: Environment variables kept out of Docker images

### Network Security
- **Custom bridge network**: Isolated container network
- **Port restrictions**: Only necessary ports exposed
- **Network segmentation**: Separate networks for dev/prod environments

## 📁 File Structure

```
├── Dockerfile              # Production build (multi-stage)
├── Dockerfile.dev          # Development build (hot-reload)
├── docker-compose.yml      # Production deployment
├── docker-compose.dev.yml  # Development environment
├── .dockerignore           # Security-focused ignore file
└── DOCKER_SECURITY_GUIDE.md # This guide
```

## 🚀 Quick Start

### Development Environment
```bash
# Start development environment with hot-reload
docker-compose -f docker-compose.dev.yml up --build

# Access the application
open http://localhost:3000

# View health status
curl http://localhost:3000/api/health
```

### Production Deployment
```bash
# Build and start production environment
docker-compose up --build -d

# Check container health
docker-compose ps

# View logs
docker-compose logs -f app

# Health check
curl http://localhost:3000/api/health
```

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env` file with the following variables:

```bash
# Application
NODE_ENV=production
PORT=3000
NEXT_TELEMETRY_DISABLED=1

# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=your_database_url

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# External APIs
GOOGLE_MAPS_API_KEY=your_google_maps_key
OPENAI_API_KEY=your_openai_key

# Security
WEBHOOK_SECRET=your_webhook_secret
ENCRYPTION_KEY=your_encryption_key
```

### Security Best Practices for Environment Variables

1. **Never commit `.env` files to version control**
2. **Use different keys for different environments**
3. **Rotate secrets regularly**
4. **Use external secrets management in production (AWS Secrets Manager, Azure Key Vault, etc.)**

## 🏗️ Build Process

### Production Build Stages

1. **Dependencies Stage**: Installs only production dependencies
2. **Builder Stage**: Builds the Next.js application
3. **Runner Stage**: Creates minimal production runtime

### Build Commands

```bash
# Build production image
docker build -t local-byronwade:latest .

# Build development image
docker build -f Dockerfile.dev -t local-byronwade:dev .

# Build with specific target
docker build --target builder -t local-byronwade:builder .
```

## 📊 Monitoring & Health Checks

### Health Check Endpoint

The application includes a comprehensive health check at `/api/health`:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "memoryUsage": {
    "rss": 256,
    "heapTotal": 128,
    "heapUsed": 64
  }
}
```

### Container Monitoring

```bash
# Monitor container stats
docker stats local-byronwade-app

# Check container health
docker inspect --format='{{.State.Health.Status}}' local-byronwade-app

# View detailed health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' local-byronwade-app
```

## 🔒 Security Checklist

### Pre-deployment Security Audit

- [ ] **Environment variables are secure and not in code**
- [ ] **Secrets are rotated and use strong entropy**
- [ ] **Security headers are properly configured**
- [ ] **Content Security Policy is restrictive**
- [ ] **Dependencies are up-to-date and scanned for vulnerabilities**
- [ ] **Container runs as non-root user**
- [ ] **File permissions are restrictive**
- [ ] **Network access is limited**
- [ ] **Resource limits are configured**
- [ ] **Health checks are working**

### Runtime Security Monitoring

```bash
# Scan for vulnerabilities
docker scout cves local-byronwade:latest

# Check for security updates
docker scout recommendations local-byronwade:latest

# Monitor container behavior
docker logs -f local-byronwade-app | grep -E "(error|warning|security)"
```

## 🚨 Incident Response

### Container Issues

```bash
# Emergency container restart
docker-compose restart app

# Scale down for maintenance
docker-compose down

# Check container logs for issues
docker-compose logs --tail=100 app

# Emergency shell access (development only)
docker-compose exec app-dev sh
```

### Security Incidents

1. **Immediate Actions**:
   - Scale down affected containers
   - Preserve logs for analysis
   - Rotate all secrets and keys
   - Check for unauthorized access

2. **Investigation**:
   - Analyze container logs
   - Check network connections
   - Review resource usage patterns
   - Audit file system changes

3. **Recovery**:
   - Deploy patched version
   - Update security configurations
   - Implement additional monitoring
   - Document lessons learned

## 🔧 Maintenance

### Regular Maintenance Tasks

```bash
# Update base images monthly
docker pull node:20-alpine
docker-compose build --no-cache

# Clean up unused images/containers weekly
docker system prune -a

# Update dependencies
docker-compose exec app bun update

# Security scan monthly
docker scout cves local-byronwade:latest
```

### Performance Optimization

```bash
# Optimize image size
docker images | grep local-byronwade

# Monitor resource usage
docker stats --no-stream local-byronwade-app

# Analyze build time
time docker build -t local-byronwade:latest .
```

## 📈 Production Deployment

### Recommended Production Setup

1. **Load Balancer**: Use Nginx or cloud load balancer
2. **SSL/TLS**: Terminate SSL at load balancer level
3. **Monitoring**: Implement Prometheus/Grafana or cloud monitoring
4. **Logging**: Use centralized logging (ELK stack or cloud logging)
5. **Backup**: Regular automated backups of data and configurations
6. **Scaling**: Use Docker Swarm or Kubernetes for horizontal scaling

### Cloud Deployment Examples

#### AWS ECS
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY
docker build -t local-byronwade:latest .
docker tag local-byronwade:latest $ECR_REGISTRY/local-byronwade:latest
docker push $ECR_REGISTRY/local-byronwade:latest
```

#### Google Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/$PROJECT_ID/local-byronwade
gcloud run deploy --image gcr.io/$PROJECT_ID/local-byronwade --platform managed
```

## 🆘 Troubleshooting

### Common Issues

1. **Container won't start**
   - Check environment variables
   - Verify port availability
   - Review health check logs

2. **Permission denied errors**
   - Verify user ownership
   - Check file permissions
   - Ensure proper user context

3. **Network connectivity issues**
   - Check network configuration
   - Verify port mappings
   - Test DNS resolution

4. **Performance problems**
   - Monitor resource usage
   - Check for memory leaks
   - Analyze slow queries

### Debug Commands

```bash
# Interactive shell (development only)
docker-compose exec app-dev sh

# Check environment variables
docker-compose exec app printenv

# Verify file permissions
docker-compose exec app ls -la /app

# Test network connectivity
docker-compose exec app wget -qO- http://localhost:3000/api/health
```

## 📚 Additional Resources

- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp)
- [OWASP Container Security](https://owasp.org/www-project-docker-security/)

---

**⚠️ Security Notice**: This setup implements multiple layers of security, but security is an ongoing process. Regularly update dependencies, rotate secrets, and monitor for security vulnerabilities.
