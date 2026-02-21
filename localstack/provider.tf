provider "aws" {
  region = "us-east-1"

  s3_use_path_style = true
  skip_requesting_account_id = false 
  access_key = "test"
  secret_key = "test"

  endpoints {
    s3 = "http://localhost:4566"
  }
}