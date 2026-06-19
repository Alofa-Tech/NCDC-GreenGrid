// trees-loader.js - Load trees from JSON file and display on map
// Initialize global trees array for widget access
window.trees = [];

// Map tree data from JSON to match expected format for widget
function mapTreeData(jsonTree) {
    return {
        tree_id: jsonTree['TREE ID'] || jsonTree.tree_id,
        suburb: jsonTree.Location || jsonTree.Suburb || jsonTree.Freguesia || 'North East',
        suburbName: jsonTree.Location || jsonTree.Suburb || jsonTree.Freguesia || 'North East',
        species: jsonTree['Type / Species'] || jsonTree.especie || 'Unknown',
        health: jsonTree.Health || 'N/A',
        maintenance: jsonTree.Maintenance || 'N/A',
        lat: jsonTree.Lattitude_Y || jsonTree.lat,
        lon: jsonTree.Longitude_X || jsonTree.lon,
        location: jsonTree.Location || jsonTree.local || 'N/A',
        nome_vulga: jsonTree.Nome || jsonTree.nome_vulga || 'Tree',
        especie: jsonTree['Type / Species'] || jsonTree.especie || 'Unknown'
    };
}

// Load trees from JSON file
async function loadTreesFromJSON() {
    try {
        const response = await fetch('trees.jason');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        // Map and store trees in global array
        window.trees = data.map(mapTreeData);
        
        // Display trees on map if map is initialized
        if (window.treeLayer) {
            displayTreesOnMap(window.trees);
        }
        
        // Update tree list section
        updateTreeList(window.trees);
        
        console.log(`Loaded ${window.trees.length} trees from JSON`);
    } catch (error) {
        console.error('Error loading trees:', error);
        // Fallback - create sample trees for demonstration
        createSampleTrees();
    }
}

// Display trees on map with markers
function displayTreesOnMap(trees) {
    if (!window.treeLayer) return;
    
    window.treeLayer.clearLayers();
    
    trees.forEach(tree => {
        if (!tree.lat || !tree.lon) return;
        
        const marker = L.circleMarker([tree.lat, tree.lon], {
            radius: 6,
            fillColor: "#2d5a27",
            color: "#ffffff",
            weight: 1,
            fillOpacity: 0.9
        });
        
        // Create popup with tree information
        const popupContent = `
            <div style="font-family: sans-serif; min-width: 240px; max-width: 280px;">
                <h4 style="margin:0; color:#2d5a27;">Tree #${tree.tree_id}</h4>
                <hr>
                <b>ID:</b> ${tree.tree_id}<br>
                <b>Common Name:</b> ${tree.nome_vulga || 'N/A'}<br>
                <b>Species:</b> <i>${tree.especie || 'N/A'}</i><br>
                <b>Location:</b> ${tree.location || 'N/A'}<br>
                <b>Suburb/District:</b> ${tree.suburb || 'N/A'}<br>
                <b>Health:</b> ${tree.health || 'N/A'}<br>
                <b>Maintenance:</b> ${tree.maintenance || 'N/A'}<br>
                <b>Coordinates:</b> ${tree.lat.toFixed(4)}, ${tree.lon.toFixed(4)}<br>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        marker.addTo(window.treeLayer);
    });
}

// Update the tree list section in HTML
function updateTreeList(trees) {
    const treeListSection = document.getElementById('tree-list');
    if (!treeListSection) return;
    
    // Get or create the list container
    let listContainer = treeListSection.querySelector('.tree-items-container');
    if (!listContainer) {
        listContainer = document.createElement('div');
        listContainer.className = 'tree-items-container';
        listContainer.style.cssText = 'max-height: 400px; overflow-y: auto; padding: 10px 0;';
        treeListSection.appendChild(listContainer);
    }
    
    listContainer.innerHTML = trees.map(tree => `
        <div class="tree-item" data-treeid="${tree.tree_id}" data-suburb="${tree.suburb}" style="padding: 8px; margin: 4px 0; background: var(--primary-color-light); border-radius: 4px; cursor: pointer;">
            <strong>Tree #${tree.tree_id}</strong> — ${tree.nome_vulga || tree.species} 
            <small style="display: block; color: #666; margin-top: 2px;">${tree.suburb}</small>
        </div>
    `).join('');
}

// Create sample trees for demonstration
function createSampleTrees() {
    window.trees = [
        { tree_id: 1, suburb: 'North East', suburbName: 'North East', species: 'Oak', lat: -9.43865, lon: 147.20563, location: 'Park', health: 'Good', maintenance: 'City Hall' },
        { tree_id: 2, suburb: 'North West', suburbName: 'North West', species: 'Elm', lat: -9.44, lon: 147.205, location: 'Street', health: 'Fair', maintenance: 'Parks Dept' },
        { tree_id: 3, suburb: 'Moresby South', suburbName: 'Moresby South', species: 'Pine', lat: -9.437, lon: 147.21, location: 'Garden', health: 'Excellent', maintenance: 'Private' },
        { tree_id: 4, suburb: 'North East', suburbName: 'North East', species: 'Maple', lat: -9.439, lon: 147.208, location: 'Park', health: 'Good', maintenance: 'City Hall' },
        { tree_id: 5, suburb: 'Moresby South', suburbName: 'Moresby South', species: 'Birch', lat: -9.441, lon: 147.212, location: 'Avenue', health: 'Fair', maintenance: 'Parks Dept' },
    ];
    
    displayTreesOnMap(window.trees);
    updateTreeList(window.trees);
    console.log('Using sample trees for demonstration');
}

// Load trees when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for map to initialize, then load trees
    setTimeout(loadTreesFromJSON, 500);
});

// Also listen for map initialization
document.addEventListener('mapInitialized', loadTreesFromJSON);
