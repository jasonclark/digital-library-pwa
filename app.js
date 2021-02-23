class DigLibApp {
  
  constructor() { 
    this.featuredDiv = document.querySelector('.featured');
    //this.itemDiv = document.querySelector('.item');
    this.timelineDiv = document.querySelector('.timeline');
    this.init();
  }

  async init() {
    if ('IntersectionObserver' in window) {
      this.setupNavIntersectionObserver();
    }
    this.addLoadingIndicatorDelay();
    //check for filename; run featured and timeline functions based on HTML page
    if (fileName === 'browse.html' || fileName === 'index.html' || !fileName || fileName.trim === '') {
      await this.loadFeatured();
      await this.loadTimeline();
    }
    //await this.loadItem();
  }

  addLoadingIndicatorDelay() {
    //only show spinner if we're delayed more than 1s
    setTimeout(() => {
      Array.from(document.querySelectorAll('.loader')).forEach(loader => {
        loader.removeAttribute('hidden');
      });
    }, 1000);
  }

  setupNavIntersectionObserver() {
    const nav = document.querySelector('nav');
    const header = document.querySelector('header');
    const callback = entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          [nav, header].forEach(e => e.classList.remove('fixed'));
        } else {
          [nav, header].forEach(e => e.classList.add('fixed'));
        }
      });
    };
    const observer = new IntersectionObserver(callback, {
      threshold: [0, 1]
    });
    observer.observe(header);
  }

  async loadFeatured() {
    this.featured = await this.fetchJSON('./items.json');
    //check for filename; run unique featured functions based on HTML page
    if (fileName === 'index.html' || !fileName || fileName.trim === '') {
      //this.featuredDiv.innerHTML = this.featured.slice(0,4).map(this.toFeatureBlock).join('\n');
      this.featuredDiv.innerHTML = this.featured.splice(Math.floor(Math.random()*this.featured.length),4).sort((a, b) => parseFloat(a.item.originInfo_dateIssued) - parseFloat(b.item.originInfo_dateIssued)).map(this.toFeatureBlock).join('\n');
    } else {
      this.featuredDiv.innerHTML = this.featured.sort((a, b) => parseFloat(a.item.originInfo_dateIssued) - parseFloat(b.item.originInfo_dateIssued)).map(this.toFeatureBlock).join('\n');
    }
  }

  async loadTimeline() {
    const rawTimeline = await this.fetchJSON('./items.json');
    this.timeline = rawTimeline.map(this.addObjectDetails, this);
    //check for filename; run unique timeline functions based on HTML page
    if (fileName === 'index.html' || !fileName || fileName.trim === '') {
      this.timelineDiv.innerHTML = this.timeline.splice(Math.floor(Math.random()*this.timeline.length),4).sort((a, b) => parseFloat(a.item.originInfo_dateIssued) - parseFloat(b.item.originInfo_dateIssued)).map(this.toTimelineBlock).join('\n');
    } else {
      this.timelineDiv.innerHTML = this.timeline.sort((a, b) => parseFloat(a.item.originInfo_dateIssued) - parseFloat(b.item.originInfo_dateIssued)).map(this.toTimelineBlock).join('\n');
    }
  }  

/*
  async loadItem(id) {
    const id = getQueryVariable('id');
    const rawItems = await this.fetchJSON('./items.json');

    this.item = rawItems.map(this.addObjectDetails, this);
    this.itemDiv.innerHTML = this.item
      .map(this.toItemBlock)
      .join('\n');
  }
*/

  toFeatureBlock(items) {
    return `
        <div class="feature-item">
          <a href="./item.html?id=${items.item.recordInfo_recordIdentifier}">
	  <img src="${items.item.identifier}" width="160" height="120" loading="lazy" alt="${items.item.titleInfo_title}">
          <div>${items.item.originInfo_dateIssued}</div>
          </a>
        </div>`;
  }

/*
  toItemBlock(items) {
    return `
        <h2>Item: ${items.item.titleInfo_title}</h2>
        <li>
          <img alt="${items.item.titleInfo_title}" src="${items.item.identifier}" />
          <p>${items.item.titleInfo_title}</p><p>${items.item.abstract}</p>
          <p>${items.item.extension}</p>
          <p>${items.item.originInfo_dateIssued}</p>
        </li>`;
  }
*/

  toTimelineBlock(items) {
    return `
      <div class="timeline-item ${items.item.genre}">
        <div class="title-and-date">
          <div class="date">${items.item.originInfo_dateIssued}</div>
          <div class="title-and-creator">
            <div class="title">${items.item.titleInfo_title}</div>
            <div class="creator">${
              items.item.record ? item.record.item.titleInfo_title : '&nbsp;'
            }</div>
          </div>
        </div>
        <p class="description">${items.item.abstract}</p>
      </div>
    `;
  }

  addObjectDetails(item) {
    if (item.recordInfo_recordIdentifier) {
      return Object.assign({}, item, {
        record: this.objects.find(s => s.id === item.recordInfo_recordIdentifier)
      });
    }
    return Object.assign({}, item);
  }

  async fetchJSON(url) {
    const res = await fetch(url);
    return res.json();
  }
}

//get filename; add to global scope; run featured and timeline functions based on HTML page
const url = new URL(window.location);
const fileName = url.pathname.substring(url.pathname.lastIndexOf('/')+1);

window.addEventListener('load', e => {
  new DigLibApp();
  registerSW();
});

async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./serviceworker.js');
      console.log('ServiceWorker registration succeeded.');
    } catch (e) {
      console.log('ServiceWorker registration failed.');
    }
  } else {
    document.querySelector('.alert').removeAttribute('hidden');
  }
}
