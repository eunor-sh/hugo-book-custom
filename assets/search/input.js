'use strict';
 
(function () {
  const input = document.querySelector('#book-search-input');
  const results = document.querySelector('#book-search-results');
 
  if (!input) {
    return
  }
 
  input.addEventListener('focus', init);           // 검색창이 포커스되면 검색 인덱스 생성
  input.addEventListener('keyup', search);         // 키 입력 시 검색 수행
  input.addEventListener('keydown', handleEscape); // ESC 키가 눌리면 검색 결과 초기화
  input.addEventListener('blur', clearResults);    // 검색창에서 포커스가 해제되면 검색 결과 초기화
 
  // 검색창으로 이동하는 단축키가 눌리는 이벤트 처리
  document.addEventListener('keypress', focusSearchFieldOnKeyPress);
 
  /**
   * 단축키('s' 또는 '/')가 눌리면 검색창으로 포커스 이동하는 함수
   * @param {Event} event
   */
  function focusSearchFieldOnKeyPress(event) {
    if (event.target.value !== undefined) {
      return;
    }
 
    if (input === document.activeElement) {
      return;
    }
 
    const characterPressed = String.fromCharCode(event.charCode);
    if (!isHotkey(characterPressed)) {
      return;
    }
 
    input.focus();
    event.preventDefault();
  }
 
  /**
   * 입력된 문자가 단축키와 일치하는지 확인하는 함수
   * @param {string} character
   * @returns {boolean}
   */
  function isHotkey(character) {
    const dataHotkeys = input.getAttribute('data-hotkeys') || '';
    return dataHotkeys.indexOf(character) >= 0;
  }
 
  /**
   * ESC 키가 눌리면 검색 결과를 초기화하고 검색창에서 포커스를 해제하는 함수
   * @param {KeyboardEvent} event
   */
  function handleEscape(event) {
    if (event.key === 'Escape') {
      clearResults();
      input.blur();
    }
  }
 
  function clearResults() {
    while (results.firstChild) {
      results.removeChild(results.firstChild);
    }
  }
 
  /**
   * 검색창이 최초로 포커스되면 검색 인덱스를 생성하는 함수
   */
  function init() {
    input.removeEventListener('focus', init);
    input.required = true;
 
    window.bookSearch.initIndex()
      .then(() => input.required = false)
      .then(search);
  }
 
  /**
   * 검색 수행 후 검색 결과 미리보기(최대 5개)를 표시하는 함수
   */
  function search() {
    clearResults();
 
    if (!input.value) {
      return;
    }
 
    const searchHits = window.bookSearchIndex.search(input.value);
    const searchPreview = searchHits.slice(0, 5);
 
    searchPreview.forEach(function (page) {
      const li = element('<li><a href></a></li>');
      const a = li.querySelector('a')
 
      a.href = page.item.href;
      a.textContent = page.item.title;
 
      results.appendChild(li);
    });
 
    // 검색 페이지로 이동하기 위한 더보기 링크를 표시
    if (searchHits.length > 5) {
      const moreLink = element('<li class="book-search-more"><a href></a></li>');
      const a = moreLink.querySelector('a');
      a.href = '{{ "/search/" | relURL }}?q=' + encodeURIComponent(input.value);
      a.textContent = '더보기 (총 ' + searchHits.length + '개)';
      results.appendChild(moreLink);
    }
  }
 
  /**
   * HTML 문자열로부터 DOM 요소를 생성
   * @param {string} content
   * @returns {Node}
   */
  function element(content) {
    const div = document.createElement('div');
    div.innerHTML = content;
    return div.firstChild;
  }
})();