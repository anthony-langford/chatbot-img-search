/**
 * This file defines API calls to server to fetch images from the search query.
 */

let SearchAPI = function () {
  let API_URL = 'http://ajax.googleapis.com/ajax/services/search/images?v=1.0&start=0&rsz=8&q=';
  // new google search API
  // https://www.googleapis.com/customsearch/v1

  return search;

  function search(query, callback) {
    let url = API_URL+encodeURIComponent(query);
    jsonp(url, function (data) {
      if ( !data ) {
        callback();
        return;
      }
      if (data.responseStatus !== 200) {
        callback();
        return;
      }

      let images = [];
      try {
        data.responseData.results.forEach(function (result) {
          images.push({
            height : result.height,
            width  : result.width,
            url    : result.url
          });
        });
      } catch (err) {
        callback();
        return;
      }
      callback(images);
    });
  }

  function jsonp(url, callback) {
    let callbackName = ('x'+Math.random()).replace(/[\-\.]/g,'');
    if (url.indexOf('?') === -1) {
      url += '?';
    } else {
      url += '&';
    }
    url += 'callback='+callbackName;

    window[callbackName] = finish;
    let timeout = setTimeout(function () {
      finish();
    }, 25*1000);

    let script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = url;
    document.documentElement.appendChild(script);

    function finish(data) {
      clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (callback) {
        callback(data);
        callback = null;
      }
    }
  }
}();
