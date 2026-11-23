# NAZARITH CAPITAL V8.0 — NETLIFY DEPLOYMENT

This is the standalone edition. It does not require Supabase, API credentials, environment variables, or a build step.

## Deploy using Netlify Drop
1. Open https://app.netlify.com/drop.
2. Drag the project folder (the folder containing `index.html`) into the upload area.
3. Wait for Netlify to publish the site and provide its URL.

## Deploy using GitHub
1. Push the project files to the root of a GitHub repository.
2. In Netlify, choose **Add new site → Import an existing project**.
3. Select the repository.
4. Set **Build command** to empty and **Publish directory** to `.`.
5. Deploy.

## Data storage notice
User accounts, trading journals, screenshots, and settings are stored in the browser's Local Storage. Data does not synchronize between devices or browsers. Use **Data & Backup** to export a JSON backup regularly. No Supabase environment variables are needed.
