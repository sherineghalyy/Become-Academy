# BECOME Academy website

React 19 single-page site, built with esbuild. Pages: Home, About Us, Instructors, Partnerships,
Explore Courses (departments and courses), Contact Us. Booking, enroll, instructor, partner,
corporate-training and recorded-course payment forms open as popups.

## Run and build

```bash
npm install
npm run dev     # local preview at http://localhost:8000
npm run build   # production files in dist/ (upload this folder)
```

## Settings (src/config.js)

| Setting | What it does |
| --- | --- |
| `BOOKING_TO` | Email that receives every form. Currently sherineghalyy@gmail.com |
| `INSTAPAY_URL` | Instapay link shown on the Recorded payment screen |
| `PUBLIC_EMAIL`, `PHONE` | Shown on the Contact page |
| `COURSE_DATE`, `COURSE_TIME`, `DEFAULT_FEE`, `DEFAULT_SEATS`, `RECORDED_FEE` | Course defaults |

Course hours, fees and instructors are in `src/data.js` (the `COURSES` object).

## Email delivery (FormSubmit)

Forms are sent from the visitor's browser to FormSubmit, which forwards them to `BOOKING_TO`.

1. Deploy the site on your domain over HTTPS.
2. Submit one test form. FormSubmit emails an activation link to the address in `BOOKING_TO`.
3. Click it once. After that every form arrives in that inbox.

Screenshots from the Recorded payment flow arrive as email attachments.

## Hosting and security

`public/_headers` carries the security headers (Content-Security-Policy, HSTS, X-Frame-Options,
Referrer-Policy, Permissions-Policy). Netlify and Cloudflare Pages read this file as is. On another
host, add the same headers in its settings.

- Use HTTPS only and turn on the host's DDoS/bot protection (Cloudflare in front is a good default).
- Keep this GitHub repository **private**.
- Never put passwords, API keys or private download links in `src/`. Everything in a website is
  downloadable by any visitor, including the built JavaScript.
- Do not publish the Google Drive link for Recorded sessions in the code. Send it by email or
  WhatsApp after checking the payment screenshots.
- Forms have a hidden honeypot field, input length limits and a 20 second cooldown per browser.
