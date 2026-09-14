/*
  omni.Guide catalog engine
  --------------------------------
  Every guide card and every guide detail page is generated from
  content/guides.json. To add a new guide, add one object to that
  file's "guides" array — nothing on this page needs to change.
*/

// Fallback so the site still renders if opened directly as a file
// (browsers block fetch() of local JSON over file://). Netlify serves
// this over http(s), where the real fetch below always wins.
const FALLBACK_GUIDES = [
  {
    slug: "clipping-business-blueprint",
    title: "The Clipping Business Blueprint",
    category: "Business",
    tagline: "Turn other people's content into your first income stream.",
    description:
      "An 11-page, beginner-friendly walkthrough for starting a content-clipping business from zero — what it is, how the money works, and the exact steps to land your first paying client.",
    price: "$9",
    cover_color_start: "#123B52",
    cover_color_end: "#1E6E96",
    whop_link: "https://whop.com/omni-guide",
    featured: true,
  },
];

async function loadGuides() {
  try {
    const res = await fetch("content/guides.json", { cache: "no-store" });
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();
    if (Array.isArray(data.guides) && data.guides.length) return data.guides;
    return FALLBACK_GUIDES;
  } catch (e) {
    return FALLBACK_GUIDES;
  }
}

function coverStyle(guide) {
  const start = guide.cover_color_start || "#123B52";
  const end = guide.cover_color_end || "#1E6E96";
  return `background: linear-gradient(135deg, ${start}, ${end});`;
}

function guideCardHTML(guide) {
  return `
    <a class="guide-card" href="guide.html?slug=${encodeURIComponent(guide.slug)}">
      <div class="guide-cover" style="${coverStyle(guide)}">
        <span class="guide-cover-tag">${guide.category || "Guide"}</span>
      </div>
      <div class="guide-body">
        <h3>${guide.title}</h3>
        <p class="tagline">${guide.tagline || ""}</p>
        <div class="guide-footer">
          <span class="price">${guide.price || ""}</span>
          <span class="guide-card-link">View guide</span>
        </div>
      </div>
    </a>
  `;
}

function comingSoonCardHTML() {
  return `
    <div class="guide-card coming-soon">
      <strong>Next guide is brewing</strong>
      <span>New topics land here as soon as they're ready — check back soon.</span>
    </div>
  `;
}

async function renderCatalog() {
  const mount = document.getElementById("catalog-grid");
  if (!mount) return;
  const guides = await loadGuides();
  mount.innerHTML = guides.map(guideCardHTML).join("") + comingSoonCardHTML();
}

async function renderGuideDetail() {
  const mount = document.getElementById("guide-detail");
  if (!mount) return;
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const guides = await loadGuides();
  const guide = guides.find((g) => g.slug === slug) || guides[0];

  if (!guide) {
    mount.innerHTML = `<div class="empty-state"><h2>Guide not found</h2></div>`;
    return;
  }

  document.title = `${guide.title} — omni.Guide`;

  const heroMount = document.getElementById("guide-detail-hero");
  if (heroMount) {
    heroMount.innerHTML = `
      <div class="breadcrumb"><a href="index.html">All guides</a> / ${guide.category || "Guide"}</div>
      <h1>${guide.title}</h1>
      <p class="lead">${guide.tagline || ""}</p>
    `;
  }

  mount.innerHTML = `
    <div class="detail-copy">
      <p>${guide.description || ""}</p>
    </div>
    <div class="card">
      <span class="price">${guide.price || ""}</span>
      <a class="btn btn-amber" href="${guide.whop_link || "#"}" target="_blank" rel="noopener">Get this guide on Whop</a>
      <a class="btn btn-ghost" href="index.html" style="margin-top:10px;">Back to all guides</a>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  renderCatalog();
  renderGuideDetail();
});
