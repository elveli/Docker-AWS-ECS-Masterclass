variable "aws_region" {
  description = "The AWS region to deploy the infrastructure to"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr_block" {
  description = "The CIDR block for the VPC"
  type        = string
  default     = "10.42.0.0/16"
}

variable "app_name" {
  description = "The name of the application. Used to tag and name resources."
  type        = string
  default     = "docker-masterclass-app"
}

variable "container_port" {
  description = "The port the container listens on"
  type        = number
  default     = 3000
}

variable "fargate_cpu" {
  description = "Fargate instance CPU units to provision (1 vCPU = 1024 CPU units)"
  type        = number
  default     = 256
}

variable "fargate_memory" {
  description = "Fargate instance memory to provision (in MiB)"
  type        = number
  default     = 512
}
