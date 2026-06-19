// tree-widget.js - React widget (no JSX)
(function () {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  if (!React || !ReactDOM) return console.warn('React/ReactDOM not found');

  const SUBURBS = ['Moresby South', 'North West', 'North East'];

  function computeCounts() {
    const counts = Object.fromEntries(SUBURBS.map(s => [s, 0]));
    if (Array.isArray(window.trees)) {
      window.trees.forEach(t => {
        const suburb = (t && (t.suburb || t.suburbName || t.suburb_name)) || '';
        if (SUBURBS.includes(suburb)) counts[suburb] += 1;
      });
      return counts;
    }
    const nodes = document.querySelectorAll('.tree-item[data-suburb], .tree[data-suburb]');
    if (nodes.length) {
      nodes.forEach(n => {
        const s = n.getAttribute('data-suburb');
        if (SUBURBS.includes(s)) counts[s] += 1;
      });
      return counts;
    }
    const all = document.querySelectorAll('.tree-item, .tree');
    all.forEach(n => {
      const txt = n.textContent || '';
      SUBURBS.forEach(s => { if (txt.includes(s)) counts[s] += 1; });
    });
    return counts;
  }

  // Styles injection (scoped minimal)
  (function injectStyles() {
    const css = `
      :root{--widget-bg:#0f2a44;--accent:#2bb7ff;--text:#fff;--muted:#cfe9ff;--glass:rgba(255,255,255,0.04)}
      .tree-widget{position:fixed;right:18px;bottom:18px;width:320px;max-width:calc(100% - 36px);background:linear-gradient(180deg,var(--widget-bg),#071827);color:var(--text);border-radius:12px;box-shadow:0 8px 28px rgba(2,8,23,0.28);padding:12px;z-index:9999;backdrop-filter:blur(6px);transition:all .18s}
      .tree-widget.collapsed{width:56px;height:56px;padding:8px;border-radius:50%;display:flex;align-items:center;justify-content:center}
      .widget-header{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .widget-title{font-weight:600;font-size:14px}
      .widget-body{margin-top:10px}
      .suburb-row{display:flex;align-items:center;justify-content:space-between;padding:8px;border-radius:8px;background:var(--glass);margin-bottom:8px}
      .suburb-name{font-size:13px;color:var(--muted)}
      .suburb-count{font-weight:700;color:var(--accent)}
      .widget-controls{display:flex;gap:8px;margin-top:8px}
      .widget-btn{flex:1;padding:8px;border-radius:8px;border:0;background:rgba(255,255,255,0.06);color:var(--text);cursor:pointer;font-size:13px}
      .tree-highlight{outline:3px solid rgba(43,183,255,0.6);background:rgba(43,183,255,0.06);border-radius:6px}
      @media(max-width:420px){.tree-widget{right:12px;bottom:12px;width:280px}}
    `;
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
  })();

  // React element factory
  const e = React.createElement;

  function TreeWidgetComponent() {
    const [counts, setCounts] = React.useState(computeCounts());
    const [collapsed, setCollapsed] = React.useState(false);

    React.useEffect(() => {
      function update() { setCounts(computeCounts()); }
      const target = document.getElementById('tree-list') || document.body;
      const mo = new MutationObserver(update);
      mo.observe(target, { childList: true, subtree: true, attributes: true });

      if (Array.isArray(window.trees)) {
        ['push','pop','splice','shift','unshift'].forEach(fn => {
          if (typeof window.trees[fn] === 'function') {
            const orig = window.trees[fn].bind(window.trees);
            window.trees[fn] = function(...args) { const res = orig(...args); update(); return res; };
          }
        });
      }

      const interval = setInterval(update, 2000);
      return () => { mo.disconnect(); clearInterval(interval); };
    }, []);

    function refresh() { setCounts(computeCounts()); }
    function showAll() { const el = document.getElementById('tree-list'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }
    function filterById() {
      const id = prompt('Enter Tree ID to highlight (number):');
      if (!id) return;
      document.querySelectorAll('.tree-highlight').forEach(x => x.classList.remove('tree-highlight'));
      const matches = document.querySelectorAll(`.tree-item[data-treeid="${id}"], .tree[data-treeid="${id}"]`);
      if (matches.length) { matches.forEach(m => m.classList.add('tree-highlight')); matches[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      else alert('No matching tree found by data-treeid.');
    }

    const body = e('div', { className: 'widget-body' },
      SUBURBS.map(s => e('div', { key: s, className: 'suburb-row' },
        e('div', { className: 'suburb-name' }, s),
        e('div', { className: 'suburb-count' }, counts[s] || 0)
      ))
    );

    return e('aside', { className: 'tree-widget' + (collapsed ? ' collapsed' : ''), role: 'region', 'aria-label': 'Tree counts widget' },
      !collapsed
        ? e('div', null,
            e('div', { className: 'widget-header' },
              e('div', { className: 'widget-title' }, 'Tree Counts'),
              e('div', { style: { display: 'flex', gap: 8 } },
                e('button', { className: 'widget-btn', onClick: refresh, title: 'Refresh', style: { padding: '6px 8px', fontSize: 12 } }, '⟳'),
                e('button', { onClick: () => setCollapsed(true), title: 'Collapse', style: { background: 'transparent', border: 0, color: 'var(--muted)', fontSize: 18 } }, '−')
              )
            ),
            body,
            e('div', { className: 'widget-controls' },
              e('button', { className: 'widget-btn', onClick: showAll }, 'Show All'),
              e('button', { className: 'widget-btn', onClick: filterById }, 'Filter by Tree ID')
            )
          )
        : e('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
            e('div', { id: 'widget-icon', style: { width: 40, height: 40, borderRadius: 20, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#032033', fontWeight: 700 } }, 'T'),
            e('button', { onClick: () => setCollapsed(false), style: { background: 'transparent', border: 0, color: 'var(--muted)' } }, 'Expand')
          )
    );
  }

  // Ensure mount point
  let mount = document.getElementById('tree-widget-root');
  if (!mount) {
    mount = document.createElement('div');
    mount.id = 'tree-widget-root';
    document.body.appendChild(mount);
  }

  ReactDOM.createRoot(mount).render(React.createElement(TreeWidgetComponent));
})();
