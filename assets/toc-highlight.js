document.addEventListener('DOMContentLoaded', function() {
    const headings = document.querySelectorAll('h2[id], h3[id]');
 
    function getVisibleToc() {
        const bookToc = document.querySelector('.book-toc');
 
        if (bookToc) {
            const style = window.getComputedStyle(bookToc);
            if (style.visibility === 'visible') {
                return bookToc.querySelector('#TableOfContents');
            }
        }
 
        return document.querySelector('#TableOfContents');
    }
 
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const toc = getVisibleToc()
            const tocLinks = toc.querySelectorAll('a');
            const correspondingTocLink = toc.querySelector(`a[href="#${id}"]`);
 
            if (correspondingTocLink) {
                if (entry.isIntersecting) {
                    tocLinks.forEach(link => link.classList.remove('active'));
                    correspondingTocLink.classList.add('active');
                }
            }
        });
    }, {
        rootMargin: '0px 0px -70% 0px'
    });
 
    headings.forEach(heading => {
        observer.observe(heading);
    });
});