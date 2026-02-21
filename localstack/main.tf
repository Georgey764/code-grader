# data "aws_caller_identity" "current" {}
# data "aws_region" "current" {}
# data "aws_lambda_function" "student_code_runner" {
#   function_name = "student-code-runner"
# }


# The Core Bucket
resource "aws_s3_bucket" "grader_storage" {
  bucket = "code-grader-storage"

  tags = {
    Name        = "Code Grader Storage"
    Environment = "Dev"
  }
}

# Block Public Access 
resource "aws_s3_bucket_ownership_controls" "grader_storage_controls" {
  bucket = aws_s3_bucket.grader_storage.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}


# Zip the code
# data "archive_file" "student_program_runner_zip" {
#   type        = "zip"
#   source_file = "./lambda/run_student_program/handler.py"
#   output_path = "./lambda/run_student_program/student_program_runner.zip"
# }

# Mock IAM Role (LocalStack doesn't strictly enforce this, but it must exist)
# resource "aws_iam_role" "iam_for_lambda" {
#   name = "iam_for_lambda"
#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [{
#       Action = "sts:AssumeRole"
#       Effect = "Allow"
#       Principal = { Service = "lambda.amazonaws.com" }
#     }]
#   })
# }

# resource "aws_iam_policy" "lambda_s3_read_policy" {
#   name        = "lambda_s3_read_policy"
#   description = "Allows Lambda to list and download files from the grader bucket"

#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         # Permission to "See" what is in the bucket
#         Action   = "s3:ListBucket"
#         Effect   = "Allow"
#         Resource = aws_s3_bucket.grader_storage.arn
#       },
#       {
#         # Permission to "Download" the actual files
#         Action   = "s3:GetObject"
#         Effect   = "Allow"
#         # The /* means "every file inside the bucket"
#         Resource = "${aws_s3_bucket.grader_storage.arn}/*"
#       }
#     ]
#   })
# }

# resource "aws_iam_policy" "lambda_logging" {
#   name        = "lambda_logging"
#   path        = "/"
#   description = "IAM policy for logging from a lambda"

#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Action = [
#           "logs:CreateLogGroup",
#           "logs:CreateLogStream",
#           "logs:PutLogEvents",
#         ]
#         Effect   = "Allow"
#         Resource = "arn:aws:logs:*:*:*"
#       },
#     ]
#   })
# }

# resource "aws_iam_role_policy_attachment" "lambda_s3_attach" {
#   role       = aws_iam_role.iam_for_lambda.name
#   policy_arn = aws_iam_policy.lambda_s3_read_policy.arn
# }

# resource "aws_iam_role_policy_attachment" "lambda_logs" {
#   role       = aws_iam_role.iam_for_lambda.name
#   policy_arn = aws_iam_policy.lambda_logging.arn
# }

# resource "aws_cloudwatch_log_group" "grader_logs" {
#   name              = "/aws/lambda/student-code-runner"
#   retention_in_days = 7  # Automatically deletes logs after a week
# }

# The Lambda Function
# resource "aws_lambda_function" "student_program_runner" {
#   filename      = "./lambda/run_student_program/student_program_runner.zip"
#   function_name = "student_program_runner"
#   role          = aws_iam_role.iam_for_lambda.arn
#   handler       = "handler.lambda_handler"
#   runtime       = "python3.14"

#   source_code_hash = data.archive_file.student_program_runner_zip.output_base64sha256
# }

# # Give S3 Permission to call your Lambda
# resource "aws_lambda_permission" "allow_s3" {
#   statement_id  = "AllowExecutionFromS3Bucket"
#   action        = "lambda:InvokeFunction"
#   function_name = data.aws_lambda_function.student_code_runner.function_name
#   principal     = "s3.amazonaws.com"
#   source_arn    = aws_s3_bucket.grader_storage.arn
# }

# # The Trigger: "When a file lands in S3, call the Lambda"
# resource "aws_s3_bucket_notification" "bucket_notification" {
#   bucket = aws_s3_bucket.grader_storage.id

#   lambda_function {
#     lambda_function_arn = data.aws_lambda_function.student_code_runner.arn
#     events              = ["s3:ObjectCreated:*"]
#     filter_prefix       = "workstation/submissions/" 
#     filter_suffix       = ".py" 
#   }

#   depends_on = [aws_lambda_permission.allow_s3]
# }

# # Create the Secret "Container"
# resource "aws_secretsmanager_secret" "db_secret" {
#   name        = "grader/db_credentials"
#   description = "Database credentials for the Automated Code Grader"
# }

# # Create the Secret Value (JSON)
# resource "aws_secretsmanager_secret_version" "db_secret_val" {
#   secret_id = aws_secretsmanager_secret.db_secret.id
  
#   # We use jsonencode to turn these values into a single JSON object
#   secret_string = jsonencode({
#     DB_HOST     = var.POSTGRES_HOST
#     DB_USER     = var.POSTGRES_USER
#     DB_PASSWORD = var.POSTGRES_PASSWORD
#     DB_NAME     = var.POSTGRES_NAME 
#   })
# }

# resource "aws_iam_policy" "secrets_policy" {
#   name        = "LambdaSecretsReader"
#   description = "Allows Lambda to fetch the DB credentials from Secrets Manager"

#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Action   = "secretsmanager:GetSecretValue"
#         Effect   = "Allow"
#         Resource = aws_secretsmanager_secret.db_secret.arn
#       }
#     ]
#   })
# }

# resource "aws_iam_role_policy_attachment" "lambda_secrets_attach" {
#   role       = aws_iam_role.student_code_runner.name
#   policy_arn = aws_iam_policy.secrets_policy.arn
# }