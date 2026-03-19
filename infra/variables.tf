variable "postgres_name" {
  description = "name for redis postgres db"
  type = string
  sensitive = true
}

variable "postgres_user" {
  description = "username for redis postgres db"
  type = string
  sensitive = true
}

variable "postgres_password" {
  description = "password for redis postgres db"
  type = string
  sensitive = true
}

variable "debug" {
  description = "debug var for django"
  type = string
  sensitive = false
}

variable "secret_key" {
  description = "secret key var for django"
  type = string
  sensitive = true
}

variable "celery_broker_url" {
  description = "celery url for django"
  type = string
  sensitive = true
}

variable "celery_result_backend" {
  description = "celery result url for django"
  type = string
  sensitive = true
} 

variable "aws_access_key_id" {
  description = "aws access key id for django to access s3"
  type = string
  sensitive = true
} 

variable "aws_secret_access_key" {
  description = "aws secret access key for django to access s3"
  type = string
  sensitive = true
} 

variable "e2b" {
  description = "e2b sandbox env api key"
  type = string
  sensitive = true
} 

variable "next_public_url" {
  description = "URL for frontend to call backend"
  type = string
  sensitive = true
}

variable "allowed_origin" {
  description = "allowed origin for django"
  type = string
  sensitive = true
}

variable "allowed_host" {
  description = "allowed host for django"
  type = string
  sensitive = true
}

variable "next_public_terminal_url" {
  description = "URL for terminal to call backend"
  type = string
  sensitive = true
}

variable "allowed_origin_terminal" {
  description = "allowed origin for terminal"
  type = string
  sensitive = true
}