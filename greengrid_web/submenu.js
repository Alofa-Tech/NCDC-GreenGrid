// replace-submenu.js
(function () {
  // Try multiple strategies to compute total number of trees
  function getTotalTrees() {
    if (Array.isArray(window.trees)) return window.trees.length;
    const byClass = document.querySelectorAll('.tree-item, .tree');
    if (byClass.length) return byClass.length;
    return 0;
  }

  const newSubMenuHTML = `
    <div class="sub-menu">
      <label for="treeid" style="color: var(--text-color)">Tree ID:</label>
      <input type="number" id="treeid" min="1" placeholder="e.g. 10">

      <label for="treestotal" style="color: var(--text-color)">TREES TOTAL:</label>
      <input type="number" id="treestotal" readonly>

      <label for="especie" style="color: var(--text-color)">Type / Species:</label>
      <input type="text" id="especie" placeholder="e.g. Platanus sp.">

      <label for="plantingdate" style="color: var(--text-color)">Planting Date:</label>
      <input type="date" id="plantingdate">

      <label for="new" style="color: var(--text-color)">NEW:</label>
      <input type="text" id="new" placeholder="e.g. yes/no">

      <label for="replant" style="color: var(--text-color)">REPLANT:</label>
      <input type="text" id="replant" placeholder="e.g. yes/no">

      <label for="lat" style="color: var(--text-color)">Lattitude_Y :</label>
      <input type="number" id="lat" step="any" placeholder="e.g. 38.563768">

      <label for="lon" style="color: var(--text-color)">Longitude_X:</label>
      <input type="number" id="lon" step="any" placeholder="e.g. -9.586967">

      <label for="morada" style="color: var(--text-color)">Location:</label>
      <input type="text" id="morada" placeholder="e.g. Road Side">

      <label for="health" style="color: var(--text-color)">Health:</label>
      <input type="text" id="health" placeholder="e.g. platano">

      <label for="manutencao" style="color: var(--text-color)">Maintenance:</label>
      <input type="text" id="manutencao" placeholder="e.g. JF">

      <button id="createTreeButton" style="position: relative; width: 100%; margin-top: 10px;">Add Tree</button>
    </div>
  `;

  function insertSubMenu() {
    const target = document.querySelector('.sub-menu');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = newSubMenuHTML.trim();
    const newNode = wrapper.firstElementChild;
    if (target) target.replaceWith(newNode);
    else document.body.insertAdjacentElement('beforeend', newNode);

    const totalInput = document.getElementById('treestotal');
    if (!totalInput) return;

    const updateTotal = () => { totalInput.value = getTotalTrees(); };
    updateTotal();

    // Observe DOM changes to update count automatically
    const observerTarget = document.getElementById('tree-list') || document.body;
    const observer = new MutationObserver(() => updateTotal());
    observer.observe(observerTarget, { childList: true, subtree: true });

    // If the page uses a global window.trees array, wrap mutators to update automatically
    if (Array.isArray(window.trees)) {
      ['push','pop','splice','shift','unshift'].forEach(fn => {
        if (typeof window.trees[fn] === 'function') {
          const orig = window.trees[fn].bind(window.trees);
          window.trees[fn] = function(...args) { const res = orig(...args); updateTotal(); return res; };
        }
      });
    }

    // Wire Add Tree button for demo: creates a new .tree-item and updates count
    const addBtn = document.getElementById('createTreeButton');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        const list = document.getElementById('tree-list') || document.body;
        const el = document.createElement('div');
        el.className = 'tree-item';
        el.textContent = 'New tree';
        list.appendChild(el);

        // If window.trees exists, push a placeholder to it too
        if (Array.isArray(window.trees)) window.trees.push({}); 
        updateTotal();
      });
    }

    // small delay for apps that render async
    setTimeout(updateTotal, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertSubMenu);
  } else {
    insertSubMenu();
  }
})();
