output "ecr_repository_url" {
  description = "The URL of the ECR Repository to push your Docker images to."
  value       = aws_ecr_repository.app_repo.repository_url
}

output "ecs_cluster_name" {
  description = "The name of the ECS cluster."
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "The name of the ECS service."
  value       = aws_ecs_service.main.name
}

output "vpc_id" {
  description = "The ID of the VPC created for the cluster."
  value       = aws_vpc.main.id
}
