// update-trees-total.js
(function () {
  function getTotalTrees() {
    if (Array.isArray(window.trees)) return window.trees.length;
    const nodes = document.querySelectorAll('.tree-item, .tree, [data-treeid]');
    if (nodes.length) return nodes.length;
    return 0;
  }

  function applyTotal() {
    const input = document.getElementById('trees_total');
    if (!input) return;
    input.readOnly = true;
    input.placeholder = '';
    input.value = getTotalTrees();
  }

  // Initial run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTotal);
  } else {
    applyTotal();
  }

  // Update when DOM changes in tree-list or body (keeps total accurate)
  const observerTarget = document.getElementById('tree-list') || document.body;
  const mo = new MutationObserver(applyTotal);
  mo.observe(observerTarget, { childList: true, subtree: true, attributes: false });

  // If window.trees exists, wrap mutator methods to update automatically
  if (Array.isArray(window.trees)) {
    ['push','pop','splice','shift','unshift'].forEach(fn => {
      if (typeof window.trees[fn] === 'function') {
        const orig = window.trees[fn].bind(window.trees);
        window.trees[fn] = function(...args) { const res = orig(...args); applyTotal(); return res; };
      }
    });
  }

  // Safety: update periodically
  setInterval(applyTotal, 3000);
})();
