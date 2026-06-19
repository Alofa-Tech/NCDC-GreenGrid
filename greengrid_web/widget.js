// widget.js - Enhanced Tree Inventory Widget with Glassmorphism & Rich UX
(function () {
  const SUBURBS = ['Moresby South', 'North West', 'North East'];
  const root = document.getElementById('tree-count-widget-root');
  let lastUpdateTime = new Date();

  // Build enhanced widget DOM with new features
  const widget = document.createElement('aside');
  widget.id = 'tree-count-widget';
  widget.className = 'widget-enhanced';
  widget.innerHTML = `
    <div id="widget-header" class="widget-header-enhanced" style="cursor: move; user-select: none;">
      <div id="widget-title-section" class="title-section">
        <div id="widget-title" class="widget-title">🌳 Tree Inventory</div>
        <div id="widget-total-badge" class="total-badge">
          <span id="total-count" class="badge-number">0</span>
          <span class="badge-label">trees</span>
        </div>
      </div>
      <div id="widget-controls" class="widget-controls">
        <button id="widget-find" title="Find Tree by ID (Ctrl+F)" class="widget-btn icon-btn find-btn" aria-label="Find">🔍</button>
        <button id="widget-refresh" title="Refresh Data" class="widget-btn icon-btn refresh-btn" aria-label="Refresh">⟳</button>
        <button id="widget-stats" title="Show Statistics" class="widget-btn icon-btn stats-btn" aria-label="Stats">📊</button>
        <button id="widget-toggle" title="Collapse" class="widget-btn icon-btn toggle-btn" aria-label="Toggle">−</button>
      </div>
    </div>

    <div id="widget-body" class="widget-body-enhanced">
      <!-- Search/Filter Section -->
      <div id="widget-search" class="search-section" style="display: none;">
        <input type="text" id="widget-search-input" class="search-input" placeholder="Filter by suburb or ID..." />
        <button id="widget-search-close" class="search-close">×</button>
      </div>

      <!-- Statistics Panel with Icons -->
      <div id="widget-stats-panel" class="stats-panel-enhanced" style="display: none;">
        <div class="stat-card">
          <div class="stat-icon">🌍</div>
          <div class="stat-content">
            <div class="stat-label">Total Districts</div>
            <div class="stat-value" id="district-count">3</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <div class="stat-label">Avg per District</div>
            <div class="stat-value" id="avg-count">0</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <div class="stat-label">Most Trees</div>
            <div class="stat-value" id="max-suburb">-</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🕐</div>
          <div class="stat-content">
            <div class="stat-label">Last Updated</div>
            <div class="stat-value" id="last-updated">Now</div>
          </div>
        </div>
      </div>

      <!-- Tree List with Progress Bars -->
      <div id="widget-tree-list" class="tree-list-enhanced"></div>
    </div>

    <div id="widget-footer" class="widget-footer-enhanced">
      <button id="widget-show-all" class="widget-btn footer-btn all-btn" title="View all on map">📍 View All</button>
      <button id="widget-export" class="widget-btn footer-btn export-btn" title="Export data">📥 Export</button>
      <button id="widget-settings" class="widget-btn footer-btn settings-btn" title="Settings">⚙️ Settings</button>
    </div>
  `;
  root.appendChild(widget);

  // ===== DRAG FUNCTIONALITY =====
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  // Load saved position from localStorage
  const savedPosition = localStorage.getItem('treeWidgetPosition');
  if (savedPosition) {
    const pos = JSON.parse(savedPosition);
    widget.style.position = 'fixed';
    widget.style.left = pos.left + 'px';
    widget.style.top = pos.top + 'px';
    widget.style.zIndex = '9999';
  } else {
    // Default position
    widget.style.position = 'fixed';
    widget.style.right = '20px';
    widget.style.top = '20px';
    widget.style.zIndex = '9999';
  }

  const header = widget.querySelector('#widget-header');

  // Mouse down: start dragging
  header.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    isDragging = true;
    const rect = widget.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
  });

  // Mouse move: update position while dragging
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const newLeft = e.clientX - dragOffsetX;
    const newTop = e.clientY - dragOffsetY;
    widget.style.left = newLeft + 'px';
    widget.style.top = newTop + 'px';
    widget.style.right = 'auto';
    widget.style.bottom = 'auto';
  });

  // Mouse up: stop dragging and save position
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      const pos = {
        left: parseInt(widget.style.left),
        top: parseInt(widget.style.top)
      };
      localStorage.setItem('treeWidgetPosition', JSON.stringify(pos));
    }
  });
  // ===== END DRAG FUNCTIONALITY =====

  const body = widget.querySelector('#widget-body');
  const treeList = widget.querySelector('#widget-tree-list');
  const toggleBtn = widget.querySelector('#widget-toggle');
  const refreshBtn = widget.querySelector('#widget-refresh');
  const statsBtn = widget.querySelector('#widget-stats');
  const statsPanel = widget.querySelector('#widget-stats-panel');
  const showAllBtn = widget.querySelector('#widget-show-all');
  const filterBtn = widget.querySelector('#widget-filter-id');
  const settingsBtn = widget.querySelector('#widget-settings');
  const totalBadge = widget.querySelector('#total-count');

  // Count logic: counts trees that have data-suburb attribute matching suburb
  function computeCounts() {
    const counts = {};
    SUBURBS.forEach(s => counts[s] = 0);

    // Strategy 1: if window.trees array exists and items have suburb property
    if (Array.isArray(window.trees)) {
      window.trees.forEach(t => {
        const suburb = (t && (t.suburb || t.suburbName || t.suburb_name)) || '';
        if (SUBURBS.includes(suburb)) counts[suburb] += 1;
      });
      return counts;
    }

    // Strategy 2: use DOM elements with data-suburb
    const nodes = document.querySelectorAll('.tree-item[data-suburb], .tree[data-suburb]');
    if (nodes.length) {
      nodes.forEach(n => {
        const s = n.getAttribute('data-suburb');
        if (SUBURBS.includes(s)) counts[s] += 1;
      });
      return counts;
    }

    // Strategy 3: try to infer from text content (fallback)
    const all = document.querySelectorAll('.tree-item, .tree');
    all.forEach(n => {
      const txt = n.textContent || '';
      SUBURBS.forEach(s => { if (txt.includes(s)) counts[s] += 1; });
    });

    return counts;
  }

  // Calculate statistics
  function getStats(counts) {
    const values = Object.values(counts);
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total > 0 ? (total / SUBURBS.length).toFixed(1) : 0;
    const max = Math.max(...values);
    const maxSuburb = Object.keys(counts).find(k => counts[k] === max) || '-';
    return { total, avg, maxSuburb };
  }

  // Render suburb rows with progress bars
  function renderRows(counts) {
    const stats = getStats(counts);
    const maxCount = Math.max(...Object.values(counts), 1);
    
    // Update total badge
    totalBadge.textContent = stats.total;
    
    // Update stats panel
    document.getElementById('avg-count').textContent = stats.avg;
    document.getElementById('max-suburb').textContent = stats.maxSuburb;
    document.getElementById('last-updated').textContent = new Date().toLocaleTimeString();

    treeList.innerHTML = '';
    SUBURBS.forEach(name => {
      const count = counts[name] || 0;
      const percentage = maxCount > 0 ? (count / maxCount * 100) : 0;
      
      const row = document.createElement('div');
      row.className = 'suburb-row';
      row.innerHTML = `
        <div class="suburb-info">
          <div class="suburb-name">${name}</div>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${percentage}%;"></div>
          </div>
        </div>
        <div class="suburb-stats">
          <div class="suburb-count">${count}</div>
          <span class="percent-badge">${percentage > 0 ? Math.round(percentage) : 0}%</span>
        </div>
      `;
      treeList.appendChild(row);
    });
  }

  // Update displayed totals
  function update() {
    const counts = computeCounts();
    renderRows(counts);
  }

  // Toggle statistics panel
  statsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = statsPanel.style.display === 'none';
    statsPanel.style.display = isHidden ? 'block' : 'none';
    statsBtn.classList.toggle('active', isHidden);
  });

  // Collapse/expand behavior
  let collapsed = false;
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    collapsed = !collapsed;
    widget.classList.toggle('collapsed', collapsed);
    toggleBtn.textContent = collapsed ? '+' : '−';
  });

  // Refresh button with animation
  refreshBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    refreshBtn.style.animation = 'spin 0.6s ease-in-out';
    update();
    setTimeout(() => {
      refreshBtn.style.animation = '';
    }, 600);
  });

  // Show all: scroll to list element
  showAllBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const el = document.getElementById('tree-list');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });

  // Filter by Tree ID
  filterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = prompt('Enter Tree ID to highlight (number):');
    if (!id) return;
    document.querySelectorAll('.tree-highlight').forEach(e => e.classList.remove('tree-highlight'));
    const selector = `.tree-item[data-treeid="${id}"], .tree[data-treeid="${id}"]`;
    const matches = document.querySelectorAll(selector);
    if (matches.length) {
      matches.forEach(m => m.classList.add('tree-highlight'));
      matches[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      alert('No matching tree element found by data-treeid. Searching by text...');
      const all = document.querySelectorAll('.tree-item, .tree');
      let found = false;
      all.forEach(n => { if ((n.textContent||'').includes(id)) { n.classList.add('tree-highlight'); found = true; }});
      if (!found) alert('No matches found.');
    }
  });

  // Settings button
  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    alert('Settings:\n- Widget Position: Drag to move\n- Auto-refresh: ON\n- Theme: Modern Glass');
  });

  // Add highlight style via dynamic style injection
  const style = document.createElement('style');
  style.textContent = `
    .tree-highlight{outline:3px solid rgba(45,183,255,0.8);background:rgba(45,183,255,0.1);border-radius:6px;}
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // Auto-update using MutationObserver
  const observerTarget = document.getElementById('tree-list') || document.body;
  const mo = new MutationObserver(update);
  mo.observe(observerTarget, { childList: true, subtree: true, attributes: true });

  // If window.trees exists, wrap mutator methods to call update
  if (Array.isArray(window.trees)) {
    ['push','pop','splice','shift','unshift'].forEach(fn => {
      if (typeof window.trees[fn] === 'function') {
        const orig = window.trees[fn].bind(window.trees);
        window.trees[fn] = function(...args) { const res = orig(...args); update(); return res; };
      }
    });
  }

  // Initial render
  update();

  // Expose a small API for external code if desired
  window.TreeWidget = {
    refresh: update,
    collapse: () => { if (!collapsed) toggleBtn.click(); },
    expand: () => { if (collapsed) toggleBtn.click(); }
  };
})();
    collapse: () => { if (!collapsed) toggleBtn.click(); },
    expand: () => { if (collapsed) toggleBtn.click(); }
  };
})();
