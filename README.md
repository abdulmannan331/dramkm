# dramkm.com: setup & editing guide

Your website is a set of plain files. All the **content** lives in four files in the `data/` folder:

| File | What it controls |
|---|---|
| `data/settings.json` | Name, title, photo, CV, links, accent color, show/hide pages |
| `data/about.json` | Bio, research interests, appointments, education, news |
| `data/publications.json` | Publication list |
| `data/projects.json` | Project cards |

You can change any of it in two ways:
1. **Admin panel:** go to `dramkm.com/admin`, log in with GitHub, and edit with forms. Click *Publish* and the live site updates within about a minute.
2. **Ask Claude:** open the "Website creation" project and say what you'd like to change (e.g., "add this paper", "change the accent color to navy").

---

## One-time setup (about 20 minutes, all free except the domain)

### 1. Put the files on GitHub
1. Create a free account at **github.com**.
2. Click **New repository** and name it `dramkm`. Set it to Public or Private (either works).
3. Click **uploading an existing file**, drag in *everything inside* the `dramkm` folder (not the folder itself), and click **Commit**.
4. Open `admin/config.yml` on GitHub, click the pencil, replace `YOUR-GITHUB-USERNAME` with your username, and commit.

### 2. Host it on Netlify
1. Sign up at **netlify.com** with your GitHub account.
2. Go to **Add new site → Import an existing project → GitHub** and choose `dramkm`. Leave build settings blank, then click **Deploy**.
3. Your site is live at something like `dramkm.netlify.app`.

### 3. Turn on the admin login
1. On GitHub, go to **Settings → Developer settings → OAuth Apps → New OAuth App**:
   - Homepage URL: `https://dramkm.com` (or your netlify.app address for now)
   - Authorization callback URL: `https://api.netlify.com/auth/done`
   - Copy the **Client ID** and generate a **Client secret**.
2. In Netlify, go to **Site configuration → Access & security → OAuth → Install provider → GitHub** and paste both values.
3. Visit `/admin`, click **Login with GitHub**, and you're in.

### 4. Connect dramkm.com
1. Buy `dramkm.com` from any registrar (Namecheap, Cloudflare, GoDaddy), or buy it directly inside Netlify.
2. In Netlify, go to **Domain management → Add a domain → dramkm.com** and follow the DNS instructions it shows.
3. Netlify adds free HTTPS automatically.

---

## Tips
- **Photo:** in Admin, go to Site settings → Profile photo and upload it (a square image works best).
- **CV:** in Admin, go to Site settings → CV and upload a PDF. A "Download CV" button appears on the home page.
- **Home page:** tick *Show on home page* on any publication or project to feature it there.
- **Bold your name in author lists:** set *author_highlight* to how your name appears (e.g., `Minhas AMK; Khan Minhas AM`).
- **Hide a page:** untick *Show Projects page* or *Show Research page* in settings.
- **Preview on your own computer:** in this folder, run `python3 -m http.server` and open http://localhost:8000.
