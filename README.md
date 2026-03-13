# Website Audit App

Automated website testing with a checklist. Enter a URL, run the audit, and get a report with pass/fail for each item and a total score. Runs as a **website app** you can use in the browser or deploy live.

## Tech Stack

- **Frontend:** HTML + Tailwind CSS
- **Backend:** Node.js (Express)
- **Analysis:** Puppeteer

## Features

- Input field for website URL
- "Run Website Audit" button
- Automatic checks: website live, mobile, Google Maps, contact details, images
- SEO checks: city in title, meta description, image alt text
- Report with ✓/✗ and score (e.g. 8 / 8)

## Run locally

```bash
cd website-audit-app
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000), enter a URL, and click **Run Website Audit**.

## Deploy as a live website

Deploy to the cloud so anyone can use the app at a public URL.

### Option 1: Render (recommended)

1. Push this repo to GitHub (see [WebsiteChecklistChecker](https://github.com/JoshuaMons/WebsiteChecklistChecker)).
2. Go to [render.com](https://render.com) → **New** → **Web Service**.
3. Connect the **WebsiteChecklistChecker** repo.
4. Render will detect the `Dockerfile` and deploy. Use the **Docker** runtime.
5. After deploy, your app will be live at `https://your-service.onrender.com`.

### Option 2: Docker

```bash
docker build -t website-audit-app .
docker run -p 3000:3000 website-audit-app
```

Then open [http://localhost:3000](http://localhost:3000).

## Checklist Items

| Category   | Check                    |
|-----------|--------------------------|
| Website   | Website live (HTTP 200)  |
| Website   | Works on mobile          |
| Website   | Google Maps embedded     |
| Website   | Contact details present |
| Website   | Images loaded correctly  |
| SEO       | City name in title       |
| SEO       | Meta description exists  |
| SEO       | Images have alt text     |
