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

## Building the Docker Image Locally

To test the multi-stage Nginx Docker build locally on your laptop (and to be able to run tools like `dive` or `docker scout` against it before deploying to AWS):

1. **Build the Docker image** (this will execute both the Node.js build stage and the Nginx serving stage):
   ```bash
   docker build -t my-app:latest .
   ```

2. **Run the container locally:**
   ```bash
   # Matches port 3000 on your laptop to port 3000 inside the Nginx container
   docker run -d --name my-local-app -p 3000:3000 my-app:latest
   ```

3. **Verify it works:**
   Open `http://localhost:3000` in your web browser.

4. **Analyze it with `dive`:**
   ```bash
   dive my-app:latest
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

**Prerequisite:** Ensure **Docker Desktop** (or your preferred Docker engine like OrbStack or Colima) is currently running on your local machine. If the Docker daemon isn't running, the script will fail when trying to build the image (e.g., `failed to connect to the docker API... connection refused`).

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

#### Seeing Your Live ECS Application & Logs (AWS vs Local)

It's important to remember that `deploy.sh` pushes and runs your container in the **AWS Cloud**, not on your local laptop! 
- Running `docker logs my-app-container` will fail locally because the container isn't running on your machine.
- Your cluster **was** created! You can see it by logging into the **AWS Management Console**, searching for **ECS**, and ensuring your region is set to `us-east-1` (N. Virginia). Look for the cluster named `docker-masterclass-app-cluster`.

To view the live application logs streaming from your AWS Fargate container, use CloudWatch via the AWS CLI:
```bash
# Stream the production container logs from AWS
aws logs tail /ecs/docker-masterclass-app --follow --region us-east-1
```

> **💡 Understanding the Logs:** If you see logs containing `signal 3 (SIGQUIT) received, shutting down`, don't panic! This is a sign of a **successful rolling deployment**. AWS ECS starts your *new* container first, waits for it to become healthy, and then gracefully shuts down the *old* container by sending a `SIGQUIT` signal. It means your zero-downtime deployment worked!

#### Accessing Your Application (cURL)

Because this is a simple showcase, we did not provision an expensive Application Load Balancer (ALB). Instead, your Fargate task is running in a public subnet and is assigned a direct **Public IP**.

To find the IP and view it in your browser or via `curl`:
1. Go to the **AWS Management Console** -> **ECS**.
2. Click on your cluster (`docker-masterclass-app-cluster`).
3. Click on the **Tasks** tab and click on the running task ID.
4. In the **Configuration** section, look for the **Public IP**.
5. From your laptop, test the connection via port 3000:
   ```bash
   curl http://<YOUR_PUBLIC_IP>:3000
   ```
   *(Or simply paste `http://<YOUR_PUBLIC_IP>:3000` into your web browser!)*

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

5. **Tearing Down (Destroying) the Infrastructure:**
   To avoid AWS charges, remember to destroy your resources when you are done!
   ```bash
   terraform destroy
   ```
   > **💡 ECR Destroy Error:** If `terraform destroy` fails with the error `ECR Repository (docker-masterclass-app-repo) not empty`:
   > 
   > 1. We just added `force_delete = true` to `main.tf`, but you must run `terraform apply` first to update the Terraform state.
   > 2. Then, run `terraform destroy` again.
   > 
   > *Alternatively, you can forcefully delete the repository using the AWS CLI, and then re-run terraform destroy:*
   > ```bash
   > aws ecr delete-repository --repository-name docker-masterclass-app-repo --force --region us-east-1
   > terraform destroy
   > ```

