# Website Audit App

Automated website testing with a checklist. Enter a URL, run the audit, and get a report with pass/fail for each item and a total score.

## Tech Stack

- **Frontend:** HTML + Tailwind CSS
- **Backend:** Node.js (Express)
- **Analysis:** Puppeteer

## Features

- Input field for website URL
- "Run Website Audit" button
- Automatic checks: website live, mobile, Google Maps, contact details, images
- SEO checks: city in title, meta description, image alt text
- Sales checks: demo link, screenshot, email template, email ready
- Report with ✓/✗ and score (e.g. 9 / 12)
- Homepage screenshot in the report
- Pre-filled email template with "Open in email client" link

## Setup

```bash
cd website-audit-app
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000), enter a URL, and click **Run Website Audit**.

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
| Sales     | Demo link exists         |
| Sales     | Screenshot generated     |
| Sales     | Email template filled    |
| Sales     | Email sent (manual)      |
