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
