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

  root_block_device {
    volume_size = 60
    volume_type = "gp3"
    delete_on_termination = true
  }

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
                  server_name code-grader.duckdns.org;

                  # Forward /api/ requests to localhost:8000
                  location /api/ {
                      proxy_pass http://localhost:8000;
                      proxy_set_header Host \$host;
                      proxy_set_header X-Real-IP \$remote_addr;
                      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                  }

                  # Forward /socket.io/ requests to localhost:4000
                  location /socket.io/ {
                      proxy_pass http://localhost:4000;
                      proxy_http_version 1.1;
                      proxy_set_header Upgrade $http_upgrade;
                      proxy_set_header Connection "upgrade";
                      proxy_set_header Host $host;
                      proxy_set_header X-Real-IP $remote_addr;
                      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
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
              ALLOWED_HOST_2=${var.allowed_host}
              ALLOWED_ORIGIN=${var.allowed_origin}
              SECRET_KEY=${var.secret_key}

              NEXT_PUBLIC_URL=${var.next_public_url}
              NEXT_PUBLIC_TERMINAL_URL=${var.next_public_terminal_url}
              ALLOWED_ORIGIN_TERMINAL=${var.allowed_origin_terminal}

              CELERY_BROKER_URL=${var.celery_broker_url}
              CELERY_RESULT_BACKEND=${var.celery_result_backend}

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

              git stash
              git pull origin main

              sleep 5
              docker compose -f docker-compose.prod.yml up -d --wait


              # 1. Install system dependencies
              sudo dnf install -y python3.12 python3.12-pip augeas-libs
              sudo dnf install -y cronie
              sudo systemctl enable crond
              sudo systemctl start crond

              # 2. Set up the virtual environment
              sudo python3 -m venv /opt/certbot/
              sudo /opt/certbot/bin/pip install --upgrade pip

              # 3. Install Certbot and the Nginx plugin
              sudo /opt/certbot/bin/pip install certbot certbot-nginx

              # 4. Create a shortcut so you can just type 'certbot'
              sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot

              sudo certbot --nginx \
              -d code-grader.duckdns.org \
              --non-interactive \
              --agree-tos \
              -m georgesamuel764@gmail.com \
              --redirect

              (sudo crontab -l 2>/dev/null; echo "0 0,12 * * * sleep \$((RANDOM \% 3600)) && /usr/bin/certbot renew -q --post-hook 'systemctl reload nginx'") | sudo crontab -

              docker exec -it backend python manage.py migrate
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