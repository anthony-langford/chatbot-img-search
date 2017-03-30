/**
 * This file defines the controller for the search image page.
 */

App.controller('search', (page) => {

  // Keys to use for the HTML5 web storage
  let INPUT_KEY  = '__SEARCH_INPUT__',
      SEARCH_KEY = '__SEARCH_QUERY__';

  // Get HTML elements
  let form        = page.querySelector('form'),
      input       = page.querySelector('form .app-input'),
      placeholder = page.querySelector('.placeholder'),
      resultTmpl  = page.querySelector('.result');

  // Define controller-wide variables
  let cache       = {},
      currentQuery, currentTime;

  // Clear up rendered images
  resultTmpl.parentNode.removeChild(resultTmpl);

  // Show empty placeholder
  showPlaceholder(page);

  if (this.restored) {
    // Set the search input value from the web storage when app resumes
    input.value = localStorage[INPUT_KEY] || '';
    if ( localStorage[SEARCH_KEY] ) {
      // Resumes searching if the app was closed while searching
      performSearch( localStorage[SEARCH_KEY] );
    }
  }

  // Updates the search parameter in web storage when a new character is added
  // to the search input
  input.addEventListener('keyup', () => {
    localStorage[INPUT_KEY] = input.value;
  });

  // Updates the search parameter in web storage when the value of the search
  // input is changed
  input.addEventListener('change', () => {
    localStorage[INPUT_KEY] = input.value;
  });

  // Updates images layout when orientation changes, window resizes and page
  // placements.
  page.addEventListener('appLayout', () => {
    layoutResults(page);
  });

  // Performs search when the search input is submitted
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    performSearch(input.value);
  });

  function performSearch (query) {

    // Clean up spaces from the search query
    query = query.trim();

    // If there are no errors, stops searching when a search query is not
    // provided or when the app is already searching the current query
    if (!query || ( (query === currentQuery) && !placeholder.classList.contains('error') ) ) {
      return;
    }

    // Unfocus search input
    input.blur();
    form.blur();

    // Set the currently searching query in web storage
    localStorage[SEARCH_KEY] = query;

    let time = Date.now();
    currentQuery = query;
    currentTime  = time;

    // Renders the search results if the search query result is already cached
    if (query in cache) {
      showResults(page, currentTime, resultTmpl, cache[query], query);
      return;
    }

    // Show loader while searching
    showLoader(page);

    // Expensive tasks inside kik.ready will not block loading
    kik.ready(() => {
      let queryTime = new Date().getTime();
      // Call the image search API in backend.js
      SearchAPI(query, (images) => {
        if ( !images ) {
          // Show error page if the API call errored or timed-out
          if ((currentQuery === query) && (currentTime === time)) {
            showResults(page, currentTime, resultTmpl, null, query);
          }
          return;
        }
        // Cache search results
        cache[query] = images;
        // Show image search results
        if ((currentQuery === query) && (currentTime === time)) {
          showResults(page, currentTime, resultTmpl, images, query);
        }
      });
    });
  };

});
