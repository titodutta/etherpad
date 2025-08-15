'use strict';

// Handle page show events (like navigating back to the page)
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      window.customStart();
    } else {
      window.addEventListener('DOMContentLoaded', window.customStart, { once: true });
    }
  }
});

// Main function to run on page load
window.customStart = () => {
  const recentPadList = document.getElementById('recent-pads');
  if (!recentPadList) return;

  recentPadList.replaceChildren(); // Clear previous list

  // Update placeholder dynamically
  const placeholderLabel = document.querySelector('[data-l10n-id="index.placeholderPadEnter"]');
  const observer = new MutationObserver(() => {
    const input = document.querySelector('#go2Name input');
    if (input) input.setAttribute('placeholder', placeholderLabel.textContent);
  });
  observer.observe(placeholderLabel, { childList: true, subtree: true, characterData: true });

  // Load recent pads from localStorage
  const storedPads = localStorage.getItem('recentPads');
  let recentPadData = storedPads ? JSON.parse(storedPads) : [];

  // Remove duplicates & sort by timestamp descending
  recentPadData = recentPadData
    .filter((pad, idx, self) => idx === self.findIndex((p) => p.name === pad.name))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const parentStyle = recentPadList.parentElement.style;
  const heading = document.querySelector('[data-l10n-id="index.recentPads"]');

  if (recentPadData.length === 0) {
    heading.setAttribute('data-l10n-id', 'index.recentPadsEmpty');
    parentStyle.display = 'flex';
    parentStyle.justifyContent = 'center';
    parentStyle.alignItems = 'center';
    parentStyle.maxHeight = '100%';
    recentPadList.remove();
    return;
  }

  // SVG icons
  const icons = {
    arrow: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-4 h-4 text-gray-400"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
    clock: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock w-3 h-3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    personal: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-3 h-3"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
  };

  // Populate recent pads
  recentPadData.forEach((pad) => {
    const li = document.createElement('li');
    li.className = 'recent-pad';
    li.style.cursor = 'pointer';

    // Pad link
    const padPath = `${window.location.href}p/${pad.name}`;
    const link = document.createElement('a');
    link.href = padPath;
    link.style.textDecoration = 'none';
    link.innerText = pad.name;
    li.appendChild(link);

    // Arrow icon
    const arrowSpan = document.createElement('span');
    arrowSpan.className = 'recent-pad-arrow';
    arrowSpan.innerHTML = icons.arrow;
    li.appendChild(arrowSpan);

    // Info row (time + members)
    const infoRow = document.createElement('div');
    infoRow.style.display = 'flex';
    infoRow.style.gap = '10px';
    infoRow.style.marginTop = '10px';

    const clockSpan = document.createElement('span');
    clockSpan.className = 'recent-pad-clock';
    clockSpan.innerHTML = icons.clock;
    infoRow.appendChild(clockSpan);

    const time = new Date(pad.timestamp);
    const formattedTime = time.toLocaleDateString(navigator.language || 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    const timeSpan = document.createElement('span');
    timeSpan.className = 'recent-pad-time';
    timeSpan.innerText = formattedTime;
    infoRow.appendChild(timeSpan);

    const personalSpan = document.createElement('span');
    personalSpan.className = 'recent-pad-personal';
    personalSpan.style.marginLeft = '5px';
    personalSpan.innerHTML = icons.personal;
    infoRow.appendChild(personalSpan);

    const membersSpan = document.createElement('span');
    membersSpan.className = 'recent-pad-members';
    membersSpan.innerText = pad.members;
    infoRow.appendChild(membersSpan);

    li.appendChild(infoRow);

    // Click anywhere on li opens pad
    li.addEventListener('click', () => window.location.href = padPath);

    recentPadList.appendChild(li);
  });
};
