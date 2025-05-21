// === CONFIGURATION ===
const YEARS = [2023, 2024, 2025];
const YEAR_DESCRIPTIONS = {
  2023: "In 2023 I began Project 365, capturing moments close to home.",
  2024: "In 2024 I took my lens farther afield—nature, travel, and new horizons.",
  2025: "This year I'm refining style: composition, light, and mindful framing."
};

// === DOM REFS ===
const tabsContainer     = document.getElementById('yearTabs');
const gallery           = document.getElementById('gallery');
const yearDescriptionEl = document.getElementById('yearDescription');
const lightbox          = document.getElementById('lightbox');
const lightboxImg       = document.getElementById('lightboxImg');
const captionDate       = document.querySelector('.caption-date');
const captionText       = document.querySelector('.caption-text');
const toggleTheme       = document.getElementById('toggleTheme');

let imageList   = [];
let currentYear = YEARS[0];
let currentIndex= 0;

// Log page load time
window.addEventListener('load', () => {
  const t = performance.timing;
  console.log(`Page loaded in ${t.loadEventEnd - t.navigationStart} ms`);
});

// Dark mode toggle & persistence
toggleTheme.onclick = () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? '' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
};
const saved = localStorage.getItem('theme');
if (saved) document.documentElement.setAttribute('data-theme', saved);

// Helper: days in year
function daysInYear(y) {
  const start = new Date(y,0,1),
        end   = new Date(y+1,0,1);
  return Math.round((end - start)/(1000*60*60*24));
}

// Build year tabs
YEARS.forEach((y,i) => {
  const tab = document.createElement('div');
  tab.textContent  = y;
  tab.className    = 'tab' + (i===0?' active':'');
  tab.dataset.year = y;
  tab.onclick = () => {
    if (currentYear===y) return;
    document.querySelector('.tab.active').classList.remove('active');
    tab.classList.add('active');
    currentYear = y;
    buildGallery(y);
  };
  tabsContainer.append(tab);
});

// Build gallery
async function buildGallery(year) {
  gallery.innerHTML = '';
  imageList = [];
  yearDescriptionEl.textContent = YEAR_DESCRIPTIONS[year] || '';

  let files;
  try {
    const res = await fetch(`images/${year}/manifest.json`);
    if (!res.ok) throw new Error();
    files = await res.json();
  } catch {
    console.error(`Could not load manifest for ${year}`);
    return;
  }

  const startDate = new Date(year,0,1);

  files.forEach((fn, idx) => {
    // parse filename: "DD-MM-YYYY-Caption-parts.jpeg"
    const name = fn.slice(0,-5), parts = name.split('-');
    const [DD,MM,YYYY, ...capParts] = parts;
    const caption = capParts.join(' ').replace(/_/g,' ');
    const displayDate = `${DD}-${MM}-${YYYY}`;
    const dDate = new Date(+YYYY, +MM-1, +DD);
    const dayOfYear = Math.floor((dDate - startDate)/(1000*60*60*24)) + 1;

    imageList.push({ src:`images/${year}/${fn}`, displayDate, caption });

    const wrapper = document.createElement('div');
    wrapper.className = 'grid-item';

    const img = document.createElement('img');
    img.src           = `images/${year}/${fn}`;
    img.alt           = displayDate;
    img.title         = `${dayOfYear} • ${displayDate}`;
    img.dataset.index = idx;

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `<strong>${dayOfYear}</strong> &bull; ${displayDate}`;

    wrapper.append(img, overlay);
    gallery.append(wrapper);
  });
}

// Lightbox controls
gallery.onclick = e => {
  if (e.target.tagName !== 'IMG') return;
  currentIndex = +e.target.dataset.index;
  showLightbox();
};
document.getElementById('closeBtn').onclick = () => lightbox.classList.add('hidden');
document.getElementById('prevBtn').onclick  = () => {
  currentIndex = (currentIndex - 1 + imageList.length) % imageList.length;
  showLightbox();
};
document.getElementById('nextBtn').onclick  = () => {
  currentIndex = (currentIndex + 1) % imageList.length;
  showLightbox();
};
function showLightbox() {
  const { src, displayDate, caption } = imageList[currentIndex];
  lightboxImg.src         = src;
  captionDate.textContent = displayDate;
  captionText.textContent = caption;
  lightbox.classList.remove('hidden');
}
lightbox.onclick = e => {
  if (e.target === lightbox) lightbox.classList.add('hidden');
};

// Initialize
buildGallery(currentYear);