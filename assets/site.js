/* dramkm.com — renders every page from the JSON files in /data.
   Edit content in /admin (or directly in /data/*.json); no code changes needed. */
(function () {
  const PAGE = document.body.dataset.page;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const load = (n) => fetch(`data/${n}.json`, { cache: "no-cache" }).then((r) => r.json()).catch(() => ({}));

  // Minimal Markdown: paragraphs, **bold**, *italic*, [text](url)
  function md(text) {
    return String(text || "").trim().split(/\n\s*\n/).map((p) =>
      "<p>" + esc(p)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
        .replace(/\n/g, "<br>") + "</p>").join("");
  }

  function initials(name) {
    return String(name || "").split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  }

  function chrome(s) {
    if (s.accent_color) document.documentElement.style.setProperty("--accent", s.accent_color);
    document.title = (PAGE === "home" ? "" : { research: "Research & Publications — ", projects: "Projects — " }[PAGE] || "") + (s.site_title || s.name || "");
    const nav = [["index.html", "About", "home"]];
    if (s.show_research !== false) nav.push(["research.html", "Research & Publications", "research"]);
    if (s.show_projects !== false) nav.push(["projects.html", "Projects", "projects"]);
    document.getElementById("header").innerHTML = `
      <div class="wrap">
        <a class="brand" href="index.html">${esc(s.name)}${s.credentials ? ", " + esc(s.credentials) : ""}</a>
        <nav class="main">${nav.map(([h, l, p]) => `<a href="${h}" class="${p === PAGE ? "active" : ""}">${l}</a>`).join("")}</nav>
      </div>`;
    document.getElementById("footer").innerHTML = `
      <div class="wrap">
        <span>© ${new Date().getFullYear()} ${esc(s.name)}${s.footer_text ? " · " + esc(s.footer_text) : ""}</span>
        ${s.email ? `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>` : ""}
      </div>`;
  }

  function linkRow(s) {
    const out = [];
    if (s.cv) out.push(`<a class="primary" href="${esc(s.cv)}" target="_blank" rel="noopener">Download CV</a>`);
    if (s.email) out.push(`<a href="mailto:${esc(s.email)}">Email</a>`);
    (s.links || []).filter((l) => l.url).forEach((l) => out.push(`<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`));
    return out.length ? `<div class="links">${out.join("")}</div>` : "";
  }

  function highlight(authors, me) {
    let a = esc(authors);
    if (me) me.split(";").map((x) => x.trim()).filter(Boolean).forEach((n) => { a = a.split(esc(n)).join(`<b>${esc(n)}</b>`); });
    return a;
  }

  function pubHTML(p, s) {
    const doiUrl = p.doi ? (p.doi.startsWith("http") ? p.doi : "https://doi.org/" + p.doi) : "";
    const x = [];
    if (p.url) x.push(`<a href="${esc(p.url)}" target="_blank" rel="noopener">Article</a>`);
    if (doiUrl) x.push(`<a href="${esc(doiUrl)}" target="_blank" rel="noopener">DOI</a>`);
    if (p.type) x.push(`<span class="muted">${esc(p.type)}</span>`);
    if (p.note) x.push(`<span class="muted">${esc(p.note)}</span>`);
    return `<div class="pub">
      <div class="t">${esc(p.title)}</div>
      <div class="a">${highlight(p.authors, s.author_highlight)}</div>
      <div class="v">${esc(p.venue)}${p.year ? ", " + esc(p.year) : ""}</div>
      ${x.length ? `<div class="x">${x.join("")}</div>` : ""}
    </div>`;
  }

  function projectHTML(p) {
    const chips = (p.data_sources || []).filter(Boolean).map((d) => `<span class="chip">${esc(d)}</span>`).join("");
    return `<article class="card">
      ${p.image ? `<img src="${esc(p.image)}" alt="">` : ""}
      <div class="meta">${p.status ? `<span class="chip status">${esc(p.status)}</span>` : ""}${chips}</div>
      <h3>${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.title)}</a>` : esc(p.title)}</h3>
      <p>${esc(p.summary)}</p>
      ${p.methods ? `<div class="methods">Methods: ${esc(p.methods)}</div>` : ""}
    </article>`;
  }

  const sortPubs = (arr) => [...arr].sort((a, b) => (b.year || 0) - (a.year || 0));

  async function home(s) {
    const [about, pubs, projs] = await Promise.all([load("about"), load("publications"), load("projects")]);
    const photo = s.photo ? `<img class="photo" src="${esc(s.photo)}" alt="${esc(s.name)}">` : `<div class="photo">${initials(s.name)}</div>`;
    const featPubs = sortPubs((pubs.items || []).filter((p) => p.featured)).slice(0, 5);
    const featProj = (projs.items || []).filter((p) => p.featured).slice(0, 3);
    const tl = (rows) => `<ul class="plain timeline">${rows.map((r) => `<li><span class="when">${esc(r.years)}</span><span><strong>${esc(r.role || r.degree)}</strong><br><span class="muted">${esc(r.place)}</span></span></li>`).join("")}</ul>`;
    document.getElementById("content").innerHTML = `
      <section class="hero">
        ${photo}
        <div>
          <h1>${esc(s.name)}${s.credentials ? `<span class="muted" style="font-weight:400">, ${esc(s.credentials)}</span>` : ""}</h1>
          <p class="position">${esc(s.position)}</p>
          <p class="inst">${esc(s.institution)}</p>
          ${s.tagline ? `<p class="tagline">${esc(s.tagline)}</p>` : ""}
          ${linkRow(s)}
        </div>
      </section>
      <h2>About</h2>
      <div class="bio">${md(about.bio)}</div>
      ${(about.research_interests || []).length ? `<h2>Research interests</h2><div class="interests">${about.research_interests.map((i) => `<span class="chip">${esc(i)}</span>`).join("")}</div>` : ""}
      ${(about.news || []).length ? `<h2>News</h2><ul class="plain timeline">${about.news.map((n) => `<li><span class="when">${esc(n.date)}</span><span>${md(n.text).replace(/^<p>|<\/p>$/g, "")}</span></li>`).join("")}</ul>` : ""}
      ${s.show_projects !== false && featProj.length ? `<h2>Current projects</h2><div class="cards">${featProj.map(projectHTML).join("")}</div><p><a href="projects.html">All projects →</a></p>` : ""}
      ${s.show_research !== false && featPubs.length ? `<h2>Selected publications</h2>${featPubs.map((p) => pubHTML(p, s)).join("")}<p><a href="research.html">All publications →</a></p>` : ""}
      ${(about.appointments || []).length ? `<h2>Appointments</h2>${tl(about.appointments)}` : ""}
      ${(about.education || []).length ? `<h2>Education &amp; training</h2>${tl(about.education)}` : ""}
    `;
  }

  async function research(s) {
    const [about, pubs] = await Promise.all([load("about"), load("publications")]);
    const all = sortPubs(pubs.items || []);
    const types = ["All", ...new Set(all.map((p) => p.type).filter(Boolean))];
    let type = "All", q = "";
    const el = document.getElementById("content");
    el.innerHTML = `
      <h1>Research &amp; Publications</h1>
      <p class="muted">${all.length} item${all.length === 1 ? "" : "s"}</p>${linkRow({ links: s.links })}
      ${(about.research_interests || []).length ? `<h2>Research areas</h2><div class="interests">${about.research_interests.map((i) => `<span class="chip">${esc(i)}</span>`).join("")}</div>` : ""}
      <h2>Publications</h2>
      <div class="toolbar">
        <input id="q" type="search" placeholder="Search title, author, journal…">
        ${types.length > 2 ? types.map((t) => `<button data-t="${esc(t)}" class="${t === "All" ? "on" : ""}">${esc(t)}</button>`).join("") : ""}
      </div>
      <div id="list"></div>`;
    const draw = () => {
      const f = all.filter((p) => (type === "All" || p.type === type) && (!q || [p.title, p.authors, p.venue].join(" ").toLowerCase().includes(q)));
      if (!f.length) { document.getElementById("list").innerHTML = `<p class="empty">No publications to show yet.</p>`; return; }
      let html = "", yr = null;
      f.forEach((p) => { if (p.year !== yr) { yr = p.year; html += `<div class="year">${esc(yr || "Undated")}</div>`; } html += pubHTML(p, s); });
      document.getElementById("list").innerHTML = html;
    };
    el.querySelector("#q").addEventListener("input", (e) => { q = e.target.value.trim().toLowerCase(); draw(); });
    el.querySelectorAll(".toolbar button").forEach((b) => b.addEventListener("click", () => {
      type = b.dataset.t; el.querySelectorAll(".toolbar button").forEach((x) => x.classList.toggle("on", x === b)); draw();
    }));
    draw();
  }

  async function projects() {
    const projs = await load("projects");
    const items = projs.items || [];
    const order = ["Ongoing", "Under review", "Published", "Completed"];
    const groups = {};
    items.forEach((p) => { (groups[p.status || "Other"] ||= []).push(p); });
    const keys = Object.keys(groups).sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));
    document.getElementById("content").innerHTML = `
      <h1>Projects</h1>
      <p class="muted">Ongoing and completed research and teaching work.</p>
      ${items.length ? keys.map((k) => `<h2>${esc(k)}</h2><div class="cards">${groups[k].map(projectHTML).join("")}</div>`).join("") : `<p class="empty">Projects coming soon.</p>`}`;
  }

  load("settings").then((s) => {
    chrome(s);
    if (PAGE === "home") home(s);
    else if (PAGE === "research") research(s);
    else if (PAGE === "projects") projects(s);
  });
})();
