# Frameflow — YouTube Studio Assistant

A responsive, open-source workspace for planning videos across multiple YouTube channels. Create long-form and Shorts projects, organize scripts and assets, track production stages, and keep project files in Google Drive. The frontend is static HTML/CSS/vanilla JavaScript and can be hosted on GitHub Pages; Google Apps Script provides an optional backend using your own Google Sheet and Drive.

## Features

- Dashboard with project totals, recent work and workflow progress.
- Dynamic channel management: add, edit, enable, disable and delete channels.
- Configurable video formats, categories, languages and workflow stages.
- Project workspace with title, description, script, asset list and per-stage checkboxes.
- Per-project Drive folders and file uploads after connecting Apps Script.
- Activity timeline, JSON backup and import.
- Works locally in the current browser before cloud setup. Browser data is not shared across devices.
- Each person supplies their own Apps Script URL. This repository contains no credentials.

## Quick start: GitHub Pages

1. Fork this repository, or create a repository and add these files.
2. In GitHub, open **Settings → Pages**.
3. Choose **Deploy from a branch**, select your default branch and `/ (root)`, then save.
4. Open the published Pages URL. No Node, build step or localhost server is needed.
5. In the app, visit **Settings** to add channels and customize your workflow. You can use the app in local-only mode immediately.

GitHub Pages is static hosting. It cannot create folders on a visitor's computer. Files selected in the browser are uploaded to that user's Google Drive only after Apps Script setup; without that connection, Frameflow records asset names in browser storage and does not retain the file contents.

## Connect your own Google Sheets and Drive

Each fork/user should create a private deployment tied to their Google account. Do not share a deployment URL with strangers. Apps Script web app access controls determine who can call it; this minimal app is intended for one owner's personal workspace, not as a public multi-user service.

1. Sign in to the Google account that should own the studio data. Create a new Apps Script project at [script.google.com](https://script.google.com).
2. Replace the starter source with `apps-script/Code.gs` and save.
3. Select **Deploy → New deployment → Web app**.
4. Set **Execute as** to your account. For personal use, choose the narrowest **Who has access** option that includes you (typically **Only myself**). The exact available choices depend on the Google account type and organization policy.
5. Deploy, complete Google's authorization prompts for Sheets and Drive, and copy the web app URL ending in `/exec`.
6. In Frameflow **Settings**, paste that URL and choose **Save**. Select **Test connection**. The first backend use creates your spreadsheet and `Frameflow Projects` Drive folder automatically.
7. Create a project. The backend adds its row to Sheets and creates its Drive folder. Upload files from the project workspace.

To update the Apps Script after editing its source, use **Deploy → Manage deployments → Edit**, select a new version and deploy. The existing `/exec` URL normally remains the same.

### Permissions and safety

- The Apps Script requests access to create/read its Sheet and Drive files. Review Google's consent screen before authorizing.
- `SPREADSHEET_ID` and `DRIVE_FOLDER_ID` are kept in that script's Script Properties. They are not embedded in the Pages site.
- Do not change the deployment to anonymous/public access for convenience. Anyone who can call an unprotected script running as you could access or change your data.
- Apps Script web apps have evolving access policies, quotas and runtime limits. If your account does not allow the selected access mode, keep the frontend in local-only mode or adapt the backend with a proper authenticated service.
- This starter is single-owner and does not implement account login, team permissions, or YouTube publishing/API integration.

## Upload limits

This browser uploader caps each file at **25 MB**. Apps Script requests pass file bytes as base64, which increases request size and can run into Apps Script execution/request limits. It is suitable for scripts, images, audio snippets and small references, not full-resolution source footage. For large video, upload it directly to Drive (in the project's folder) and keep the link in the project, or replace the uploader with a resumable authenticated upload service. Drive quotas and storage depend on the user's Google account.

## Data and backup

- Without Apps Script, data is stored in this browser's local storage. Clearing browser site data removes it; use **Settings → Backup & portability** to download JSON regularly.
- With Apps Script configured, settings and project metadata are stored in the generated Sheet; uploaded file contents live in Drive.
- JSON backups contain project metadata, tasks and asset references, not the bytes of uploaded assets. Importing a backup restores metadata and creates missing project Drive folders; it does not copy referenced files.
- Disabling or deleting a channel does not delete its projects. Deleting a project deletes its metadata only; existing Drive files/folders are retained.

## Repository layout

```text
index.html              App shell
styles.css              Responsive visual design
app.js                  Vanilla JavaScript client and local/cloud data flow
apps-script/Code.gs      Google Apps Script API
LICENSE                 MIT License
```

## Customization

Use **Settings** for channels, formats, categories, languages and workflow stages. The defaults are only starting values. The app uses no framework, package manager or build system.

## License

MIT. See [LICENSE](LICENSE).
