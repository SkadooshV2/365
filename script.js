// *** CONFIGURATION ***

// 1) Add all years you want tabs for:
const YEARS     = [2023, 2024, 2025];

// 2) Map "YYYY-MM-DD" → "Your custom caption".  
const CAPTIONS = {
  "2025-01-01": "New Year's sunrise over the dunes",
  "2025-02-14": "Valentine's heart in sand",
  // … add more as you like
};

// --- DOM refs ---
const tabsContainer = document.getElementById('yearTabs');
const gallery       = document.getElementById('gallery');
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const captionDate   = document.querySelector('#lightboxCaption .caption-date');
const captionText   = document.querySelector('#lightboxCaption .caption-text');

let imageList   = [];
let currentYear = YEARS[0];
let currentIndex= 0;


/**
 * Returns 365 or 366 depending on whether `year` is a leap year.
 */
function daysInYear(year) {
  const start = new Date(year, 0, 1);
  const end   = new Date(year + 1, 0, 1);
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}


// Build year‐tabs
YEARS.forEach((year, idx) => {
  const tab = document.createElement('div');
  tab.className = 'tab' + (idx === 0 ? ' active' : '');
  tab.textContent = year;
  tab.dataset.year = year;
  tab.addEventListener('click', () => {
    if (currentYear === year) return;
    document.querySelector('.tab.active').classList.remove('active');
    tab.classList.add('active');
    currentYear = year;
    buildGallery(year);
  });
  tabsContainer.appendChild(tab);
});


/**
 * Builds the grid for a given year, only including images
 * that actually exist (others never get appended).
 */
async function buildGallery(year) {
  gallery.innerHTML = '';
  imageList = [];

  // 1) Fetch the manifest for this year
  let files;
  try {
    const res = await fetch(`images/${year}/manifest.json`);
    files = await res.json();                // e.g. ["2025-01-01.png", ...]
  } catch (err) {
    console.error('Could not load manifest for', year, err);
    return;
  }

  // 2) For each entry, add to gallery
  files.forEach((filename, idx) => {
    const isoDate = filename.slice(0, 10);   // "YYYY-MM-DD"
    const [yyyy, mm, dd] = isoDate.split('-');
    const displayDate = `${dd}-${mm}-${yyyy}`;
    const src = `images/${year}/${filename}`;
    const caption = CAPTIONS[isoDate] || '';

    // Track for lightbox
    imageList.push({ src, displayDate, caption });

    // Build DOM
    const wrapper = document.createElement('div');
    wrapper.className = 'grid-item';

    const img = document.createElement('img');
    img.src           = src;
    img.alt           = displayDate;
    img.title         = displayDate;
    img.dataset.index = idx;
    img.loading       = 'lazy';            // built‑in browser lazy‑load
    img.decoding      = 'async';           // faster decode

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.textContent = displayDate;

    wrapper.append(img, overlay);
    gallery.append(wrapper);
  });
}


// Lightbox event handlers
gallery.addEventListener('click', e => {
  if (e.target.tagName !== 'IMG') return;
  currentIndex = Number(e.target.dataset.index);
  showLightbox();
});

document.getElementById('closeBtn').onclick = () => {
  lightbox.classList.add('hidden');
};

document.getElementById('prevBtn').onclick = () => {
  currentIndex = (currentIndex - 1 + imageList.length) % imageList.length;
  showLightbox();
};

document.getElementById('nextBtn').onclick = () => {
  currentIndex = (currentIndex + 1) % imageList.length;
  showLightbox();
};

function showLightbox() {
  const { src, displayDate, caption } = imageList[currentIndex];
  lightboxImg.src           = src;
  captionDate.textContent   = displayDate;
  captionText.textContent   = caption;
  lightbox.classList.remove('hidden');
}

// Close lightbox on outside click
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) lightbox.classList.add('hidden');
});

// Initialize first gallery
buildGallery(currentYear);