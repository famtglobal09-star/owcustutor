const toast = document.getElementById('toast');
function showToast(message) { toast.textContent = message; toast.classList.add('show'); window.setTimeout(() => toast.classList.remove('show'), 2600); }
function handleSearch(event) { event.preventDefault(); const value = document.getElementById('lesson-search').value.trim(); showToast(value ? `Searching Owcus for “${value}”` : 'Try a topic like design, code, or writing.'); return false; }
document.querySelector('.search-button').addEventListener('click', () => { document.getElementById('lesson-search').focus(); document.getElementById('start').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
document.querySelector('.mobile-menu').addEventListener('click', () => showToast('Use the links below to explore Owcus.'));
