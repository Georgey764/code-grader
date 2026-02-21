#!/bin/bash
echo "Commencing Terraform provisioning..."
cd /docker-entrypoint-initaws.d/terraform
tflocal init
tflocal apply -auto-approve

touch /tmp/provisioned
echo "Infrastructure provisioned successfully."