# Security Group for RDS (Internal Access only)
resource "aws_security_group" "rds_sg" {
  name        = "grader-db-access"
  description = "Allow PostgreSQL traffic from EC2"
  vpc_id      = data.aws_vpc.default.id

  # Allow inbound traffic on 5432 only from the EC2 Security Group
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.web_access.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# The RDS Instance
resource "aws_db_instance" "grader_db" {
  allocated_storage    = 20
  identifier           = "grader-db"
  db_name              = var.postgres_name
  engine               = "postgres"
  engine_version       = "16"
  instance_class       = "db.t3.micro"
  
  auto_minor_version_upgrade = true
  
  username             = var.postgres_user
  password             = var.postgres_password
  
  parameter_group_name = "default.postgres16"
  skip_final_snapshot  = false
  publicly_accessible  = false

  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  tags = {
    Name        = "Code Grader Database"
    Environment = "Prod"
  }
}

output "rds_endpoint" {
  value = aws_db_instance.grader_db.endpoint
}