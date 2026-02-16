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


# Zip the code
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "handler.py"
  output_path = "lambda_function.zip"
}

# Mock IAM Role (LocalStack doesn't strictly enforce this, but it must exist)
resource "aws_iam_role" "iam_for_lambda" {
  name = "iam_for_lambda"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

# The Lambda Function
resource "aws_lambda_function" "test_lambda" {
  filename      = "lambda_function.zip"
  function_name = "user_program_runner"
  role          = aws_iam_role.iam_for_lambda.arn
  handler       = "handler.lambda_handler"
  runtime       = "python3.9"

  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
}

# Give S3 Permission to call your Lambda
resource "aws_lambda_permission" "allow_s3" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.test_lambda.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.user_uploads.arn
}

# The Trigger: "When a file lands in S3, call the Lambda"
resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.user_uploads.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.test_lambda.arn
    events              = ["s3:ObjectCreated:*"]
    # Optional: only run for .py files
    filter_suffix       = ".py" 
  }

  # Ensure permission is granted BEFORE the trigger is created
  depends_on = [aws_lambda_permission.allow_s3]
}