const $ = (id) => document.getElementById(id);

const defaultClothes = [
    { id: 1, name: "White T-Shirt", category: "Tops", color: "#f8fafc", emoji: "👕" },
    { id: 2, name: "Blue Shirt", category: "Tops", color: "#bfdbfe", emoji: "👔" },
    { id: 3, name: "Pink Blouse", category: "Tops", color: "#f9a8d4", emoji: "👚" },
    { id: 4, name: "Blue Jeans", category: "Bottoms", color: "#536eaa", emoji: "👖" },
    { id: 5, name: "Black Pants", category: "Bottoms", color: "#374151", emoji: "👖" },
    { id: 6, name: "Summer Dress", category: "Dresses", color: "#fb7185", emoji: "👗" },
    { id: 7, name: "Purple Dress", category: "Dresses", color: "#a78bfa", emoji: "👗" },
    { id: 8, name: "Casual Jacket", category: "Jackets", color: "#c4b5fd", emoji: "🧥" }
];

function loadData(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
}

let clothes = loadData("wardrobeClothes", defaultClothes);
let savedOutfits = loadData("wardrobeOutfits", []);
let selectedCategory = "All";

let selectedTop = clothes.find(c => c.id === 1) || clothes[0];
let selectedBottom = clothes.find(c => c.id === 4) ||
    clothes.find(c => c.category === "Bottoms") || null;

function saveData() {
    localStorage.setItem("wardrobeClothes", JSON.stringify(clothes));
    localStorage.setItem("wardrobeOutfits", JSON.stringify(savedOutfits));
}

function notify(text) {
    $("statusMessage").textContent = text;
}

// Get an item by its ID
function findClothing(id) {
    return clothes.find(item => item.id === Number(id));
}

// Display clothing cards
function renderClothes() {
    const grid = $("clothesGrid");
    grid.replaceChildren();

    const filtered = clothes.filter(item =>
        selectedCategory === "All" ||
        item.category === selectedCategory
    );

    filtered.forEach(item => {
        const card = document.createElement("article");
        card.className = "clothing-card";

        const art = document.createElement("div");
        art.className = "clothing-art";
        art.style.backgroundColor = item.color + "30";

        const icon = document.createElement("span");
        icon.textContent = item.emoji;
        art.appendChild(icon);

        const name = document.createElement("h3");
        name.textContent = item.name;

        const category = document.createElement("p");
        category.textContent = item.category;

        const actions = document.createElement("div");
        actions.className = "card-actions";

        const tryButton = document.createElement("button");
        tryButton.className = "try-btn";
        tryButton.textContent = "Try On";
        tryButton.addEventListener("click", () => tryOn(item.id));

        const removeButton = document.createElement("button");
        removeButton.className = "remove-btn";
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", () => removeClothing(item.id));

        actions.append(tryButton, removeButton);
        card.append(art, name, category, actions);
        grid.appendChild(card);
    });

    $("emptyClothes").hidden = filtered.length > 0;
}

// Put the selected item on the preview mannequin
function tryOn(id) {
    const item = findClothing(id);
    if (!item) return;

    if (item.category === "Bottoms") {
        selectedBottom = item;
    } else {
        selectedTop = item;
    }

    updatePreview();
    notify(item.name + " selected for your outfit.");
}

// Update mannequin and selected outfit details
function updatePreview() {
    const top = selectedTop;
    const bottom = selectedBottom;

    const topElement = $("topGarment");
    const bottomElement = $("bottomGarment");
    const person = $("person");

    if (top) {
        topElement.style.backgroundColor = top.color;
        $("topIcon").textContent = top.emoji;
        $("selectedTopIcon").textContent = top.emoji;
        $("selectedTop").textContent = top.name;
    } else {
        topElement.style.backgroundColor = "#e5e7eb";
        $("topIcon").textContent = "👕";
        $("selectedTopIcon").textContent = "—";
        $("selectedTop").textContent = "Not selected";
    }

    if (bottom) {
        bottomElement.style.backgroundColor = bottom.color;
        $("bottomIcon").textContent = bottom.emoji;
        $("selectedBottomIcon").textContent = bottom.emoji;
        $("selectedBottom").textContent = bottom.name;
        bottomElement.style.display = "flex";
    } else {
        bottomElement.style.display = "none";
        $("selectedBottomIcon").textContent = "—";
        $("selectedBottom").textContent = "Not selected";
    }

    // A dress covers the lower half of the mannequin.
    if (top && top.category === "Dresses") {
        bottomElement.style.display = "none";
        bottomElement.style.backgroundColor = top.color;
        topElement.style.height = "100%";
        topElement.style.borderRadius = "22px 22px 18px 18px";
        topElement.style.clipPath =
            "polygon(22% 0,78% 0,100% 15%,88% 40%,100% 100%,0 100%,12% 40%,0 15%)";
        $("outfitName").textContent = top.name;
        $("outfitDescription").textContent =
            "A complete dress look for your wardrobe.";
    } else {
        topElement.style.height = "100%";
        topElement.style.borderRadius = "22px 22px 10px 10px";
        topElement.style.clipPath =
            "polygon(22% 0,78% 0,100% 15%,88% 40%,83% 100%,17% 100%,12% 40%,0 15%)";

        $("outfitName").textContent =
            top && bottom ? "Your Custom Outfit" :
            top ? top.name : bottom ? bottom.name : "Choose an Outfit";

        $("outfitDescription").textContent =
            top && bottom
                ? top.name + " paired with " + bottom.name + "."
                : "Choose a top and bottom to complete your look.";
    }

    // Reset the lower garment color when changing from a dress.
    if (!top || top.category !== "Dresses") {
        bottomElement.style.backgroundColor =
            bottom ? bottom.color : "#e5e7eb";
    }
}

