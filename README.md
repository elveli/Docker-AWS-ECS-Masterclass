# Docker & AWS ECS Masterclass

An interactive, responsive single-page application built with React and Tailwind CSS that serves as a tutorial for advanced Docker optimization and AWS Fargate deployment. 

The application covers best practices for:
- Core Docker CLI fundamentals and lifecycle management.
- Un-bloating images for Node.js and Python microservices using multi-stage builds.
- AWS ECS and Fargate deployment mechanics.
- Pruning and troubleshooting workloads.

## Getting Started (Local Development)

This applet runs entirely in your browser using React and Vite.

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run the Development Server:**
   ```bash
   npm run dev
   ```

3. **Build for Production:**
   ```bash
   npm run build
   ```

## AWS Terraform Deployment

A complete Infrastructure as Code (IaC) setup using **Terraform** is provided in the `/terraform` directory. This provisions a production-ready AWS environment to deploy the containerized microservices discussed in the tutorial.

### Infrastructure Provisioned:
- **Networking**: VPC, Public Subnets, Internet Gateway, and Route Tables.
- **Security**: Security Groups restricting inbound traffic, and appropriate IAM roles (Task Execution Role).
- **Container Registry**: Amazon ECR repository for storing slimmed-down Docker images.
- **Compute**: Amazon ECS Cluster and a Serverless Fargate ECS Service.

### AWS Terraform & Docker Deployment

To answer your initial question: **No, the Terraform code does not automatically build and push the Docker image by itself.** Terraform is excellent at provisioning the infrastructure (the ECR registry, VPC, ECS Cluster), but container builds and pushes are typically handled by Continuous Integration (CI) tools or deployment scripts.

To link Terraform and Docker together in a single action, you can use the provided `deploy.sh` script.

#### Using `deploy.sh`
This script glues the process together:
1. It applies the Terraform configuration to provision all AWS resources.
2. It parses the Terraform outputs to find the ECR Registry URL.
3. It authenticates your local Docker CLI securely with AWS.
4. It builds a multi-stage `Dockerfile` and pushes it to ECR.
5. It tells AWS ECS to gracefully update and rollout the new Docker image.

To run it:
```bash
# Make the script executable
chmod +x deploy.sh

# Run the complete deployment to AWS
./deploy.sh
```
   ```bash
   cd terraform
   ```

2. **Initialize Terraform:**
   ```bash
   terraform init
   ```

3. **Review the Deployment Plan:**
   ```bash
   terraform plan
   ```

4. **Apply to AWS:**
   ```bash
   terraform apply
   ```

_Note: You will need AWS credentials configured (e.g., via `aws configure` or environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`) prior to running Terraform._

## Docker CLI Cheat Sheet

Here are useful Docker CLI commands to build, run, and manage your containerized applications:

### Build & Run
- **Build an image**: `docker build -t my-app .`
- **Run interactively**: `docker run -it --rm -p 3000:3000 my-app`
- **Run in detached mode (background)**: `docker run -d --name my-app-container -p 3000:3000 my-app`
- **List running containers**: `docker ps`
- **List all containers**: `docker ps -a`

### Image Management
- **Tag an image**: `docker tag my-app:latest aws-account-id.dkr.ecr.region.amazonaws.com/my-app:latest`
- **Push an image**: `docker push aws-account-id.dkr.ecr.region.amazonaws.com/my-app:latest`
- **List images**: `docker images`
- **Remove an image**: `docker rmi my-app:latest`

## Troubleshooting Docker

When things go wrong, use these commands to diagnose the issue:

- **Check container logs**:
  ```bash
  docker logs -f my-app-container
  # Use --tail to limit output: docker logs --tail 100 -f my-app-container
  ```
- **Execute into a running container**:
  ```bash
  docker exec -it my-app-container /bin/sh
  # or /bin/bash depending on your container's shell
  ```
- **Inspect container configuration (find IP, OOM kills, etc.)**:
  ```bash
  docker inspect my-app-container
  ```
- **Keep disk usage in check (System Prune)**:
  ```bash
  # Remove stopped containers, dangling images, and unused networks
  docker system prune
  
  # WARNING: Remove EVERYTHING unused (including downloaded base images & volumes)
  docker system prune -a --volumes -f
  ```
- **Monitor resource usage**:
  ```bash
  docker stats
  ```
