# variable "POSTGRES_HOST" {
#   type        = string
#   description = "The endpoint for your RDS instance"
# }

# variable "POSTGRES_USER" {
#   type        = string
#   description = "Database master username"
# }

# variable "POSTGRES_NAME" {
#   type        = string
#   description = "The name of the database"
#   default     = "grading_db" # Optional default
# }

# variable "POSTGRES_PASSWORD" {
#   type        = string
#   description = "Database master password"
#   sensitive   = true # This is the "Pro" move to hide it from logs
# }