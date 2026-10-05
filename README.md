# Mingle MVP1

Live site: https://mingle-alpha.vercel.app

A static web app (index.html, style.css, app.js) hosted on Vercel, with a Supabase database (project "mingle", Mumbai region). There is no build step and no npm install.

## How it works
- app.js holds all screens and rules (fit rules, match score, contract locking).
- The browser talks to Supabase only through database functions in supabase/schema.sql. Each function checks a code first: a creator's private code, a brand's brief code, a contract code, or the team key. Tables cannot be read directly.
- The Supabase URL and publishable key at the top of app.js are meant to be public. The team key is stored in the database, not in the code.
- supabase/demo_data.sql is the demo data (every name ends in "(dummy)").

## Run locally
Open a terminal in this folder and run `npx serve .`, then open the address it prints. It uses the live Supabase database.

## Deploy changes
You need to be added to the Vercel team that owns the "mingle" project.
1. In this folder: `npx vercel@latest login`
2. Then: `npx vercel@latest --prod` and, when asked, link to the existing project "mingle".

## Routes
- /                   home (Creator / Brand / Team)
- /c/<handle>         brand brief form for a creator
- /me/<code>          a creator's private offers
- /deal/<id>?t=<code> contract, opened by either side's code
- /brief              campaign brief
- /team               team page (needs the team key)
