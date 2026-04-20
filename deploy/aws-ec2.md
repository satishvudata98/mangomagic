# AWS EC2 Deployment Runbook

If you are deploying only to the raw EC2 public IP for temporary testing, use `deploy/aws-ec2-ip-test.md` instead of this runbook.

This is the recommended deployment path for this repository.

Architecture:

- Ubuntu EC2 instance
- Docker Engine + Docker Compose plugin
- `app` container is private on the Docker network
- `caddy` container is the only public entry point on `80` and `443`
- Caddy terminates TLS and proxies to the app container

## 1. Create the EC2 instance

Recommended baseline:

- Ubuntu 24.04 LTS or Ubuntu 22.04 LTS
- `t3.small` for initial testing, `t3.medium` if traffic and image optimization are active
- 20 GB gp3 volume minimum

Security group inbound rules:

- `22/tcp` from your own IP only
- `80/tcp` from `0.0.0.0/0`
- `443/tcp` from `0.0.0.0/0`

Do not open port `10000` publicly.

## 2. Point DNS to the instance

Create an `A` record for your domain and point it to the EC2 public IP.

Example:

- `shop.example.com -> <EC2 public IP>`

Wait until DNS resolves before starting Caddy, otherwise certificate issuance will fail.

## 3. Install Docker

SSH into the instance and run:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

## 4. Copy the project to the server

Clone the repo on the instance or copy the current project directory.

Example:

```bash
git clone <your-repo-url>
cd mangomagic
```

## 5. Create the production env file

Start from the template:

```bash
cp .env.example .env
```

Set these values before the first deploy:

- `APP_DOMAIN=shop.example.com`
- `FRONTEND_URL=https://shop.example.com`
- `NEXT_PUBLIC_API_BASE_URL=https://shop.example.com`
- all Firebase Admin values
- all Supabase values
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET` if you use Razorpay webhooks

Important:

- keep `.env` only on the server
- never bake backend secrets into the image
- `NEXT_PUBLIC_*` values are public by design and are injected at image build time

## 6. Start the stack

Build and run:

```bash
docker compose -f docker-compose.aws.yml up -d --build
```

Check status:

```bash
docker compose -f docker-compose.aws.yml ps
docker compose -f docker-compose.aws.yml logs -f app
docker compose -f docker-compose.aws.yml logs -f caddy
```

## 7. Verify the deployment

Verify these URLs:

- `https://shop.example.com`
- `https://shop.example.com/api/health`

The app container healthcheck also validates the internal Next.js process, not just the API process.

## 8. Day-2 operations

Update the deployment:

```bash
git pull
docker compose -f docker-compose.aws.yml up -d --build
```

Remove old images occasionally:

```bash
docker image prune -f
```

## Security choices in this setup

The deployment files in this repo now enforce these defaults:

- only Caddy publishes ports
- the app container runs as a non-root user
- the app container uses a read-only filesystem
- Linux capabilities are dropped from the app container
- `no-new-privileges` is enabled
- container log files are rotated
- required public build args fail early during `docker compose up --build`
- Razorpay no longer falls back to placeholder secrets

## When to move beyond EC2 + Compose

Move to ECS or another orchestrator when you need one of these:

- multiple application replicas behind a load balancer
- automatic rolling deploys across instances
- managed secret injection from AWS Secrets Manager or Parameter Store
- autoscaling tied to CPU, memory, or request load

For the current codebase and a single-node deployment target, EC2 + Compose is the lowest-complexity production option.