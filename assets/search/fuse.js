'use strict';
 
{{ $searchDataFile := printf "search/%s.data.json" .Language.Lang }}
{{ $searchData := resources.Get "search/data.json" | resources.ExecuteAsTemplate $searchDataFile . | resources.Minify | resources.Fingerprint }}
{{ $searchConfig := i18n "bookSearchConfig" | default "{}" }}
 
window.bookSearch = window.bookSearch || {};
window.bookSearch.searchDataURL = '{{ partial "docs/links/resource-precache" $searchData }}';
window.bookSearch.getIndexConfig = function() {
  return Object.assign({{ $searchConfig }}, {
    includeScore: true,
    useExtendedSearch: true,
    fieldNormWeight: 1.5,
    threshold: 0.2,
    ignoreLocation: true,
    keys: [
      {
        name: 'title',
        weight: 0.7
      },
      {
        name: 'content',
        weight: 0.3
      }
    ]
  });
};
 
/**
 * Fuse 검색 인덱스 생성
 * @returns {Promise<Fuse>}
 */
window.bookSearch.initIndex = function() {
  if (window.bookSearchIndex) {
    return Promise.resolve(window.bookSearchIndex);
  }
 
  const indexConfig = window.bookSearch.getIndexConfig();
 
  return fetch(window.bookSearch.searchDataURL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(pages => {
      window.bookSearchIndex = new Fuse(pages, indexConfig);
      return window.bookSearchIndex;
    });
};