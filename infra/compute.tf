resource "aws_key_pair" "deployer" {
  key_name   = "terraform-key"
  public_key = file("terraform-key.pub")
}

data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023*-x86_64"] 
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "grader_engine" {
  ami           = data.aws_ami.amazon_linux_2023.id
  instance_type = "t3.medium"

  # Attach the security group we made above
  vpc_security_group_ids      = [aws_security_group.web_access.id]
  associate_public_ip_address = true
  user_data_replace_on_change = false
  key_name = aws_key_pair.deployer.key_name

  user_data = <<-EOF
              #!/bin/bash
              # 1. System Setup & Nginx Installation
              dnf update -y
              dnf install -y git nginx
              dnf install -y docker
              systemctl enable docker
              systemctl start docker
              usermod -aG docker ec2-user

              sudo mkdir -p /usr/local/lib/docker/cli-plugins
              sudo curl -SL https://github.com/docker/buildx/releases/download/v0.19.1/buildx-v0.19.1.linux-amd64 \
              -o /usr/local/lib/docker/cli-plugins/docker-buildx
              sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-buildx

              sudo mkdir -p /usr/libexec/docker/cli-plugins/
              sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m) \
              -o /usr/libexec/docker/cli-plugins/docker-compose
              sudo chmod +x /usr/libexec/docker/cli-plugins/docker-compose

              # 2. Configure Nginx as a Reverse Proxy
              cat <<NGINX_CONF > /etc/nginx/conf.d/grader_proxy.conf
              server {
                  listen 80;
                  server_name _;

                  # Forward /api/ requests to localhost:8000
                  location /api/ {
                      proxy_pass http://localhost:8000/;
                      proxy_set_header Host \$host;
                      proxy_set_header X-Real-IP \$remote_addr;
                      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                  }

                  # Forward all other requests to localhost:3000
                  location / {
                      proxy_pass http://localhost:3000;
                      proxy_set_header Host \$host;
                      proxy_set_header X-Real-IP \$remote_addr;
                      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                  }
              }
              NGINX_CONF

              rm -f /etc/nginx/conf.d/default.conf

              # 3. Start Nginx
              systemctl enable nginx
              systemctl start nginx

              

              TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
              PUBLIC_IP=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/public-ipv4)

              # 4. App Directory & Env Setup
              mkdir -p /home/ec2-user/app
              cat <<ENV_FILE > /home/ec2-user/app/.env
              POSTGRES_NAME=${aws_db_instance.grader_db.db_name}
              POSTGRES_HOST=${aws_db_instance.grader_db.address}
              POSTGRES_USER=${aws_db_instance.grader_db.username}
              POSTGRES_PASSWORD=${aws_db_instance.grader_db.password}
              POSTGRES_PORT=5432

              DEBUG=${var.debug}
              ALLOWED_HOST=backend
              ALLOWED_HOST_2=$PUBLIC_IP
              ALLOWED_ORIGIN=http://$PUBLIC_IP
              SECRET_KEY=${var.secret_key}

              NEXT_PUBLIC_URL=http://$PUBLIC_IP/api/

              CELERY_BROKER_URL=${var.celery_broker_url}
              CELERY_RESULT_BACKEND=${var.celery_result_backend}

              AWS_ACCESS_KEY_ID=${var.aws_access_key_id}
              AWS_SECRET_ACCESS_KEY=${var.aws_secret_access_key}
              AWS_STORAGE_BUCKET_NAME=${aws_s3_bucket.grader_storage.bucket}
              AWS_S3_REGION_NAME=${data.aws_region.current.id}
              AWS_DEFAULT_REGION=${data.aws_region.current.id}
              AWS_S3_ENDPOINT_URL=${aws_s3_bucket.grader_storage.bucket_domain_name}

              E2B_API_KEY=${var.e2b}
              ENV_FILE

              chmod 600 /home/ec2-user/app/.env

              # 5. Clone Code
              if [ ! -d "/home/ec2-user/app/code" ]; then
                git clone https://github.com/Georgey764/code-grader.git /home/ec2-user/app/code
              fi

              mv /home/ec2-user/app/.env /home/ec2-user/app/code/
              
              # Fix permissions
              chown -R ec2-user:ec2-user /home/ec2-user/app

              cd /home/ec2-user/app/code

              git pull origin main

              sleep 5
              docker compose -f docker-compose.prod.yml up -d
              EOF

  tags = {
    Name = "Code Grader Engine"
  }
}

# The Constant (Static) IP
resource "aws_eip" "grader_static_ip" {
  instance = aws_instance.grader_engine.id
  domain   = "vpc"

  tags = {
    Name = "Grader-Static-IP"
  }
}