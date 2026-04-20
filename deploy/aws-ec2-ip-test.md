# AWS EC2 Public-IP Testing Runbook

Use this runbook only for temporary testing when you do not have a domain yet.

This path is intentionally simpler than the final HTTPS setup:

- the `app` container is published directly
- Caddy is not used
- traffic is HTTP only
- the server allows a non-HTTPS `FRONTEND_URL` only because the deployment profile is set to `ec2-ip-test`

Do not treat this as the final production deployment path.

## 1. Create the EC2 instance

Recommended baseline:

- Ubuntu 24.04 LTS or Ubuntu 22.04 LTS
- `t3.small` for testing
- 20 GB gp3 volume minimum

Security group inbound rules:

- `22/tcp` from your own IP only
- `80/tcp` from `0.0.0.0/0` if you use the default `APP_PUBLIC_PORT=80`

If you change `APP_PUBLIC_PORT`, open that port instead of `80`.

## 2. Install Docker

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

## 3. Copy the project to the server

Clone the repo on the instance or copy the current project directory.

Example:

```bash
git clone <your-repo-url>
cd mangomagic
```

## 4. Create the env file

Start from the template:

```bash
cp .env.example .env
```

## 5. Fill the test env values

Set these values before the first deploy:

- `FRONTEND_URL=http://<EC2_PUBLIC_IP>`
- `NEXT_PUBLIC_API_BASE_URL=http://<EC2_PUBLIC_IP>`
- `APP_PUBLIC_PORT=80`
- all Firebase Admin values
- all Supabase values
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET` if you use Razorpay webhooks

If you choose a non-default public port, use that exact origin in both values, for example:

- `FRONTEND_URL=http://<EC2_PUBLIC_IP>:10000`
- `NEXT_PUBLIC_API_BASE_URL=http://<EC2_PUBLIC_IP>:10000`

Important:

- `APP_DOMAIN` is not used by this IP-test stack
- backend secrets still stay only in `.env`
- the frontend public origin is baked into the image build, so rebuild the image after changing `NEXT_PUBLIC_API_BASE_URL`

## 6. Start the stack

Build and run:

```bash
docker compose -f docker-compose.aws.ip-test.yml up -d --build
```

Check status:

```bash
docker compose -f docker-compose.aws.ip-test.yml ps
docker compose -f docker-compose.aws.ip-test.yml logs -f app
```

## 7. Verify the deployment

Verify these URLs from your browser:

- `http://<EC2_PUBLIC_IP>`
- `http://<EC2_PUBLIC_IP>/api/health`
- `http://<EC2_PUBLIC_IP>/api/health?full=1`

Verify from the server too:

```bash
curl http://127.0.0.1:${APP_PUBLIC_PORT:-80}/api/health
curl http://127.0.0.1:${APP_PUBLIC_PORT:-80}/api/health?full=1
```

## 8. Auth caveat

This app currently uses Firebase Google sign-in.

The container deployment can be correct even if browser sign-in fails on the EC2 public IP. If you see an unauthorized-domain error from Firebase, that is an auth-origin limitation, not a Dockerization failure.

Desktop popup sign-in is the best first auth test. Mobile auth is more sensitive because the current frontend can fall back to redirect-based login.

## 9. Day-2 operations

Update the deployment:

```bash
git pull
docker compose -f docker-compose.aws.ip-test.yml up -d --build
```

Remove old images occasionally:

```bash
docker image prune -f
```

## 10. Move to the real deployment later

When you get a real domain, switch to the HTTPS stack:

- `docker-compose.aws.yml`
- `deploy/Caddyfile`
- `deploy/aws-ec2.md`

At that point, set `FRONTEND_URL` and `NEXT_PUBLIC_API_BASE_URL` to the final HTTPS domain and stop using the IP-test stack.