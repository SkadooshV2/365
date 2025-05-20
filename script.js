// *** CONFIGURATION ***

// 1) Add all years you want tabs for:
const YEARS     = [2023, 2024, 2025];

// 2) Map "YYYY-MM-DD" → "Your custom caption".  
//    If a date is missing here, it will just show an empty caption.
const CAPTIONS = {
  "2025-01-01": "New Year's sunrise over the dunes",
  "2025-02-14": "Valentine's heart in sand",
  // … add more as you like
};

const TOTAL_DAYS  = 365;  // 366 for leap years

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


// Build year‐tabs
YEARS.forEach((year, idx) => {
  const tab = document.createElement('div');
  tab.className = 'tab' + (idx === 0 ? ' active' : '');
  tab.textContent = year;
  tab.dataset.year = year;
  tab.addEventListener('click', () => {
    if (currentYear == year) return;
    document.querySelector('.tab.active').classList.remove('active');
    tab.classList.add('active');
    currentYear = year;
    buildGallery(year);
  });
  tabsContainer.appendChild(tab);
});


// Build the grid for a given year
function buildGallery(year) {
  gallery.innerHTML = '';
  imageList = [];
  const startDate = new Date(year, 0, 1);

  for (let i = 0; i < TOTAL_DAYS; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth()+1).padStart(2,'0');
    const dd   = String(d.getDate()).padStart(2,'0');
    const date = `${yyyy}-${mm}-${dd}`;
    const src  = `images/${year}/${date}.jpg`;
    const txt  = CAPTIONS[date] || '';

    // keep track for lightbox
    imageList.push({ src, date, caption: txt });

    // create DOM
    const wrapper = document.createElement('div');
    wrapper.className = 'grid-item';

    const img = document.createElement('img');
    img.src       = src;
    img.alt       = txt ? `${date}: ${txt}` : date;
    img.title     = date;            // native tooltip
    img.dataset.index = i;

    // hover-overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.textContent = date;

    wrapper.appendChild(img);
    wrapper.appendChild(overlay);
    gallery.appendChild(wrapper);
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
  const { src, date, caption } = imageList[currentIndex];
  lightboxImg.src = src;
  captionDate.textContent = date;
  captionText.textContent = caption;
  lightbox.classList.remove('hidden');
}

// close when clicking outside the image
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) lightbox.classList.add('hidden');
});

// Initialize
buildGallery(currentYear);
