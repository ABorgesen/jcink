function TrackParticipatedThreads(config) {
  const {
    characterName,
    includeCategoryIds = [],
    includeForumIds = [],
    completedForumIds = [],
    ignoreForumIds = [],
    ignoreForumNames = [],
    floodControl = 5
  } = config;

  const allThreads = document.querySelectorAll('.topic');
  const participatedThreads = [];
  const completedThreads = [];

  allThreads.forEach(thread => {
    const threadTitle = thread.querySelector('.topic_title')?.textContent.toLowerCase() || '';
    const forumLink = thread.querySelector('.forumlink');
    const forumIdMatch = forumLink?.href.match(/showforum=(\d+)/);
    const forumId = forumIdMatch ? forumIdMatch[1] : null;
    const author = thread.querySelector('.desc')?.textContent.toLowerCase() || '';

    if (!forumId || ignoreForumIds.includes(forumId)) return;
    if (ignoreForumNames.includes(forumLink?.textContent.toLowerCase())) return;
    if (!includeForumIds.includes(forumId) && !includeCategoryIds.includes(forumId)) return;

    const isParticipated = author.includes(characterName.toLowerCase());

    if (!isParticipated) return;

    const isCompleted = completedForumIds.includes(forumId); // ← Updated: purely forum-based

    if (isCompleted) {
      completedThreads.push(thread);
    } else {
      participatedThreads.push(thread);
    }
  });

  const output = document.createElement('div');
  output.innerHTML = `
    <div class="tracker-section">
      <h2>Active Threads</h2>
      <ul>${participatedThreads.map(t => `<li>${t.innerHTML}</li>`).join('')}</ul>
    </div>
    <div class="tracker-section">
      <h2>Completed Threads</h2>
      <ul>${completedThreads.map(t => `<li>${t.innerHTML}</li>`).join('')}</ul>
    </div>
  `;
  document.body.appendChild(output);
}
