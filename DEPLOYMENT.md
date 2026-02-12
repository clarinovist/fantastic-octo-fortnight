# Deployment Guide: Lesprivate VPS

This guide describes how to deploy the Lesprivate application to a VPS (Ubuntu recommended) using Docker for services and Nginx on the host for routing and SSL.

## 1. Prerequisites

- **VPS Server**: Ubuntu 20.04 or 22.04 LTS (Recommended: 2 CPU, 4GB RAM minimum).
- **Domain**: Pointed to your VPS IP address (e.g., `lesprivate.my.id`, `app.lesprivate.my.id`, etc.).
- **Software**:
  - `git`
  - `docker` & `docker-compose-plugin` (or `docker-compose`)
  - `nginx`
  - `certbot` (python3-certbot-nginx)

## 2. Server Setup (First Time)

Login to your VPS via SSH and install required packages:

```bash
# Update and install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx python3-certbot-nginx

# Install Docker (if not installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# (Logout and Login again to apply docker group changes)
```

## 3. Clone Repository

```bash
cd ~
git clone git@github.com:clarinovist/fantastic-octo-fortnight.git lesprivate
cd lesprivate/infra
```

> **Note:** usage of SSH key (`git@github...`) requires adding your VPS public key to GitHub. Alternatively use HTTPS with Personal Access Token.

## 4. Configuration

Create the Production Environment file `.env` inside `infra/` folder.

```bash
cp .env.example .env
nano .env
```

**Important Variables to Set:**
- `DATABASE_URL`, `REDIS_URL` (usually ok as defaults if using docker services)
- `NEXT_BASE_API_URL=https://api.lesprivate.my.id` (Use HTTPS domain)
- `NEXT_PUBLIC_FRONTEND_URL=https://app.lesprivate.my.id`
- `NEXTAUTH_URL=https://mentor.lesprivate.my.id` (or admin)
- `Google Auth Credentials`

## 5. Run Services

Start all containers in detached mode:

```bash
docker compose up -d --build
```

Check status:
```bash
docker compose ps
```

You should see:
- `backend` (8080)
- `admin` (3000)
- `frontend` (3001)
- `mentor` (3002)
- `homepage` (80 -> mapped to host later or conflicting?)
  - *Wait!* If you use Host Nginx, you must ensure `homepage` container is NOT binding host port 80 directly if Nginx is running.
  - **Edit** `docker-compose.yml`: Change `homepage` port to something else like `8081:80` or rely on internal network if Nginx was in Docker (but we are using Host Nginx).
  - **Since existing docker-compose uses `80:80` for homepage, it WILL conflict with Host Nginx.**
  - **Fix:** In `docker-compose.yml`, change homepage ports to `"8081:80"`. Update Nginx config accordingly.

## 6. Nginx & SSL Configuration

1.  **Copy Sample Config**:
    ```bash
    sudo cp nginx-vps-sample.conf /etc/nginx/sites-available/lesprivate
    ```

2.  **Adjust Ports**:
    Ensure the `proxy_pass` ports in the config match your `docker-compose.yml` internal mapping (or exposed ports).
    - Homepage: `http://localhost:8081` (Check `docker-compose.yml`!)

3.  **Enable Site**:
    ```bash
    sudo ln -s /etc/nginx/sites-available/lesprivate /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

4.  **Setup SSL**:
    ```bash
    sudo certbot --nginx -d lesprivate.my.id -d www.lesprivate.my.id -d app.lesprivate.my.id -d mentor.lesprivate.my.id -d admin.lesprivate.my.id -d api.lesprivate.my.id
    ```

## 7. Updating Application

To update the code and redeploy:

```bash
cd ~/lesprivate/infra
git pull
docker compose up -d --build
```
This minimizes downtime by building new images before replacing containers.

## Troubleshooting

- **Logs**: `docker compose logs -f [service_name]`
- **Nginx Logs**: `sudo tail -f /var/log/nginx/error.log`
