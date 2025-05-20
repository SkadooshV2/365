// CONFIGURATION: years you want tabs for
const YEARS = [2024, 2025];

// DOM refs
const tabsContainer = document.getElementById('yearTabs');
const gallery       = document.getElementById('gallery');
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const captionDate   = document.querySelector('.caption-date');
const captionText   = document.querySelector('.caption-text');
const toggleTheme   = document.getElementById('toggleTheme');

let imageList   = [];
let currentYear = YEARS[0];
let currentIndex= 0;

// Persist & handle dark mode
toggleTheme.onclick = () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? '' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
};
const savedTheme = localStorage.getItem('theme');
if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

// days in year helper
function daysInYear(y) {
  const start = new Date(y,0,1);
  const end   = new Date(y+1,0,1);
  return Math.round((end - start)/(1000*60*60*24));
}

// Build year tabs
YEARS.forEach((y, i) => {
  const tab = document.createElement('div');
  tab.textContent  = y;
  tab.className    = 'tab' + (i === 0 ? ' active' : '');
  tab.dataset.year = y;
  tab.onclick = () => {
    if (currentYear === y) return;
    document.querySelector('.tab.active').classList.remove('active');
    tab.classList.add('active');
    currentYear = y;
    buildGallery(y);
  };
  tabsContainer.append(tab);
});

// Build gallery from manifest
async function buildGallery(year) {
  gallery.innerHTML = '';
  imageList = [];

  let files;
  try {
    const res = await fetch(`images/${year}/manifest.json`);
    files = await res.json();
  } catch {
    console.error(`No manifest for ${year}`);
    return;
  }

  const startDate = new Date(year, 0, 1);

  files.forEach((filename, idx) => {
    // parse "DD-MM-YYYY-Caption-parts.png"
    const name    = filename.slice(0, -4);
    const parts   = name.split('-');
    const DD      = parts[0], MM = parts[1], YYYY = parts[2];
    const caption = parts.slice(3).join(' ').replace(/_/g, ' ');
    const displayDate = `${DD}-${MM}-${YYYY}`;

    // compute day-of-year
    const dDate    = new Date(+YYYY, +MM - 1, +DD);
    const dayOfYear = Math.floor((dDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    // track for lightbox
    imageList.push({
      src:     `images/${year}/${filename}`,
      displayDate,
      caption
    });

    // build thumbnail
    const wrapper = document.createElement('div');
    wrapper.className = 'grid-item';

    const img = document.createElement('img');
    img.src           = `images/${year}/${filename}`;
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

// Lightbox handlers
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