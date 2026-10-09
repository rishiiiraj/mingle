# Mingle MVP1

Live site: https://mingle-alpha.vercel.app

A static web app (index.html, style.css, app.js) hosted on Vercel, with a Supabase database (project "mingle", Mumbai region). There is no build step and no npm install.

## How it works
- app.js holds all screens and rules (fit rules, match score, contract locking).
- The browser talks to Supabase only through database functions in supabase/schema.sql. Each function checks a code first: a creator's private code, a brand's brief code, a contract code, or the team key. Tables cannot be read directly.
- The Supabase URL and publishable key at the top of app.js are meant to be public. The team key is stored in the database, not in the code.
- supabase/demo_data.sql is the demo data (every name ends in "(dummy)").
- supabase/migrations/ holds changes applied after schema.sql, in date order. A backup of every table taken before the 9 Oct 2026 migration is in the database schema backup_20261009.
- Pilot metrics (North Star, every goal metric with its target, both funnels) are on the Team page, Pilot tab. They are computed from the tables and the events table; team actions carry is_team and are left out.

## Run locally
Open a terminal in this folder and run `npx serve .`, then open the address it prints. It uses the live Supabase database.

## Deploy changes
The Vercel project "mingle" is connected to this repository. Every push to `main` deploys to https://mingle-alpha.vercel.app automatically, usually within a minute. Work on a branch and open a pull request if you want a preview link before it goes live.

## Routes
- /                   home: pick creator or brand
- /creator, /brand    each side's start page
- /c/<handle>         brand brief form for a creator
- /me/<code>          a creator's private offers
- /deal/<id>?t=<code> contract, opened by either side's code
- /brief              campaign brief
- /team               team page (needs the team key): Pilot metrics, Verify, Campaigns, Deals, Links
