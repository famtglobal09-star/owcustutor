const search = document.getElementById('course-search');
const cards = [...document.querySelectorAll('.course-card')];
const count = document.getElementById('course-count');
const empty = document.getElementById('empty-state');
search.addEventListener('input', () => {
  const query = search.value.trim().toLowerCase();
  let visible = 0;
  cards.forEach(card => {
    const show = !query || card.dataset.course.includes(query);
    card.hidden = !show;
    if (show) visible += 1;
  });
  count.textContent = `${visible} course${visible === 1 ? '' : 's'}`;
  empty.hidden = visible !== 0;
});
