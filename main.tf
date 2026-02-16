# The Core Bucket
resource "aws_s3_bucket" "grader_storage" {
  bucket = "code-grader-storage"

  tags = {
    Name        = "Code Grader Storage"
    Environment = "Dev"
  }
}

# Block Public Access 
resource "aws_s3_bucket_public_access_block" "grader_storage_policy" {
  bucket = aws_s3_bucket.grader_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}