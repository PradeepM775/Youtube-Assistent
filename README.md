# F.R.A.M.E. — YouTube Studio Assistant

A responsive, open-source YouTube production workspace. Plan projects, compare three title options, keep multiple script drafts, organize media, track workflow stages, and sync work across devices with your own Google Apps Script, Sheets and Drive.

## Features

- Responsive dashboard, project board and media library.
- Project settings for channel, long video/Shorts, category, language, title and description.
- Three A/B title fields, per-field copy buttons, and description copy.
- Multiple named script drafts per project with add, save, delete and copy actions.
- Per-stage production tracking, activity log, backup and import.
- Optional Apps Script backend: each account has separate settings, project data and Drive folder.
- Admin-only account panel to create, enable, disable and reset member accounts.
- Vanilla HTML, CSS and JavaScript frontend; no build step or package manager.

## Publish the frontend with GitHub Pages

1. Fork this repository or upload these files to your own GitHub repository.
2. Open **Settings → Pages**. Choose **Deploy from a branch**, select your default branch and `/ (root)`, then save.
3. Open the published Pages address. The app works in local-only mode in that browser until cloud setup is complete.

## Set up your private backend

Each fork owner must deploy their own Apps Script, Sheet and Drive storage. Do not use somebody else's deployment URL.

1. Sign in to the Google account that will own the studio data and open [script.google.com](https://script.google.com).
2. Create a project. Replace its source with the full contents of `apps-script/Code.gs` and save.
3. In the function selector, run **`initializeBootstrapKey`** once. Approve Google Sheets and Drive access. Open the execution log and copy the one-time key. Keep it private. If you already ran the function and lost the key, delete the `BOOTSTRAP_KEY` Script Property in **Project Settings → Script Properties**, then run the function again.
4. Select **Deploy → New deployment → Web app**. Set **Execute as** to your Google account. Choose the access option that allows the app's intended users to reach the endpoint (usually **Anyone**). Google account policy may restrict this option. Copy the URL ending in `/exec`.
5. In the GitHub Pages app, paste that URL in the sign-in screen under **Change Apps Script address**, then save it.
6. Choose **Set up the first administrator**. Enter the one-time key, your admin user ID, and a strong password of at least 12 characters. The key is removed after the first admin is created.
7. Sign in. In **Settings → Admin · user accounts**, create member IDs and initial passwords. Give each member their credentials privately. Users can change their own passwords; the admin can disable accounts or reset passwords.
8. Open the same Pages address on another computer and enter the same Apps Script URL. Sign in with the same account to access that account's synced projects and settings.

The Sheet and Drive files belong to the Google account that deployed the script. Each application account has its own project data and Drive folder. The administrator can create accounts and manage members, while ordinary members cannot access the admin actions. Sessions expire after seven days. Passwords are stored as salted hashes; session tokens are stored in the browser.

### Deployment access and security

A custom account form needs the Apps Script endpoint to be reachable from the browser. If you select an access mode such as **Anyone**, the endpoint can be reached by others too; the app requires a valid account session for data actions, separates data by account, and limits repeated failed logins. Keep the bootstrap key and account passwords private, use strong passwords, and disable accounts that should no longer sign in. The Apps Script deployment runs with its owner's Google permissions, so deploy only your own reviewed source and check Google's consent prompts. If your organization does not permit the required web app access mode, this custom login flow cannot sync across separate users/devices under that policy.

After changing `Code.gs`, use **Deploy → Manage deployments → Edit**, select a new version and deploy. The `/exec` URL normally remains unchanged. The static app can be updated by pushing changed files to the Pages branch.

## Browser uploads and local mode

Uploads are limited to 25 MB per file in this starter. Apps Script base64 requests can reach runtime/request limits below that size, so use Drive directly for large source footage. In local-only mode, files are held in that browser's IndexedDB and do not follow you to another computer. Cloud mode stores file contents in the project's Drive folder.

Existing local project metadata is offered for import into the first admin account when the server has no projects. Browser-held file bytes do not migrate; upload those files again or add them directly to Drive. JSON backup files contain project metadata and asset references, not the actual media bytes.

## Repository contents

- `index.html` — app shell
- `styles.css` — responsive design
- `app.js` — frontend and account experience
- `apps-script/Code.gs` — Apps Script API and account storage
- `LICENSE` — MIT License

## License

MIT. See [LICENSE](LICENSE).