// Category filters
$("filters").addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (!button) return;

    selectedCategory = button.dataset.category;

    document.querySelectorAll(".filter").forEach(filter => {
        filter.classList.toggle("active", filter === button);
    });

    renderClothes();
});

// Add new clothing
$("addClothesBtn").addEventListener("click", () => {
    $("addPanel").hidden = !$("addPanel").hidden;

    if (!$("addPanel").hidden) {
        $("addPanel").scrollIntoView({ behavior: "smooth" });
    }
});

$("cancelAdd").addEventListener("click", () => {
    $("addPanel").hidden = true;
});

$("clothesForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = $("clothesName").value.trim();
    const category = $("clothesCategory").value;
    const color = $("clothesColor").value;
    const emoji = $("clothesEmoji").value;

    if (!name) {
        notify("Please enter a clothing name.");
        return;
    }

    const item = {
        id: Date.now(),
        name,
        category,
        color,
        emoji
    };

    clothes.push(item);
    saveData();
    renderClothes();

    $("clothesForm").reset();
    $("clothesColor").value = "#8b5cf6";
    $("addPanel").hidden = true;

    notify(name + " added to your wardrobe.");
});

// Remove clothing
function removeClothing(id) {
    const item = findClothing(id);
    if (!item) return;

    if (!confirm("Remove " + item.name + " from your wardrobe?")) {
        return;
    }

    clothes = clothes.filter(c => c.id !== Number(id));

    if (selectedTop && selectedTop.id === Number(id)) {
        selectedTop = clothes.find(c =>
            c.category === "Tops" || c.category === "Dresses"
        ) || null;
    }

    if (selectedBottom && selectedBottom.id === Number(id)) {
        selectedBottom = clothes.find(c =>
            c.category === "Bottoms"
        ) || null;
    }

    // Remove saved outfits that contain the deleted item.
    savedOutfits = savedOutfits.filter(outfit =>
        outfit.topId !== Number(id) &&
        outfit.bottomId !== Number(id)
    );

    saveData();
    renderClothes();
    renderSavedOutfits();
    updatePreview();

    notify("Clothing item removed.");
}

// Shuffle the current outfit
$("randomOutfit").addEventListener("click", () => {
    const tops = clothes.filter(c =>
        c.category === "Tops" ||
        c.category === "Dresses" ||
        c.category === "Jackets"
    );

    const bottoms = clothes.filter(c =>
        c.category === "Bottoms"
    );

    if (!tops.length) {
        notify("Add a top or dress before shuffling.");
        return;
    }

    selectedTop = tops[Math.floor(Math.random() * tops.length)];

    if (selectedTop.category !== "Dresses" && bottoms.length) {
        selectedBottom =
            bottoms[Math.floor(Math.random() * bottoms.length)];
    } else if (!bottoms.length) {
        selectedBottom = null;
    }

    updatePreview();
    notify("New outfit combination created!");
});

// Save the current outfit
$("saveOutfit").addEventListener("click", () => {
    if (!selectedTop && !selectedBottom) {
        notify("Select some clothes before saving an outfit.");
        return;
    }

    const duplicate = savedOutfits.some(outfit =>
        outfit.topId === (selectedTop?.id ?? null) &&
        outfit.bottomId === (selectedBottom?.id ?? null)
    );

    if (duplicate) {
        notify("This outfit is already saved.");
        return;
    }

    savedOutfits.push({
        id: Date.now(),
        name: selectedTop?.category === "Dresses"
            ? selectedTop.name
            : "My Outfit " + (savedOutfits.length + 1),
        topId: selectedTop?.id ?? null,
        bottomId: selectedBottom?.id ?? null
    });

    saveData();
    renderSavedOutfits();
    notify("Outfit saved to favorites!");
});

// Display favorite outfits
function renderSavedOutfits() {
    const grid = $("savedGrid");
    grid.replaceChildren();

    savedOutfits.forEach(outfit => {
        const top = findClothing(outfit.topId);
        const bottom = findClothing(outfit.bottomId);

        const card = document.createElement("article");
        card.className = "saved-card";

        const title = document.createElement("h3");
        title.textContent = outfit.name;

        const description = document.createElement("p");
        description.textContent =
            (top ? top.name : "No top") + " + " +
            (bottom ? bottom.name : "No bottom");

        const wearButton = document.createElement("button");
        wearButton.textContent = "Wear Outfit";
        wearButton.addEventListener("click", () => {
            selectedTop = top || null;
            selectedBottom = bottom || null;
            updatePreview();
            window.scrollTo({ top: 0, behavior: "smooth" });
            notify("Saved outfit loaded.");
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Remove";
        deleteButton.addEventListener("click", () => {
            savedOutfits = savedOutfits.filter(o => o.id !== outfit.id);
            saveData();
            renderSavedOutfits();
            notify("Saved outfit removed.");
        });

        card.append(title, description, wearButton, deleteButton);
        grid.appendChild(card);
    });
}

// Toggle favorite outfits section
$("showFavorites").addEventListener("click", () => {
    $("savedSection").hidden = !$("savedSection").hidden;

    if (!$("savedSection").hidden) {
        renderSavedOutfits();
        $("savedSection").scrollIntoView({ behavior: "smooth" });
    }
});

// Initialize the wardrobe
renderClothes();
renderSavedOutfits();
updatePreview();