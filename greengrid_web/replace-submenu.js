// replace-submenu.js
document.addEventListener("DOMContentLoaded", () => {
    const createTreeButton = document.getElementById("createTreeButton");

    if (createTreeButton) {
        createTreeButton.addEventListener("click", (event) => {
            event.preventDefault(); // Prevents page reload if inside a form

            // Extract values and handle data parsing
            const treeData = {
                treeId: parseInt(document.getElementById("tree_id").value, 10) || null,
                treesTotal: parseInt(document.getElementById("trees_total").value, 10) || 0,
                typeSpecies: document.getElementById("type_species").value.trim(),
                plantingDate: document.getElementById("planting_date").value, // Format: YYYY-MM-DD
                isNew: document.getElementById("status_new").value.trim(),
                replant: document.getElementById("replant").value.trim(),
                latitudeY: parseFloat(document.getElementById("latitude_y").value) || null,
                longitudeX: parseFloat(document.getElementById("longitude_x").value) || null,
                location: document.getElementById("location").value.trim(),
                health: document.getElementById("health").value.trim(),
                maintenance: document.getElementById("maintenance").value.trim()
            };

            // Basic Validation Check (Ensure crucial IDs and Coordinates are present)
            if (!treeData.treeId) {
                alert("Please enter a valid TREE ID.");
                return;
            }

            if (treeData.latitudeY === null || treeData.longitudeX === null) {
                alert("Please enter both Lattitude_Y and Longitude_X coordinates.");
                return;
            }

            // Output the structured object
            console.log("Captured Tree Data Asset:", treeData);

            // OPTIONAL: Clear the form inputs after successful capture
            // clearTreeForm();
        });
    }
});

// Helper function to clear form inputs if needed
function clearTreeForm() {
    const inputIds = [
        "tree_id", "trees_total", "type_species", "planting_date", 
        "status_new", "replant", "latitude_y", "longitude_x", 
        "location", "health", "maintenance"
    ];
    inputIds.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = "1";
    });
}

(function () {
  // Try multiple strategies to compute total number of trees
  function getTotalTrees() {
    if (Array.isArray(window.trees)) return window.trees.length;
    const byClass = document.querySelectorAll('.tree-item, .tree');
    if (byClass.length) return byClass.length;
    return 0;
  }

  const newSubMenuHTML = `
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

