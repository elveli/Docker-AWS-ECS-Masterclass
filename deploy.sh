#!/bin/bash
set -e

echo "🚀 Starting Full Deployment Process..."

# 1. Provision Infrastructure via Terraform
echo "🏗️ Provisioning infrastructure with Terraform..."
cd terraform
terraform init
terraform apply -auto-approve

# Extract the outputs needed for pushing the Docker image
ECR_REPO_URL=$(terraform output -raw ecr_repository_url)
CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)
SERVICE_NAME=$(terraform output -raw ecs_service_name)
cd ..

echo "✅ Infrastructure provisioned."
echo "📦 ECR URL: ${ECR_REPO_URL}"

# Extract AWS Region from ECR URL (format: account.dkr.ecr.region.amazonaws.com/repo)
ECR_REGISTRY=$(echo "$ECR_REPO_URL" | cut -d'/' -f1)
AWS_REGION=$(echo "$ECR_REGISTRY" | cut -d'.' -f4)

# 2. Authenticate the local Docker CLI with AWS ECR
echo "🔐 Authenticating Docker to ECR in region $AWS_REGION..."
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

# 3. Build the Docker Image
IMAGE_NAME="docker-masterclass-app:latest"
echo "🛠️ Building Docker image..."
docker build -t "$IMAGE_NAME" .

# 4. Tag and Push the Docker Image to ECR
echo "🏷️ Tagging and pushing image to ECR..."
docker tag "$IMAGE_NAME" "$ECR_REPO_URL:latest"
docker push "$ECR_REPO_URL:latest"

# 5. Trigger an ECS Service Update
# Now that ECR has the latest image, force Fargate to pull it and restart the container
echo "🔄 Updating ECS service to use the new image..."
aws ecs update-service \
  --cluster "$CLUSTER_NAME" \
  --service "$SERVICE_NAME" \
  --force-new-deployment \
  --region "$AWS_REGION" > /dev/null

echo "🎉 Deployment complete! AWS Fargate is now pulling and running your updated containers."
