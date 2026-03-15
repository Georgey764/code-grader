# Fetch the default VPC for the region
data "aws_vpc" "default" {
  default = true
}

# Security Group for EC2 (Public Access)
resource "aws_security_group" "web_access" {
  name        = "grader-web-access"
  description = "Allow HTTP and SSH from anywhere"
  vpc_id      = data.aws_vpc.default.id

  # HTTP access from anywhere
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # SSH access (Optional: restrict this to your IP for better security)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}