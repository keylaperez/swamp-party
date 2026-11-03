# Keyla's 25th — Romp in the Swamp

The party invite site has a costume board and an RSVP pop-up. Responses are saved to a Google Sheet.

## Folder layout

```
swamp-party/
├── index.html
├── Code.gs        ← reference copy of the Google Sheets script (keep the address OUT of it)
├── README.md
└── images/
    ├── baby.jpg   ← your baby photo (square-ish crop works best)
    └── ...        ← any other photos you want in the gallery
```

## 1. Set up the Google Sheet (about 5 minutes)

1. Create a new Google Sheet and name it something like "Swamp Party RSVPs".
2. In the Sheet, go to **Extensions → Apps Script**.
3. Delete what's there and paste in everything from `Code.gs`.
4. On the `PARTY_ADDRESS` line, type the real address. Do this **in the Apps Script editor only**, not in the repo copy:
   `const PARTY_ADDRESS = "your full street address";`
5. Click **Save**.
6. Click **Deploy → New deployment**, then click the gear icon and choose **Web app**.
   - Description: `swamp party`
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Click **Deploy**, approve the permissions, and copy the **Web app URL**. It ends in `/exec`.
   - Google will show an "unverified app" screen. Click **Advanced → Go to (project name)**. This is normal for your own scripts.
8. In `index.html`, paste that URL into `const API_URL = "";` near the bottom of the file.

The `RSVPs` and `Costumes` tabs are created automatically the first time someone submits.

**If you edit the script later:** go to **Deploy → Manage deployments → pencil icon → Version: New version → Deploy**. This keeps the same URL.

## 2. Put it on GitHub Pages from VS Code

1. Open the `swamp-party` folder in VS Code.
2. Open the **Source Control** panel and click **Publish to GitHub**. Choose a **public** repo named `swamp-party`.
3. On github.com, open the repo and go to **Settings → Pages**. Set Source to **Deploy from a branch**, then pick **main** and **/(root)**, and click **Save**.
4. After a minute or two the site will be live at:
   **https://keylaperez.github.io/swamp-party/**

For later changes, edit the files, then **Commit → Sync** in VS Code. The site updates in about a minute.

## Privacy notes

- Free GitHub Pages sites are public. Anyone with the link can open the site, but it isn't listed anywhere.
- The **address is never in the repo or the page code**. It only comes back from Google after someone submits an RSVP saying they're coming.
- The costume board shows costumes only, not names.

## Testing before you send it

If `API_URL` is empty, the page runs in **demo mode**: submissions are saved only in your own browser. You can try everything locally with VS Code's Live Server extension. Once the URL is in, submit a test RSVP and costume, check that they show up in the Sheet, then delete those test rows.

## Settings you can change (top of the `<script>` in index.html)

| Setting | What it does |
|---|---|
| `API_URL` | Your Apps Script web app URL |
| `PARTY_START` | Countdown target (currently Nov 21, 2026, 7 PM ET) |
| `POPUP_DELAY_SECONDS` | When the RSVP pop-up opens on its own (45) |
| `GALLERY_PHOTOS` | Photos for the optional gallery, e.g. `{ src: "images/pic1.jpg", caption: "Inspo" }` |

The RSVP pop-up won't auto-open again for someone who has already RSVP'd on that device.
