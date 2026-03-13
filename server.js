const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Normalize URL to have protocol
function normalizeUrl(input) {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  return url;
}

// Run all audit checks
async function runAudit(url) {
  const results = {
    websiteCheck: {},
    seoCheck: {},
  };

  let browser;
  let page;

  try {
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    };
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    browser = await puppeteer.launch(launchOptions);

    page = await browser.newPage();

    // Set user agent to avoid blocks
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // --- Website Check ---

    // 1. Website live (HTTP 200)
    let response;
    try {
      response = await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      results.websiteCheck.live = response && response.status() === 200;
    } catch (e) {
      results.websiteCheck.live = false;
    }

    if (!results.websiteCheck.live) {
      await browser.close();
      return buildReport(results, url);
    }

    // 2. Works on mobile (viewport responsive)
    const desktopWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    await page.setViewport({ width: 375, height: 667 });
    await new Promise((r) => setTimeout(r, 500));
    const mobileWidth = await page.evaluate(() => document.documentElement.clientWidth);
    const hasViewportMeta = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return !!meta && meta.content.length > 0;
    });
    results.websiteCheck.mobile = hasViewportMeta && mobileWidth <= 375;

    // Reset viewport for rest of checks
    await page.setViewport({ width: 1280, height: 800 });

    // 3. Google Maps works (embedded map iframe)
    results.websiteCheck.googleMaps = await page.evaluate(() => {
      const iframes = document.querySelectorAll('iframe[src*="google"], iframe[src*="maps"], iframe[src*="googletagmanager"]');
      const mapsIframes = Array.from(iframes).filter(
        (i) =>
          (i.src && (i.src.includes('google.com/maps') || i.src.includes('maps.google'))) ||
          i.id?.toLowerCase().includes('map')
      );
      return mapsIframes.length > 0;
    });

    // 4. Contact details (phone/email)
    results.websiteCheck.contactDetails = await page.evaluate(() => {
      const body = document.body?.innerText || '';
      const phoneRegex = /(\+?[\d\s\-\.\(\)]{10,})|(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/;
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      return phoneRegex.test(body) || emailRegex.test(body);
    });

    // 5. Images loaded correctly
    results.websiteCheck.imagesCorrect = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      if (imgs.length === 0) return true;
      let loaded = 0;
      imgs.forEach((img) => {
        if (img.complete && img.naturalWidth > 0) loaded++;
      });
      return loaded === imgs.length;
    });

    // --- SEO Check ---

    const title = await page.title();
    const cityPattern = /\b(amsterdam|rotterdam|utrecht|den haag|eindhoven|groningen|tilburg|almere|breda|nijmegen|enschede|haarlem|arnhem|zaandam|amersfoort|apeldoorn|den bosch|hoofddorp|maastricht|leiden|dordrecht|zoetermeer|zwolle|deventer|delft|heerenveen|venlo|leeuwarden|helmond|canberra|sydney|melbourne|brisbane|perth|adelaide|new york|los angeles|chicago|london|berlin|paris|toronto|vancouver|city|town)\b/i;
    results.seoCheck.cityInTitle = cityPattern.test(title);

    results.seoCheck.metaDescription = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="description"]');
      return !!(meta && meta.getAttribute('content') && meta.getAttribute('content').trim().length > 0);
    });

    results.seoCheck.altText = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      if (imgs.length === 0) return true;
      const withAlt = Array.from(imgs).filter((i) => i.alt && i.alt.trim().length > 0);
      return withAlt.length === imgs.length;
    });

    await browser.close();
  } catch (err) {
    if (browser) await browser.close();
    throw err;
  }

  return buildReport(results, url);
}

function buildReport(results, url) {
  const websiteCheck = {
    live: results.websiteCheck.live,
    mobile: results.websiteCheck.mobile,
    googleMaps: results.websiteCheck.googleMaps,
    contactDetails: results.websiteCheck.contactDetails,
    imagesCorrect: results.websiteCheck.imagesCorrect,
  };

  const seoCheck = {
    cityInTitle: results.seoCheck.cityInTitle,
    metaDescription: results.seoCheck.metaDescription,
    altText: results.seoCheck.altText,
  };

  const allResults = [
    ...Object.values(websiteCheck),
    ...Object.values(seoCheck),
  ];
  const passed = allResults.filter(Boolean).length;
  const total = allResults.length;

  return {
    url,
    websiteCheck,
    seoCheck,
    score: { passed, total },
  };
}

app.post('/api/audit', async (req, res) => {
  const { url: inputUrl } = req.body;
  if (!inputUrl || typeof inputUrl !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  const url = normalizeUrl(inputUrl);

  try {
    const report = await runAudit(url);
    res.json(report);
  } catch (err) {
    console.error('Audit error:', err);
    res.status(500).json({
      error: 'Audit failed',
      message: err.message || 'Could not load or analyze the website.',
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Website Audit App running at http://localhost:${PORT}`);
});
