#!/bin/bash

echo "=== Cài Docker CE cho Rocky Linux ==="

# Thêm repo Docker (CentOS dùng được cho Rocky)
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Cài Docker
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Khởi động Docker
sudo systemctl enable --now docker

# Thêm user vào group docker
sudo usermod -aG docker $USER

echo "=== Cài đặt xong! Hãy logout/login để dùng Docker không cần sudo ==="
docker --version
