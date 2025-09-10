# Minimal Blog (Node.js + Express + EJS + MongoDB Atlas)

Minimal Blog with EJS server-side rendering, JWT auth, and MongoDB Atlas. The repo includes instructions for local development and running via Docker or Docker Compose.

## Features

- Public blog
  - Home page with paginated posts (newest first)
  - Single post view
  - Simple search (regex-based)
  - About and Contact pages
  - Unknown routes auto-redirect to `/home`
- Admin area
  - Login with username/password (bcrypt)
  - JWT stored in httpOnly cookie
  - Dashboard: list, create, edit, delete posts
  - Logout
- UX
  - Toast notifications for success/error (login/logout and admin actions)
  - Header shows Login/Logout contextually based on token presence
  - Centered Prev/Next pagination buttons with spacing
- Performance
  - Gzip compression
  - Avoids unnecessary DB hits on every request
  - Static assets via `public/`

## Tech Stack

- Node.js (ES Modules)
- Express
- EJS + `express-ejs-layouts`
- MongoDB + Mongoose
- JWT (`jsonwebtoken`) + `bcrypt`
- Sessions for flash/toast via `express-session` + `connect-mongo`
- Nodemon for development

## Project Structure

```
.
├─ app.js                         # App bootstrap: middleware, routes, views, 404 redirect
├─ public/
│  ├─ css/style.css               # Base styles + toast + pagination styles
│  ├─ js/script.js                # Search overlay, toast auto-hide
│  └─ img/                        # Images
├─ server/
│  ├─ config/db.js                # MongoDB connection
│  ├─ helpers/routeHelpers.js     # `isActiveRoute` helper for nav highlighting
│  ├─ models/
│  │  ├─ Post.js                  # Post schema
│  │  └─ User.js                  # User schema
│  └─ routes/
│     ├─ main.js                  # Public routes: home/home pagination, post view, search, about, contact
│     └─ admin.js                 # Admin routes: login, dashboard, add/edit/delete, logout
└─ views/
   ├─ layouts/                    # Main + Admin layouts
   ├─ partials/                   # Header(s), footer, search, toast
   ├─ admin/                      # Admin pages (dashboard, login, etc.)
   ├─ index.ejs                   # Home with pagination
   ├─ post.ejs                    # Single post
   ├─ search.ejs                  # Search results
   ├─ about.ejs, contact.ejs
```

## Getting Started (Local)

### 1) Requirements

- Node.js 18+
- MongoDB Atlas connection string

### 2) Install dependencies

```bash
npm install
```

### 3) Environment variables

Create a `.env` file at the project root:

```env
# Environment Variables
MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority"
JWT_SECRET="<strong_random_secret>"
PORT=5000
NODE_ENV=development
```

Notes:
- `MONGODB_URI`: your MongoDB connection string
- `JWT_SECRET`: a strong random secret
- `PORT`: optional (defaults to 5000)
- `.env` is ignored by git (.gitignore)

### 4) Run

- Development (hot reload):

```bash
npm run dev
```

- Production-like:

```bash
npm start
```

App runs at `http://localhost:5000`.

## Usage

### Public routes

- `/` or `/home`: home page with posts list and pagination (`/?page=2`)
- `/post/:id`: single post
- `/search` (POST): body `{ searchTerm }`
- `/about`, `/contact`
- Any unknown route → redirected to `/home`

### Admin routes

- `GET /admin`: login page
- `POST /admin`: submit login
  - On success: sets `token` cookie and redirects to `/dashboard`
  - On failure: toast error and redirect back to `/admin`
- `GET /dashboard`: requires auth
- `GET /add-post`, `POST /add-post`: create post
- `GET /edit-post/:id`, `PUT /edit-post/:id` (via `_method=PUT`): edit post
- `DELETE /delete-post/:id` (via `_method=DELETE`): delete post
- `GET /logout`: clears cookie and redirects to `/`

## Authentication Model

- On login, the server signs a JWT: `jwt.sign({ userId }, JWT_SECRET)` and sets an httpOnly cookie `token`.
- A lightweight global `checkAuth` middleware decodes the token if present and exposes a truthy `res.locals.user` for EJS header rendering (no DB query required).
- Protected admin routes use `authMiddleware` to enforce authorization. On failure, user is redirected to `/admin` with a toast message.

## Toast Notifications

- Flash message: `req.session.toast = { type: "success"|"error"|"info", message }`
- Displayed via `views/partials/toast.ejs` and auto-hides after ~3s (or on close click) via `public/js/script.js`.
- Emitted on login, logout, and admin CRUD actions.

## Pagination

- `perPage = 5`
- Controller passes `current`, `prevPage`, and `nextPage` to `views/index.ejs`.
- UI: centered Prev/Next with spacing using `.pagination-nav`.

## Performance Notes

- `compression()` for gzip responses
- `saveUninitialized: false` so sessions are not created for anonymous requests
- Global auth only decodes JWT (no user DB lookup per request)
- Use of `lean()` for read-only queries when rendering views (where applicable)
- Static assets served from `public/`

## Development Tips

- If you see `Error: secretOrPrivateKey must have a value`, ensure `.env` is present and `JWT_SECRET` is set.
- If nodemon loops due to file changes, ensure large folders (e.g., `.git`, `node_modules`) are ignored by default and environment files are correctly loaded.
- For production, set `NODE_ENV=production` and ensure a strong `JWT_SECRET`.

---

## Docker

### Build a local image
```bash
docker build -t minimal-blog:local .
docker run -d --name minimal-blog -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e JWT_SECRET=your_secret \
  -e MONGODB_URI="mongodb+srv://user:pass@cluster/db?retryWrites=true&w=majority" \
  minimal-blog:local
```

### Docker Compose (Atlas)
Minimal `docker-compose.yml`:
```yaml
services:
  app:
    build: .
    environment:
      - NODE_ENV=production
      - PORT=5000
      - JWT_SECRET=${JWT_SECRET}
      - MONGODB_URI=${MONGODB_URI}
    ports:
      - "80:5000"
    restart: unless-stopped
```

Run:
```bash
docker compose up -d --build
```

Sample `.env`:
```env
PORT=5000
JWT_SECRET=<secret>
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
```

---

## Scripts

- `npm run dev` — start with nodemon
- `npm start` — start normally

## License

MIT

## Author

**SangTran13** — GitHub: [@SangTran13](https://github.com/SangTran13)

---

*Built with ❤️ using Node.js and Express.js*
