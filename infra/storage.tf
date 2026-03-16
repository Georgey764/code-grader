# The Core Bucket
resource "aws_s3_bucket" "grader_storage" {
  bucket = "code-grader-storage"

  tags = {
    Name        = "Code Grader Storage"
    Environment = "Prod"
  }
}

# Block Public Access 
resource "aws_s3_bucket_ownership_controls" "grader_storage_controls" {
  bucket = aws_s3_bucket.grader_storage.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# 1. The IAM Role
resource "aws_iam_role" "grader_engine_role" {
  name = "grader-engine-s3-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# 2. The Policy (Permissions)
resource "aws_iam_role_policy" "s3_access_policy" {
  name = "grader-engine-s3-policy"
  role = aws_iam_role.grader_engine_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.grader_storage.arn,
          "${aws_s3_bucket.grader_storage.arn}/*"
        ]
      }
    ]
  })
}