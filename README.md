# Kids Jars

A mobile-first homelab web app for teaching children the Barefoot Investor jars concept.

## Current scope

- Parent and child views with age-appropriate copy (Little Kids / Big Kids modes)
- Parent authentication with HMAC-signed cookie sessions
- Child profile unlock with scrypt-hashed PIN session
- Four jars: Spend, Save, Give, and Grow (inspired by Barefoot Investor for Families)
- SVG jar illustrations with animated liquid fill, bounce, coins, and empty-state personality
- Tap +/− coin steppers with Web Audio sound effects (coin clink, success chime, badge fanfare)
- Coin-drop celebration burst on successful sort
- Goal-driven storytelling with Save jar goal progress cards
- Configurable automatic pocket money schedules (weekly/fortnightly/monthly) and manual top-ups
- Optional Grow jar per child (toggled by parent)
- Suggested split auto-fill based on Barefoot-style percentage targets
- 10-badge achievement system with streak, balance, and generosity milestones
- Sorting streak tracker with consecutive-week fire emojis
- Weekly rotating family money-chat conversation prompts
- Bar chart history with inflow vs sorted legend
- Recent activity feed with descriptive entries
- Mini jar visuals on child picker cards
- Hero jar showcase with staggered bobbing animation on landing page
- iPad-optimised responsive layout with touch-specific interactions
- PWA manifest for standalone home-screen install
- Error boundaries and loading spinners for all routes
- Empty states for zero-children, zero-balance, and zero-activity scenarios
- Authenticated household backup export endpoint (`/api/backup`)
- Private self-hosting with local JSON persistence for v1

## Stack

- Next.js 15 with the App Router
- TypeScript
- Local JSON storage in `data/store.json`
- Mobile-first PWA metadata

## Local development

1. Copy `.env.example` to `.env.local` and set strong values for `AUTH_SECRET`, `PARENT_PASSWORD`, and `CRON_SECRET`.
1. If serving over plain `http://` on a private LAN, set `AUTH_COOKIE_SECURE=false` so login cookies work without TLS.
1. Install Node.js 22.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

The first run creates `data/store.json` automatically with sample children so the flows are immediately usable.

## LXC deployment

This repo is designed for a simple Node deployment inside a Proxmox LXC container (no Docker needed).

### 1. Create the LXC

```bash
# On the Proxmox host — adjust ID, storage, and network to taste
pct create 120 local:vztmpl/debian-12-standard_12.7-1_amd64.tar.zst \
  --hostname kids-jars \
  --memory 512 \
  --cores 1 \
  --rootfs local-lvm:4 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --unprivileged 1 \
  --features nesting=1 \
  --start 1
```

### 2. Bootstrap inside the LXC

```bash
pct enter 120

# Install Node 22 and nginx
apt update && apt install -y curl nginx git
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Clone the repo
git clone https://github.com/bouncingcastle/jars.git /opt/kids-jars
cd /opt/kids-jars

# Configure environment
cp .env.example .env.local
nano .env.local   # set AUTH_SECRET, PARENT_PASSWORD, CRON_SECRET, and AUTH_COOKIE_SECURE

# Build
npm install
npm run build

# Create data directory with correct permissions
mkdir -p data
chown www-data:www-data data
```

### 3. Install the systemd service

```bash
cp deploy/systemd/kids-jars.service /etc/systemd/system/
cp deploy/systemd/kids-jars-cron.service /etc/systemd/system/
cp deploy/systemd/kids-jars-cron.timer /etc/systemd/system/

# write the cron secret from .env.local to /etc/default/cron-secret
echo "your-cron-secret" > /etc/default/cron-secret
chmod 600 /etc/default/cron-secret

systemctl daemon-reload
systemctl enable --now kids-jars
systemctl enable --now kids-jars-cron.timer
```

Verify it's running:

```bash
curl -s http://127.0.0.1:3000 | head -20
```

### 4. Configure nginx reverse proxy

```nginx
# /etc/nginx/sites-available/kids-jars
server {
    listen 80;
    server_name jars.yourdomain.local;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/kids-jars /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### 5. Updates

```bash
cd /opt/kids-jars
git pull
npm install
npm run build
systemctl restart kids-jars
```

## Security checklist

- Set a long random `AUTH_SECRET` in production.
- Set a strong `PARENT_PASSWORD` and rotate it periodically.
- Set a random `CRON_SECRET` and keep `/etc/default/cron-secret` readable only by root.
- Keep `AUTH_COOKIE_SECURE=true` when using HTTPS. Only set it to `false` on trusted private HTTP networks.
- Keep the app behind your private network or authenticated reverse proxy.
- Child PIN values are stored as salted hashes.
- Use the parent session to download encrypted-at-rest backups from `/api/backup`.

## Bug tracking

- Track active production issues in `BUGS.md`.

## Backlog

- **Dark mode** — respect `prefers-color-scheme` and add a toggle
- **Offline PWA** — service worker with cache-first strategy for static assets
- **Haptic feedback** — `navigator.vibrate()` on coin taps for mobile devices
- Replace JSON persistence with SQLite and Prisma
- Backup restore flow with signed imports and audit trail
- Configurable jar split percentages per child (currently Barefoot defaults)
- Multi-currency / locale-aware formatting
- Push notification reminders for weekly sorting
