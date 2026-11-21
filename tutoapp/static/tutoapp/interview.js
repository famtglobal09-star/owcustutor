document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-bookmark]');
  if (!button) return;
  const slug = button.dataset.bookmark;
  const saved = JSON.parse(localStorage.getItem('owcus-bookmarks') || '[]');
  const next = saved.includes(slug) ? saved.filter(item => item !== slug) : [...saved, slug];
  localStorage.setItem('owcus-bookmarks', JSON.stringify(next));
  button.textContent = next.includes(slug) ? '★ Saved' : '☆ Save question';
});
