// Public post metadata only. Windsor credentials never belong in this site.
(() => {
  'use strict';
  const portfolio = document.getElementById('portfolio-marcelo');
  const feed = document.getElementById('marcelo-instagram-feed');
  const status = document.getElementById('marcelo-instagram-status');
  const more = document.getElementById('marcelo-instagram-more');
  if (!portfolio || !feed || !status || !more) return;

  const postUrl = /^https:\/\/www\.instagram\.com\/(?:p|reel)\/[A-Za-z0-9_-]+\/$/;
  let posts = [];
  let visible = 0;
  let loaded = false;
  let loadedAt = 0;
  const refreshMs = 60 * 60 * 1000;
  let loading = false;
  let embedScript;

  function processEmbeds() {
    if (window.instgrm && window.instgrm.Embeds) {
      window.instgrm.Embeds.process();
      return;
    }
    if (embedScript) return;
    embedScript = document.createElement('script');
    embedScript.src = 'https://www.instagram.com/embed.js';
    embedScript.async = true;
    embedScript.onload = () => {
      if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process();
    };
    embedScript.onerror = () => {
      embedScript.remove();
      embedScript = null;
      status.textContent = 'Instagram previews are unavailable. Open a post using its link below.';
    };
    document.body.append(embedScript);
  }

  function showMore() {
    const batch = posts.slice(visible, visible + 2);
    batch.forEach(post => {
      const card = document.createElement('article');
      card.className = 'instagram-post';
      const embed = document.createElement('blockquote');
      embed.className = 'instagram-media';
      embed.dataset.instgrmPermalink = post.permalink;
      embed.dataset.instgrmVersion = '14';
      const caption = document.createElement('p');
      caption.className = 'instagram-caption';
      caption.textContent = post.caption || 'A tattoo by @marcelo.tattooart';
      embed.append(caption);
      const link = document.createElement('a');
      link.href = post.permalink;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'instagram-post-link';
      const date = new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York'
      });
      link.textContent = (post.type === 'VIDEO' || post.type === 'REEL' ? 'Watch reel' : 'View post') + ' · ' + date + ' ↗';
      link.setAttribute('aria-label', link.textContent + ' (opens in a new tab)');
      // This link stays outside the embed so it remains usable if Meta cannot display it.
      card.append(embed, link);
      feed.append(card);
    });
    visible += batch.length;
    more.hidden = visible >= posts.length;
    status.textContent = 'Showing ' + visible + ' of ' + posts.length + ' finished tattoo posts, newest first.';
    if (batch.length) processEmbeds();
  }

  async function loadPosts() {
    if (loading || (loaded && Date.now() - loadedAt < refreshMs)) return;
    loading = true;
    more.hidden = true;
    status.textContent = 'Loading Instagram posts…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('assets/marcelo-instagram.json', {
        cache: 'no-cache', signal: controller.signal
      });
      if (!response.ok) throw new Error('Feed unavailable');
      const data = await response.json();
      if (data.account !== 'marcelo.tattooart' || !Array.isArray(data.posts)) throw new Error('Invalid feed');
      const seen = new Set();
      const nextPosts = data.posts.filter(post => {
        if (!post || post.finished_tattoo !== true || typeof post.id !== 'string' || seen.has(post.id) ||
            !postUrl.test(post.permalink) || !Number.isFinite(Date.parse(post.published_at)) ||
            (post.caption != null && typeof post.caption !== 'string') ||
            !Number.isInteger(post.like_count) || post.like_count < 0) return false;
        seen.add(post.id);
        return true;
      }).sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at) || a.id.localeCompare(b.id));
      if (!nextPosts.length) throw new Error('No valid posts');
      loadedAt = Date.now();
      if (loaded && JSON.stringify(posts) === JSON.stringify(nextPosts)) {
        more.hidden = visible >= posts.length;
        status.textContent = 'Showing ' + visible + ' of ' + posts.length + ' finished tattoo posts, newest first.';
        return;
      }
      posts = nextPosts;
      feed.replaceChildren();
      visible = 0;
      loaded = true;
      more.textContent = 'Show more posts';
      showMore();
    } catch {
      loaded = false;
      status.textContent = 'Instagram posts could not load. Try again or visit Marcelo on Instagram.';
      more.textContent = 'Try again';
      more.hidden = false;
    } finally {
      clearTimeout(timeout);
      loading = false;
    }
  }

  more.addEventListener('click', () => loaded ? showMore() : loadPosts());
  new MutationObserver(() => {
    setInterval(() => { if (portfolio.open) loadPosts(); }, refreshMs);
  if (portfolio.open) loadPosts();
  }).observe(portfolio, {attributes: true, attributeFilter: ['open']});
  if (portfolio.open) loadPosts();
})();
