HKD DEWAS QR CODE — FRONT-END DEMO

Files
- index.html: landing page, FAQ, contact section, demo sign-up and profile view
- style.css: responsive styling
- app.js: demo sign-up flow, QR generation, profile links and QR download
- config.js: demo-only access code configuration
- logo.png / favicon.png / hkd-dewas-qr-code-main.png: brand assets

Run
Upload the contents of this folder to a static web host, or open index.html in a browser.
An internet connection is needed for Google Fonts, Font Awesome icons and the QRCode.js CDN.

Demo sign-up
- Demo access code: 123456
- Enter a name and email, then the demo code.
- Fill in the business details and a valid review-page URL.
- Generate and download the QR code.
- Scan it to open the business profile.

Important limitations
This is a front-end demo only. It does not create a real account, store data in a database, verify access on a server, or provide real scan analytics/admin functionality. The demo code is visible in config.js and must not be treated as secure. Profile fields are encoded in the profile URL, so anyone with that link can view those details. Do not enter sensitive personal or business information.

Production recommendations
Implement server-side authentication, per-client access codes, database-backed QR profiles, access controls, consent/privacy notices, and analytics before using this for real customers.
