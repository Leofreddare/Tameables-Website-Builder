
const DOWNLOAD_SOURCE = 'https://raw.githubusercontent.com/Leofreddare/Tameables-Website-Builder/main/DownloadLink';
const CHANGELOG_SOURCE = 'https://raw.githubusercontent.com/Leofreddare/Tameables-Website-Builder/main/changelogs';

async function openResolvedInstallUrl(button) {
  const original = button.innerHTML;
  button.disabled = true;
  button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Loading install link...</span>';
  try {
    const response = await fetch(DOWNLOAD_SOURCE, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch install source');
    const resolvedText = (await response.text()).trim();
    if (!/^https?:\/\//i.test(resolvedText)) throw new Error('Install source did not contain a valid URL');
    window.open(resolvedText, '_blank', 'noopener,noreferrer');
  } catch (error) {
    alert('Could not open the install link. Make sure the DownloadLink file contains only a valid URL.');
    console.error(error);
  } finally {
    button.innerHTML = original;
    button.disabled = false;
  }
}

async function loadRemoteChangelog(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  try {
    const response = await fetch(CHANGELOG_SOURCE, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch changelog');
    const raw = (await response.text()).trim();
    const entries = raw
      .split(/\n{2,}/)
      .map(part => part.trim())
      .filter(Boolean);

    if (!entries.length) {
      container.innerHTML = '<article class="log-item glass"><h3>Changelog unavailable</h3><p>No entries were found in the remote changelog file.</p></article>';
      return;
    }

    container.innerHTML = entries.map((entry, index) => {
      const lines = entry.split(/\n+/).map(line => line.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
      const title = index === 0 ? 'Latest update' : `Previous update ${index}`;
      const items = lines.map(line => `<li><i class="fa-solid fa-circle-check"></i><span>${escapeHtml(line)}</span></li>`).join('');
      return `
        <article class="log-item glass fade-up">
          <div class="kicker"><i class="fa-solid fa-clock-rotate-left"></i>${title}</div>
          <ul class="list">${items}</ul>
        </article>
      `;
    }).join('');

    revealItems();
  } catch (error) {
    container.innerHTML = '<article class="log-item glass"><h3>Could not load changelog</h3><p>The remote changelog file could not be loaded right now.</p></article>';
    console.error(error);
  }
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function revealItems() {
  const items = document.querySelectorAll('.fade-up');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((item) => observer.observe(item));
}

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-install]').forEach((button) => {
    button.addEventListener('click', () => openResolvedInstallUrl(button));
  });

  if (window.feather) feather.replace();
  revealItems();

  const changelogTarget = document.body.dataset.changelogTarget;
  if (changelogTarget) loadRemoteChangelog(changelogTarget);
});
