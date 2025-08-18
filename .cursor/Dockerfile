# Use Node.js LTS as base image for development
FROM node:20-bullseye

# Install system dependencies and development tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    unzip \
    build-essential \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN useradd -m -s /bin/bash ubuntu

# Set working directory to user home
WORKDIR /home/ubuntu

# Install global npm packages commonly needed for development
RUN npm install -g \
    npm@latest \
    @next/codemod \
    eslint \
    prettier \
    typescript \
    @supabase/cli \
    vercel

# Ensure the ubuntu user owns the home directory
RUN chown -R ubuntu:ubuntu /home/ubuntu

# Switch to non-root user
USER ubuntu

# Set environment variables for development
ENV NODE_ENV=development
ENV NPM_CONFIG_PREFIX=/home/ubuntu/.npm-global
ENV PATH=$PATH:/home/ubuntu/.npm-global/bin

# Create npm global directory and ensure it's owned by ubuntu user
RUN mkdir -p /home/ubuntu/.npm-global

# Install bun as alternative package manager (faster installs)
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="$PATH:/home/ubuntu/.bun/bin"

# Set up git config for the user (agents may need to commit)
RUN git config --global user.name "Background Agent" && \
    git config --global user.email "agent@cursor.local" && \
    git config --global init.defaultBranch main

# Note: Code will be cloned by the agent into this workspace
# Do not COPY source code in this Dockerfile
