terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0, < 6.23.0" 
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

data "aws_region" "current" {}