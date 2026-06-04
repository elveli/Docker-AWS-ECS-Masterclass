import { Topic } from './types';

export const topics: Topic[] = [
  {
    id: 'cli-refresh',
    title: 'Advanced CLI & Fundamentals',
    description: 'Refresh your core Docker skills with advanced flags and lifecycle management.',
    icon: 'terminal',
    sections: [
      {
        id: 'lifecycle',
        title: 'Container Lifecycle',
        content: 'Mastering the container lifecycle is essential. Avoid leaving dangling containers by using the --rm flag for ephemeral tasks. For background services, use detached mode (-d).',
        code: `# Run a temporary container and remove it upon exit
docker run --rm -it ubuntu:22.04 bash

# Run a production container detached with restart policies
docker run -d --name my-redis --restart unless-stopped -p 6379:6379 redis:alpine`,
        language: 'bash'
      },
      {
        id: 'exec-inspect',
        title: 'Execution & Introspection',
        content: 'When things go wrong, you need to dive into the container. `docker exec` allows you to run commands in a live container, while `docker inspect` dumps low-level infrastructure data in JSON format.',
        code: `# Open an interactive shell inside a running container
docker exec -it my-redis sh

# Filter deeply nested JSON configurations using jq (e.g. finding IP address)
docker inspect my-redis | jq '.[0].NetworkSettings.IPAddress'`,
        language: 'bash'
      }
    ]
  },
  {
    id: 'unbloat-images',
    title: 'Un-bloating Images',
    description: 'Strategies for building micro, production-ready, secure containers for Node.js and Python.',
    icon: 'layers',
    sections: [
      {
        id: 'node-slim',
        title: 'Node.js Production Microservice',
        content: 'To un-bloat Node.js images, use a multi-stage build. We compile typescript in the builder stage, then copy only the compiled /dist folder and install only production dependencies using `npm ci --only=production`. Crucially, we switch to a non-root `node` user for security.',
        code: `# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

# Run securely as unprivileged user
USER node
CMD ["node", "dist/main.js"]`,
        language: 'dockerfile'
      },
      {
        id: 'python-slim',
        title: 'Python Builder Pattern (Debian Slim)',
        content: 'Python images can bloat heavily due to C-extensions and build tools like gcc. We use a builder stage to compile `.whl` files (wheels), then copy those pre-compiled wheels into our minimal production runtime image. We use `python:3.11-slim` rather than alpine to avoid musl libc compatibility issues with popular packages.',
        code: `# Stage 1: Builder
FROM python:3.11-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends build-essential
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Stage 2: Production
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache /wheels/*
COPY . .

# Secure user creation
RUN useradd -m appuser && chown -R appuser /app
USER appuser
CMD ["python", "main.py"]`,
        language: 'dockerfile'
      },
      {
        id: 'dive-tool',
        title: 'Inspecting Layers with Dive',
        content: '`dive` is an excellent open-source CLI tool for exploring a Docker image, examining layer contents, and discovering ways to shrink the size of your Docker image. Important: `dive` analyzes the image layers on your local machine, not a running container in AWS. You should ideally run this locally before pushing to ECR.',
        code: `# Install dive (e.g., macOS via Homebrew)
brew install dive

# Run dive against your locally built image
dive my-microservice:latest

# To analyze an image already in AWS ECR, pull it to your laptop first:
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
docker pull <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/my-microservice:latest
dive <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/my-microservice:latest`,
        language: 'bash'
      }
    ]
  },
  {
    id: 'aws-ecs',
    title: 'AWS ECR & ECS Fargate',
    description: 'Deploying containerized workloads to AWS using Amazon Elastic Container Service (ECS) and AWS Fargate serverless compute.',
    icon: 'cloud',
    sections: [
      {
        id: 'ecr-push',
        title: 'Pushing to Elastic Container Registry',
        content: 'Before ECS can run your image, it needs to live in ECR. You authenticate the Docker CLI against AWS, build your image, tag it with the AWS registry URI, and push.',
        code: `# 1. Authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# 2. Build and Tag
docker build -t my-microservice .
docker tag my-microservice:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-microservice:latest

# 3. Push to ECR
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-microservice:latest`,
        language: 'bash'
      },
      {
        id: 'ecs-deploy',
        title: 'Deploy to Fargate via CLI',
        content: 'With the image in ECR, you update your ECS Service to force a new deployment, fetching the latest image. The Fargate launch type abstracts away EC2 servers, running the container seamlessly directly on AWS infrastructure.',
        code: `# Register a new Task Definition revision (optional if only updating the 'latest' image tag)
aws ecs register-task-definition --cli-input-json file://task-def.json

# Force a new deployment to roll out the latest image to Fargate
aws ecs update-service \\
  --cluster production-cluster \\
  --service web-app-fargate-service \\
  --force-new-deployment \\
  --region us-east-1`,
        language: 'bash'
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting & Pruning',
    description: 'Essential commands to diagnose failing containers, out-of-memory errors, and bloated local storage.',
    icon: 'alert-triangle',
    sections: [
      {
        id: 'system-prune',
        title: 'System Prune (Storage Reclaim)',
        content: 'Docker hoards storage. Dangling images, stopped containers, and unused volumes can quickly fill your disk. Use system prune safely to reclaim gigabytes of space.',
        code: `# Remove dangling (untagged) images and stopped containers
docker system prune -f

# Aggressive: Remove EVERYTHING not tied to a running container, including unused volumes
docker system prune -a --volumes -f`,
        language: 'bash'
      },
      {
        id: 'diagnostics',
        title: 'Local Diagnostics & Resource Exhaustion',
        content: 'If an ECS Fargate task dies immediately or locally your container crashes silently, you need to quickly diagnose if it is a memory/CPU issue or a runtime code crash. (Note: These commands apply to LOCAL docker environments. For AWS Fargate, see the next section).',
        code: `# Monitor real-time CPU, Memory, and Network I/O
docker stats

# Tail the last 100 lines of logs with timestamps to diagnose crashes
docker logs --tail 100 -f -t <container_id>

# Check if container died from Out-of-Memory (Look for OOMKilled: true)
docker inspect <container_id> | grep -i oom

# Stream daemon-level events to debug network/startup failures
docker events`,
        language: 'bash'
      },
      {
        id: 'fargate-diagnostics',
        title: 'AWS Fargate Diagnostics (Remote)',
        content: 'Because AWS Fargate is a serverless container environment, you do not have access to the underlying Docker daemon. You cannot run `docker exec`, `docker stats`, `docker inspect`, or `docker system prune` against it from your laptop. Instead, you use the AWS CLI, CloudWatch (for logs, CPU/Memory metrics), the AWS Console (for IPs and OOM Stopped Reasons) and ECS Exec (for shell access).',
        code: `# Equivalent to 'docker logs' (using CloudWatch)
aws logs tail /ecs/docker-masterclass-app --follow --region us-east-1

# Equivalent to 'docker exec' (Requires ECS Exec enabled on your task)
aws ecs execute-command \\
  --cluster docker-masterclass-app-cluster \\
  --task <TASK_ID> \\
  --container docker-masterclass-app \\
  --interactive \\
  --command "/bin/sh"`,
        language: 'bash'
      }
    ]
  }
];
