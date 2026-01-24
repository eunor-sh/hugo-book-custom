'use strict';
 
(function () {
  const input = document.querySelector('#book-search-input');
  const results = document.querySelector('#book-search-results');
  const modal = document.querySelector('#book-search-modal');
  const trigger = document.querySelector('#book-search-trigger');
  const closeButton = document.querySelector('#book-search-close');
  let composing = false;
  let skipBlurClear = false;
 
  if (!input || !results) {
    return
  }
 
  input.addEventListener('focus', init);           // 검색창이 포커스되면 검색 인덱스 생성
  input.addEventListener('input', handleInput);    // 입력 변경 시 검색 수행 (IME 대응)
  input.addEventListener('keydown', handleEscape); // ESC 키가 눌리면 검색 결과 초기화
  input.addEventListener('blur', handleBlur);      // 포커스 해제 시 결과 정리
  input.addEventListener('compositionstart', handleCompositionStart);
  input.addEventListener('compositionend', handleCompositionEnd);
  results.addEventListener('mousedown', handleResultsMouseDown);
  if (trigger) {
    trigger.addEventListener('click', openModal);
  }
  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }
  if (modal) {
    modal.addEventListener('click', handleModalClick);
  }
 
  // 검색창으로 이동하는 단축키가 눌리는 이벤트 처리
  document.addEventListener('keydown', focusSearchFieldOnKeyDown);
 
  /**
   * 단축키('s' 또는 '/')가 눌리면 검색창으로 포커스 이동하는 함수
   * @param {Event} event
   */
  function focusSearchFieldOnKeyDown(event) {
    if (event.defaultPrevented) {
      return;
    }

    if (isTypingField(event.target)) {
      return;
    }

    if (input === document.activeElement) {
      return;
    }

    if (!event.key || event.key.length !== 1) {
      return;
    }

    const key = event.key;
    if (!isHotkey(key)) {
      return;
    }

    openModal();
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
 
  function isTypingField(target) {
    if (!target) {
      return false;
    }
    if (target.isContentEditable) {
      return true;
    }
    const tagName = target.tagName ? target.tagName.toLowerCase() : '';
    return tagName === 'input' || tagName === 'textarea' || tagName === 'select';
  }
 
  /**
   * ESC 키가 눌리면 검색 결과를 초기화하고 검색창에서 포커스를 해제하는 함수
   * @param {KeyboardEvent} event
   */
  function handleEscape(event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }
 
  function handleResultsMouseDown() {
    // 결과 클릭 시 blur로 인한 즉시 제거를 방지
    skipBlurClear = true;
  }
 
  function handleBlur() {
    if (skipBlurClear) {
      skipBlurClear = false;
      return;
    }
    clearResults();
  }
 
  function handleModalClick(event) {
    if (event.target === modal) {
      closeModal();
    }
  }
 
  function openModal() {
    if (modal) {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
    }
    input.focus();
  }
 
  function closeModal() {
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
    clearResults();
    input.value = '';
    input.blur();
    if (trigger) {
      trigger.blur();
    }
  }
 
  function handleCompositionStart() {
    composing = true;
  }
 
  function handleCompositionEnd() {
    composing = false;
    search();
  }
 
  function handleInput() {
    if (composing) {
      return;
    }
    search();
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
 
    if (!window.bookSearchIndex) {
      window.bookSearch.initIndex()
        .then(search)
        .catch(() => {});
      return;
    }
 
    const searchHits = window.bookSearchIndex.search(input.value);
    const searchPreview = searchHits.slice(0, 10);
 
    searchPreview.forEach(function (page) {
      const li = element('<li class="book-search-result"><a href><div class="book-search-result-title"></div><div class="book-search-result-excerpt"></div></a></li>');
      const a = li.querySelector('a');
      const titleEl = li.querySelector('.book-search-result-title');
      const excerptEl = li.querySelector('.book-search-result-excerpt');
 
      a.href = page.item.href;
      titleEl.textContent = page.item.title;
      excerptEl.textContent = buildExcerpt(page.item.content, input.value);
 
      results.appendChild(li);
    });
 
    // 검색 페이지로 이동하기 위한 더보기 링크를 표시
    if (searchHits.length > 10) {
      const moreLink = element('<li class="book-search-more"><a href></a></li>');
      const a = moreLink.querySelector('a');
      a.href = '{{ "/search/" | relURL }}?q=' + encodeURIComponent(input.value);
      a.textContent = '더보기 (총 ' + searchHits.length + '개)';
      results.appendChild(moreLink);
    }
  }
 
  function buildExcerpt(content, query) {
    if (!content) {
      return '';
    }
    const normalized = content.replace(/\s+/g, ' ').trim();
    const q = query ? query.trim() : '';
    if (!q) {
      return normalized.slice(0, 180);
    }
    const index = normalized.toLowerCase().indexOf(q.toLowerCase());
    if (index === -1) {
      return normalized.slice(0, 180);
    }
    const start = Math.max(0, index - 60);
    const end = Math.min(normalized.length, index + 120);
    const prefix = start > 0 ? '…' : '';
    const suffix = end < normalized.length ? '…' : '';
    return prefix + normalized.slice(start, end) + suffix;
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