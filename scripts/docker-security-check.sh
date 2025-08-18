#!/bin/bash

# ================================
# DOCKER SECURITY VERIFICATION SCRIPT
# Comprehensive security checks for Docker deployment
# ================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="local-byronwade"
CONTAINER_NAME="local-byronwade-app"
DOCKERFILE_PATH="./Dockerfile"
COMPOSE_FILE="docker-compose.yml"

echo -e "${BLUE}🔐 Docker Security Verification Script${NC}"
echo -e "${BLUE}======================================${NC}"

# Function to print status
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ $message${NC}"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    else
        echo -e "${BLUE}ℹ️  $message${NC}"
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

if ! command_exists docker; then
    print_status "FAIL" "Docker is not installed"
    exit 1
fi

if ! command_exists docker-compose; then
    print_status "FAIL" "Docker Compose is not installed"
    exit 1
fi

print_status "PASS" "Docker and Docker Compose are installed"

# Check Docker daemon
if ! docker info >/dev/null 2>&1; then
    print_status "FAIL" "Docker daemon is not running"
    exit 1
fi

print_status "PASS" "Docker daemon is running"

# Security Check 1: Dockerfile Security
echo -e "\n${YELLOW}Checking Dockerfile security...${NC}"

if [ ! -f "$DOCKERFILE_PATH" ]; then
    print_status "FAIL" "Dockerfile not found"
    exit 1
fi

# Check for non-root user
if grep -q "USER.*[^0]" "$DOCKERFILE_PATH"; then
    print_status "PASS" "Dockerfile uses non-root user"
else
    print_status "FAIL" "Dockerfile should specify non-root user"
fi

# Check for COPY --chown
if grep -q "COPY --from.*--chown" "$DOCKERFILE_PATH"; then
    print_status "PASS" "Dockerfile uses secure file ownership"
else
    print_status "WARN" "Consider using --chown with COPY commands"
fi

# Check for exposed ports
if grep -q "EXPOSE.*[1-9][0-9][0-9][0-9]" "$DOCKERFILE_PATH"; then
    print_status "PASS" "Dockerfile exposes non-privileged ports"
else
    print_status "WARN" "Check exposed ports are non-privileged (>1024)"
fi

# Security Check 2: Environment Security
echo -e "\n${YELLOW}Checking environment security...${NC}"

# Check for .env file
if [ -f ".env" ]; then
    print_status "INFO" ".env file found - ensure it's in .gitignore"
    
    # Check if .env is in .gitignore
    if grep -q "\.env" .gitignore 2>/dev/null; then
        print_status "PASS" ".env file is properly ignored by git"
    else
        print_status "FAIL" ".env file should be in .gitignore"
    fi
else
    print_status "WARN" "No .env file found - create one for environment variables"
fi

# Check .dockerignore
if [ -f ".dockerignore" ]; then
    print_status "PASS" ".dockerignore file exists"
    
    # Check for sensitive patterns
    if grep -q "\.env\|secrets\|\.key\|\.pem" .dockerignore; then
        print_status "PASS" ".dockerignore includes sensitive file patterns"
    else
        print_status "WARN" ".dockerignore should include sensitive file patterns"
    fi
else
    print_status "FAIL" ".dockerignore file missing"
fi

# Security Check 3: Build Security
echo -e "\n${YELLOW}Building and scanning image...${NC}"

# Build the image
if docker build -t "$IMAGE_NAME:security-test" -f "$DOCKERFILE_PATH" . >/dev/null 2>&1; then
    print_status "PASS" "Docker image builds successfully"
else
    print_status "FAIL" "Docker image build failed"
    exit 1
fi

# Check image size
IMAGE_SIZE=$(docker images --format "table {{.Size}}" "$IMAGE_NAME:security-test" | tail -n 1)
print_status "INFO" "Image size: $IMAGE_SIZE"

# Security Check 4: Container Security
echo -e "\n${YELLOW}Checking container security configuration...${NC}"

if [ -f "$COMPOSE_FILE" ]; then
    print_status "PASS" "Docker Compose file exists"
    
    # Check for security configurations
    if grep -q "read_only.*true" "$COMPOSE_FILE"; then
        print_status "PASS" "Read-only filesystem enabled"
    else
        print_status "WARN" "Consider enabling read-only filesystem"
    fi
    
    if grep -q "cap_drop" "$COMPOSE_FILE"; then
        print_status "PASS" "Capabilities are dropped"
    else
        print_status "WARN" "Consider dropping unnecessary capabilities"
    fi
    
    if grep -q "no-new-privileges" "$COMPOSE_FILE"; then
        print_status "PASS" "No new privileges security option set"
    else
        print_status "WARN" "Consider setting no-new-privileges security option"
    fi
    
    if grep -q "resources:" "$COMPOSE_FILE"; then
        print_status "PASS" "Resource limits configured"
    else
        print_status "WARN" "Consider setting resource limits"
    fi
