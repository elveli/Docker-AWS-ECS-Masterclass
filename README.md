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

### Terraform Usage:

1. **Navigate to the Terraform directory:**
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
