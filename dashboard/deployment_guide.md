# Deployment Guide: Neural Gesture Dashboard

This guide outlines three production deployment routes for the Neural Gesture Pipeline Dashboard: **Vercel Cloud**, **Docker Containerization**, and **PM2 Process Management**.

---

## 🔒 Crucial Security Information (Webcam Permission)

Modern web browsers (Chrome, Firefox, Safari) enforce a strict secure-origin security policy. Access to `navigator.mediaDevices.getUserMedia` (required to stream your webcam feed for hand landmark predictions) is **only permitted on secure origins**:
* `localhost` or `127.0.0.1`
* Secure domains using `HTTPS` (e.g. `https://yourdomain.com`)

> [!WARNING]
> If you deploy the dashboard to a local intranet IP (e.g. `http://192.168.1.15:3000`) or a public domain without SSL (`http://...`), the camera feed will fail to open and block gesture recognition. **For public deployments, always use a platform that forces HTTPS/SSL.**

---

## ☁️ Option 1: Cloud Deployment via Vercel (Recommended)

Vercel is the easiest, zero-configuration cloud host for Next.js applications and provides **automatic HTTPS certificates**.

### Setup Steps:
1. **Push Code to GitHub:**
   Commit all local updates and push to your remote repository:
   ```bash
   git add .
   git commit -m "feat: integrate user login and deployment configurations"
   git push origin main
   ```
2. **Import to Vercel:**
   * Go to [Vercel](https://vercel.com) and log in using your GitHub account.
   * Click **Add New > Project**.
   * Import your `Neural-Gesture-Pipeline` repository.
3. **Configure Root Directory:**
   * Since the Next.js app sits inside a subdirectory, locate the **Root Directory** field under *Project Settings* and set it to **`dashboard`**.
   * Leave the *Build & Development Settings* on their defaults (Vercel automatically detects Next.js).
4. **Deploy:**
   * Click **Deploy**. Vercel will compile the assets and host your live website with a secure `https://...` address.

---

## 🐳 Option 2: Docker Containerization

To run the dashboard inside an isolated production container on local servers, cloud VMs (EC2, Droplets), or platforms like Render/Railway.

### Build and Run:
1. Navigate to the dashboard directory:
   ```bash
   cd dashboard
   ```
2. Build the Docker image:
   ```bash
   docker build -t neural-gesture-dashboard .
   ```
3. Run the container in background daemon mode:
   ```bash
   docker run -d -p 3000:3000 --name gesture-dashboard --restart unless-stopped neural-gesture-dashboard
   ```
4. Access the dashboard at `http://localhost:3000`.

---

## ⚙️ Option 3: Process Daemonizing via PM2

To run the compiled production website directly in the background of your local host machine without Docker.

### Pre-requisites:
Make sure PM2 is installed globally:
```bash
npm install -g pm2
```

### Run Steps:
1. Navigate to the dashboard directory and install production dependencies:
   ```bash
   cd dashboard
   ```
2. Compile production assets:
   ```bash
   npm run build
   ```
3. Start the application using our cluster configuration:
   ```bash
   pm2 start ecosystem.config.js
   ```

### PM2 Command Reference:
* **View running processes:** `pm2 list` or `pm2 status`
* **Real-time logs:** `pm2 logs`
* **Stop the server:** `pm2 stop neural-gesture-dashboard`
* **Restart the server:** `pm2 restart neural-gesture-dashboard`