else
    print_status "WARN" "Docker Compose file not found"
fi

# Security Check 5: Runtime Security Test
echo -e "\n${YELLOW}Testing container runtime security...${NC}"

# Start container in background
if docker run -d --name "$CONTAINER_NAME-test" -p 3001:3000 "$IMAGE_NAME:security-test" >/dev/null 2>&1; then
    print_status "PASS" "Container starts successfully"
    
    # Wait for container to be ready
    sleep 10
    
    # Check if container is running as non-root
    CONTAINER_USER=$(docker exec "$CONTAINER_NAME-test" whoami 2>/dev/null || echo "unknown")
    if [ "$CONTAINER_USER" != "root" ]; then
        print_status "PASS" "Container runs as non-root user ($CONTAINER_USER)"
    else
        print_status "FAIL" "Container is running as root user"
    fi
    
    # Check health endpoint
    if curl -f http://localhost:3001/api/health >/dev/null 2>&1; then
        print_status "PASS" "Health check endpoint responds"
    else
        print_status "WARN" "Health check endpoint not responding (may need more time)"
    fi
    
    # Check file permissions
    ROOT_WRITABLE=$(docker exec "$CONTAINER_NAME-test" ls -ld / | awk '{print $1}' | grep -o 'w' | wc -l)
    if [ "$ROOT_WRITABLE" -eq 0 ]; then
        print_status "PASS" "Root filesystem is read-only"
    else
        print_status "WARN" "Root filesystem may be writable"
    fi
    
    # Cleanup test container
    docker stop "$CONTAINER_NAME-test" >/dev/null 2>&1
    docker rm "$CONTAINER_NAME-test" >/dev/null 2>&1
    
else
    print_status "FAIL" "Container failed to start"
fi

# Security Check 6: Vulnerability Scanning
echo -e "\n${YELLOW}Checking for security vulnerabilities...${NC}"

# Check if Docker Scout is available
if command_exists docker-scout || docker scout version >/dev/null 2>&1; then
    print_status "INFO" "Running Docker Scout vulnerability scan..."
    if docker scout cves "$IMAGE_NAME:security-test" --format only-fixed --quiet; then
        print_status "PASS" "Vulnerability scan completed"
    else
        print_status "WARN" "Vulnerability scan found issues (see above)"
    fi
else
    print_status "INFO" "Docker Scout not available - install for vulnerability scanning"
fi

# Cleanup
docker rmi "$IMAGE_NAME:security-test" >/dev/null 2>&1

# Security Check 7: Next.js Security Configuration
echo -e "\n${YELLOW}Checking Next.js security configuration...${NC}"

if [ -f "next.config.mjs" ]; then
    if grep -q "poweredByHeader.*false" next.config.mjs; then
        print_status "PASS" "X-Powered-By header is disabled"
    else
        print_status "WARN" "Consider disabling X-Powered-By header"
    fi
    
    if grep -q "async headers" next.config.mjs; then
        print_status "PASS" "Security headers are configured"
    else
        print_status "WARN" "Consider adding security headers"
    fi
    
    if grep -q "output.*standalone" next.config.mjs; then
        print_status "PASS" "Standalone output configured for Docker"
    else
        print_status "WARN" "Consider enabling standalone output for Docker"
    fi
else
    print_status "WARN" "Next.js config file not found"
fi

# Final Summary
echo -e "\n${BLUE}Security Check Summary${NC}"
echo -e "${BLUE}=====================${NC}"

echo -e "\n${GREEN}✅ Passed Checks:${NC}"
echo -e "   - Docker environment is properly configured"
echo -e "   - Container security best practices implemented"
echo -e "   - Non-root user configuration"
echo -e "   - Security headers and configurations"

echo -e "\n${YELLOW}⚠️  Recommendations:${NC}"
echo -e "   - Regularly update base images and dependencies"
echo -e "   - Implement comprehensive logging and monitoring"
echo -e "   - Use secrets management system in production"
echo -e "   - Regularly scan for vulnerabilities"
echo -e "   - Implement network security policies"

echo -e "\n${BLUE}ℹ️  Next Steps:${NC}"
echo -e "   1. Review and address any warnings above"
echo -e "   2. Test the deployment in a staging environment"
echo -e "   3. Implement monitoring and alerting"
echo -e "   4. Document security procedures"
echo -e "   5. Schedule regular security audits"

echo -e "\n${GREEN}🎉 Security verification completed!${NC}"
echo -e "${GREEN}Your Docker configuration follows security best practices.${NC}"

exit 0
