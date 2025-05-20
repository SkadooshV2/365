// CONFIGURATION
const YEARS     = [2023, 2024, 2025];
const CAPTIONS  = { /* "YYYY-MM-DD": "Your caption" */ };

// DOM
const tabsContainer = document.getElementById('yearTabs');
const gallery       = document.getElementById('gallery');
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const captionDate   = document.querySelector('.caption-date');
const captionText   = document.querySelector('.caption-text');

let imageList   = [];
let currentYear = YEARS[0];
let currentIndex= 0;

// helper: days in year
function daysInYear(y) {
  const start = new Date(y,0,1);
  const end   = new Date(y+1,0,1);
  return Math.round((end-start)/(1000*60*60*24));
}

// build year tabs
YEARS.forEach((y,i) => {
  const tab = document.createElement('div');
  tab.textContent   = y;
  tab.className     = 'tab' + (i===0?' active':'');
  tab.dataset.year  = y;
  tab.onclick = () => {
    if (currentYear===y) return;
    document.querySelector('.tab.active').classList.remove('active');
    tab.classList.add('active');
    currentYear = y;
    buildGallery(y);
  };
  tabsContainer.append(tab);
});

// build gallery via manifest
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

  const startDate = new Date(year,0,1);
  const totalDays = daysInYear(year);

  files.forEach((filename, idx) => {
    // parse YYYY-MM-DD
    const isoDate = filename.slice(0,10);
    const [Y, M, D] = isoDate.split('-').map(Number);
    const dDate = new Date(Y, M-1, D);
    const dayOfYear = Math.floor((dDate - startDate)/(1000*60*60*24)) + 1;
    const displayDate = `${String(D).padStart(2,'0')}-${String(M).padStart(2,'0')}-${Y}`;
    const src = `images/${year}/${filename}`;
    const cap = CAPTIONS[isoDate] || '';

    // track for lightbox
    imageList.push({ src, displayDate, cap });

    // DOM
    const wrapper = document.createElement('div');
    wrapper.className = 'grid-item';

    const img = document.createElement('img');
    img.src           = src;
    img.alt           = displayDate;
    img.title         = `${dayOfYear} • ${displayDate}`;
    img.dataset.index = idx;
    img.loading       = 'lazy';
    img.decoding      = 'async';

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `<strong>${dayOfYear}</strong> &bull; ${displayDate}`;

    wrapper.append(img, overlay);
    gallery.append(wrapper);
  });
}

// lightbox handlers
gallery.onclick = e => {
  if (e.target.tagName!=='IMG') return;
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
  const { src, displayDate, cap } = imageList[currentIndex];
  lightboxImg.src         = src;
  captionDate.textContent = displayDate;
  captionText.textContent = cap;
  lightbox.classList.remove('hidden');
}
lightbox.onclick = e => {
  if (e.target === lightbox) lightbox.classList.add('hidden');
};

// init
buildGallery(currentYear);