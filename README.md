# Clinipedia

A personal clinical knowledge base — infinitely nestable categories, subcategories, and rich text fragments with image/video support.

## Stack

- **Backend:** Node.js + Express + JWT auth
- **Database:** PostgreSQL 16
- **Frontend:** Vanilla JS with Tiptap rich text editor (ES modules via importmap)
- **Deployment:** Docker Compose on Coolify

---

## Local development

### Prerequisites
- Node.js 20+
- Docker + Docker Compose (for the database)

### 1. Start the database
```bash
cp .env.example .env
# Edit .env with your values
docker compose up db -d
```

### 2. Install dependencies & run backend
```bash
cd backend
npm install
cd ..
# From project root:
DB_PASSWORD=yourpass JWT_SECRET=yoursecret ADMIN_USERNAME=admin ADMIN_PASSWORD=yourpass node backend/server.js
```

Or use a local `.env` file and `dotenv`:
```bash
cd backend && npm install && cd ..
node -r dotenv/config backend/server.js dotenv_config_path=.env
```

The app will be available at http://localhost:3000

---

## Deploying to Coolify via GitHub

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/cardio-kb.git
git push -u origin main
```

### 2. Create a new resource in Coolify
1. In Coolify dashboard → **New Resource** → **Docker Compose**
2. Connect your GitHub account and select this repository
3. Set the branch to `main`
4. Coolify will detect the `docker-compose.yml` automatically

### 3. Set environment variables
In Coolify → your service → **Environment Variables**, add:

| Variable | Value |
|---|---|
| `DB_PASSWORD` | A strong random password |
| `JWT_SECRET` | A long random string (32+ chars) |
| `ADMIN_USERNAME` | Your chosen username |
| `ADMIN_PASSWORD` | A strong password |

**Tip:** Generate secrets with: `openssl rand -base64 32`

### 4. Set up your domain
In Coolify → your service → **Domains**, add your domain (e.g. `kb.yourdomain.com`).
Coolify handles SSL via Let's Encrypt automatically.

### 5. Deploy
Click **Deploy**. Coolify will:
1. Pull your repo
2. Build the Docker image
3. Start the app + PostgreSQL containers
4. Configure SSL and reverse proxy

---

## Project structure

```
cardio-kb/
├── docker-compose.yml      # App + Postgres services
├── Dockerfile              # Builds the Node app
├── .env.example            # Environment variable template
├── .gitignore
├── README.md
├── backend/
│   ├── package.json
│   ├── server.js           # Express entry point + auth middleware
│   ├── db.js               # PostgreSQL connection + schema init
│   └── routes/
│       ├── auth.js         # Login + token verify endpoints
│       └── nodes.js        # CRUD for all nodes (categories/fragments)
└── frontend/
    ├── index.html          # App shell + login screen
    ├── style.css           # All styles
    └── app.js              # Vanilla JS app (ES modules, Tiptap editor)
```

---

## Data model

Everything is a **node** with a recursive parent/child relationship:

```
nodes
  id          SERIAL PRIMARY KEY
  parent_id   FK → nodes(id) ON DELETE CASCADE
  type        'category' | 'subcategory' | 'fragment'
  title       TEXT
  content     TEXT (HTML from Tiptap, for fragments)
  color       TEXT (hex colour)
  position    INTEGER (for ordering)
  created_at  TIMESTAMPTZ
  updated_at  TIMESTAMPTZ
```

Deleting any node cascades to delete all its descendants.

---

## API endpoints

All `/api/nodes/*` routes require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/auth/verify` | Verify token |
| `GET` | `/api/nodes?parent_id=x` | List children |
| `GET` | `/api/nodes/:id` | Get single node |
| `GET` | `/api/nodes/:id/breadcrumb` | Get ancestor chain |
| `POST` | `/api/nodes` | Create node |
| `PATCH` | `/api/nodes/:id` | Update node |
| `PATCH` | `/api/nodes/bulk/reorder` | Reorder nodes |
| `DELETE` | `/api/nodes/:id` | Delete node + descendants |

---

## Updating the app

After pushing changes to GitHub:
1. Coolify auto-deploys if you enabled **Auto Deploy** (watch for new commits)
2. Or manually: Coolify dashboard → your service → **Redeploy**

Your PostgreSQL data is stored in a named Docker volume (`postgres_data`) and is preserved across redeployments.
