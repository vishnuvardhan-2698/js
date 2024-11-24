const apiKey = "8L72Jii3WwGi3d0BaPnzPxnzLSlvwpgEzqbap7AS1Do4OTR3S5knUqNq";

//* selectors

const searchForm = document.getElementById("search-form");
const searchResult = document.getElementById("result");

let sentinelObserver;

//* event listeners

const setupListeners = () => {
  searchForm.addEventListener("submit", onSearchFormSubmit);
};

//* event handlers

const onSearchFormSubmit = (e) => {
  e.preventDefault();

  const query = searchForm.query.value.trim();

  if (!query) {
    alert("Please provide a valid search term");
    return;
  }

  const apiURL = `https://api.pexels.com/v1/search?query=${query}&orientation=landscape`;

  showLoading();

  fetchImages(apiURL)
    .then((data) => displayResults(data))
    .finally(hideLoading);
};

//* render functions

const displayResults = (data) => {
  console.log(data);

  // remove previous observer to prevent conflicts
  removeObserver();

  // if there are no results, display no image found
  if (data.total_results === 0) {
    searchResult.innerHTML = `
      <div class="no-result">No images found.</div>
    `;
    return;
  }

  // clear the results for every new search query
  if (data.page === 1) {
    searchResult.innerHTML = "";
  }

  data.photos.forEach((photo) => {
    searchResult.innerHTML += `
    <div class="grid-item">
      <a href="${photo.url}" target="_blank">
        <img src="${photo.src.medium}" alt="${photo.alt}" />
        <div class="image-content">
          <h3 class="photographer">${photo.photographer}</h3>
        </div>
      </a>
    </div>
    `;
  });

  // initialize the observer if there are next page
  createObserver(data.next_page);
};

const showLoading = () => {
  const div = document.createElement("div");
  div.classList.add("loader");

  document.body.prepend(div);
};

const hideLoading = () => {
  const loader = document.querySelector(".loader");
  loader && loader.remove();
};

const createObserver = (nextPageURL) => {
  if (!nextPageURL) return;

  // create the element to be observed
  const sentinel = document.createElement("div");
  sentinel.id = "sentinel";

  // append the element at the end of the image grid
  document.querySelector(".container").appendChild(sentinel);

  // initialize the intersection observer
  sentinelObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadMoreResults(nextPageURL);
      }
    });
  });

  // connect the element to the observer
  sentinelObserver.observe(sentinel);
};

const removeObserver = () => {
  // remove the observed element
  const sentinel = document.getElementById("sentinel");
  sentinel && sentinel.remove();

  // disconnect the observer
  if (sentinelObserver) {
    sentinelObserver.disconnect();
    sentinelObserver = null;
  }
};

//* helper functions

const fetchImages = async (apiURL) => {
  try {
    const response = await fetch(apiURL, {
      headers: { Authorization: apiKey },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error! status=${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch error", error);
  }
};

const loadMoreResults = (nextPageURL) => {
  showLoading();

  fetchImages(nextPageURL)
    .then((data) => displayResults(data))
    .finally(hideLoading);
};

//* initialize

setupListeners();