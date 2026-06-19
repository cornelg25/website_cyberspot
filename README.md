# Cyberspot — Marketing Website

Production-ready marketing site for [cyberspot.eu](https://cyberspot.eu). Pure HTML5/CSS3/vanilla JS — deployable to GitHub Pages with zero configuration.

## File Structure

```
/
├── index.html              # Main page (all sections)
├── assets/
│   ├── css/styles.css      # All styles + CSS variables
│   ├── js/main.js          # All interactions & animations
│   └── images/logo.png     # Cyberspot logo
├── sitemap.xml
├── robots.txt
├── .nojekyll               # Required for GitHub Pages
└── README.md
```

## Deploy to GitHub Pages

### Option A — New repository
1. Create a new repository on GitHub (e.g. `cyberspot-website`)
2. Clone it locally: `git clone https://github.com/your-org/cyberspot-website`
3. Copy all files into the cloned directory
4. Push to main:
   ```bash
   git add .
   git commit -m "Initial deploy"
   git push origin main
   ```
5. In GitHub → Settings → Pages → set Source to **Deploy from a branch**, branch: `main`, folder: `/ (root)`
6. Your site will be live at `https://your-org.github.io/cyberspot-website/`

### Option B — Custom domain (cyberspot.eu)
1. Follow Option A first
2. In GitHub → Settings → Pages → Custom domain → enter `cyberspot.eu`
3. Add a `CNAME` file at repo root containing `cyberspot.eu`
4. Update DNS with your registrar:
   - `A` records pointing to GitHub Pages IPs: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Or a `CNAME` record: `www` → `your-org.github.io`
5. Enable "Enforce HTTPS" in GitHub Pages settings (available after DNS propagates)

## Form Setup (Formspree)
The contact form currently prevents default submission and shows a thank-you message client-side. To connect it to a real backend:

1. Sign up at [formspree.io](https://formspree.io)
2. Create a new form, copy the endpoint URL (e.g. `https://formspree.io/f/xabcdefg`)
3. In `index.html`, update the form `action` attribute:
   ```html
   <form id="contact-form" action="https://formspree.io/f/YOUR_ID" method="POST">
   ```
4. In `assets/js/main.js`, replace the simulated submit with a real fetch call if needed

## Local Development
No build tools required. Open `index.html` directly in a browser, or use a local server:
```bash
# Python
python3 -m http.server 8000

# Node (npx)
npx serve .
```

## Browser Support
Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+). Graceful degradation for older browsers via `prefers-reduced-motion` support and CSS fallbacks.