_Note: You will need AWS credentials configured (e.g., via `aws configure` or environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`) prior to running Terraform._

## The Power of Alpine Linux (Un-bloating Images)

Throughout this project's Dockerfile (and commonly in production Docker environments), you will see the `-alpine` suffix on base images, such as `FROM nginx:alpine` or `FROM node:20-alpine`.

### What is Alpine?
Alpine Linux is a security-oriented, lightweight Linux distribution built on **musl libc** and **busybox** instead of standard GNU tools.

### Why use it for Docker?
1. **Drastically Smaller Image Sizes:** A standard `nginx:latest` image is roughly 180MB. The `nginx:alpine` image is merely **~40MB**. This leads to faster image build times, quicker container pull times, faster AWS Fargate cold starts, and reduced storage costs on ECR.
2. **Reduced Attack Surface:** By stripping out common OS utilities (like `bash`, standard `glibc`, and compilers), there is significantly less surface area for malicious actors and fewer CVEs (Common Vulnerabilities and Exposures) to patch.

### Important "Gotchas" to Remember
- **Shell differences:** Since Alpine uses `ash` (part of busybox) instead of `bash`, when exec'ing into a container, you use `docker exec -it container_id /bin/sh`.
- **No glibc (The C Standard Library):** Because Alpine uses `musl` libc instead of standard GNU `glibc`, some natively compiled language libraries (like complex Python C-extensions or Node.js native modules built via `node-gyp`) might fail to compile or run out of the box. 
- **The Alternative:** If your app relies heavily on `glibc` and struggles with Alpine, the best un-bloating alternative is a Debian "slim" variant (e.g., `FROM python:3.11-slim`), which balances smaller size with broad C-library compatibility.

### Inspecting Image Layers with `dive`
To visually verify that your Alpine/slim images are un-bloated, use the excellent open-source tool **`dive`**. It shows a layer-by-layer breakdown of your Docker image and highlights wasted space (e.g., files added in one layer but deleted in the next).

> **Important:** `dive` analyzes the image layers on your local machine, not a running container in AWS. You should ideally run this locally before pushing to ECR.

```bash
# Install dive on macOS via Homebrew
brew install dive

# Run dive against your locally built image tag
dive my-app:latest

# To run it against an image already in AWS ECR, pull it first:
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <YOUR_ACCOUNT>.dkr.ecr.us-east-1.amazonaws.com
docker pull <YOUR_ACCOUNT>.dkr.ecr.us-east-1.amazonaws.com/my-app:latest
dive <YOUR_ACCOUNT>.dkr.ecr.us-east-1.amazonaws.com/my-app:latest
```

### Vulnerability Scanning with `docker scout`
Running un-bloated base images drastically reduces your container's attack surface. To verify the security of your image, use **Docker Scout** (built directly into Docker Desktop) to scan for Common Vulnerabilities and Exposures (CVEs).

```bash
# Get a quick summary of vulnerabilities in your image
docker scout quickview my-app:latest

# Get a detailed list of all discovered CVEs
docker scout cves my-app:latest
```

## Docker CLI Cheat Sheet

Here are useful Docker CLI commands to build, run, and manage your containerized applications:

### Build, Run & Manage Containers
- **Build an image**: `docker build -t my-app .`
- **Run interactively**: `docker run -it --rm -p 3000:3000 my-app`
- **Run in detached mode (background)**: `docker run -d --name my-app-container -p 3000:3000 my-app`
- **List running containers**: `docker ps`
- **List all containers**: `docker ps -a`
- **Stop a container**: `docker stop my-app-container`
- **Remove a stopped container**: `docker rm my-app-container`
- **Copy files to/from a container**: `docker cp ./local-file.txt my-app-container:/app/file.txt`
- **View container port mappings**: `docker port my-app-container`

### Image Management
- **Pull an image from a registry**: `docker pull nginx:alpine`
- **Tag an image**: `docker tag my-app:latest aws-account-id.dkr.ecr.region.amazonaws.com/my-app:latest`
- **Push an image**: `docker push aws-account-id.dkr.ecr.region.amazonaws.com/my-app:latest`
- **List images**: `docker images`
- **Remove an image**: `docker rmi my-app:latest`

## Troubleshooting Docker (Local vs AWS Fargate)

When things go wrong, use these commands to diagnose the issue. 

**Crucial Distinction:** You CANNOT run local `docker` commands against an AWS Fargate container. Fargate abstracts away the underlying servers, so there is no Docker daemon you can connect to from your laptop. Instead, AWS provides equivalent CLI commands.

### 1. Checking Logs
- **Local:**
  ```bash
  docker logs --tail 100 -f my-app-container
  ```
- **AWS Fargate (via CloudWatch):**
  ```bash
  aws logs tail /ecs/docker-masterclass-app --follow --region us-east-1
  ```

### 2. Getting Shell Access
- **Local:**
  ```bash
  docker exec -it my-app-container /bin/sh
  ```
- **AWS Fargate (via ECS Exec):**
  *(Note: Requires the task role to have SSM permissions and ECS Exec to be explicitly enabled on the service)*
  ```bash
  aws ecs execute-command \
    --cluster docker-masterclass-app-cluster \
    --task <TASK_ID> \
    --container docker-masterclass-app \
    --interactive \
    --command "/bin/sh"
  ```

### 3. System / Resource Commands (Local vs AWS)
**Crucial Concept:** Fargate manages the underlying compute infrastructure. You do not manage the disk or the Docker daemon on Fargate. 

- **Inspect Container (IP, OOM Kills, etc):**
  - **Local:** `docker inspect my-app-container`
  - **AWS Fargate:** Use the AWS Management Console (ECS service -> Tasks tab -> Task Details) to view the Public/Private IPs. For OOM kills, check the "Stopped Reason" in the Task details. You do not use `docker inspect`.
- **System Prune (Storage Cleanup):**
  - **Local:** `docker system prune -a --volumes` is essential to reclaim local disk space.
  - **AWS Fargate:** Not applicable! AWS automatically scales and throws away the underlying EC2 micro-VMs when your task finishes. You literally cannot run out of disk space on the host daemon because you don't manage the host.
- **Monitor Resource Usage:**
  - **Local:** `docker stats` (streams CPU/Memory usage live)
  - **AWS Fargate:** Go to the AWS Management Console -> CloudWatch -> Metrics, or view the "Metrics" tab directly inside your ECS Service dashboard.
- **View Port Mappings:**
  - **Local:** `docker port my-app-container` (shows local host port to container port mappings).
  - **AWS Fargate:** Not applicable in the same way. Tasks run in `awsvpc` network mode, meaning each task has its own IP. The container port is directly exposed on that IP. You must check the **Security Group** attached to the ECS Service (via the AWS Console) to ensure inbound rules allow traffic to that port.
