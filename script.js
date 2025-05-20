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
function buildGallery(year) {
  gallery.innerHTML = '';
  imageList = [];

  const totalDays = daysInYear(year);
  const startDate = new Date(year, 0, 1);

  for (let i = 0; i < totalDays; i++) {
    const d    = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    // iso for lookup & src
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    const isoDate     = `${yyyy}-${mm}-${dd}`;
    const displayDate = `${dd}-${mm}-${yyyy}`;
    const src         = `images/${year}/${isoDate}.png`;
    const caption     = CAPTIONS[isoDate] || '';

    // prepare DOM
    const wrapper = document.createElement('div');
    wrapper.className = 'grid-item';

    const img = new Image();
    img.dataset.isoDate = isoDate;
    img.title           = displayDate;  // tooltip
    img.dataset.caption = caption;

    // overlay for hover
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.textContent = displayDate;

    // only append on successful load
    img.onload = () => {
      // record in imageList
      imageList.push({
        src,
        displayDate,
        caption
      });
      const idx = imageList.length - 1;
      img.dataset.index = idx;

      // finalize wrapper
      wrapper.append(img, overlay);
      gallery.append(wrapper);
    };

    // silently skip if missing
    img.onerror = () => {};

    // start load
    img.src = src;
  }
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