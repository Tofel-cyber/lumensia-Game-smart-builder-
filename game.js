// === BAGIAN 1: INISIALISASI & SETUP ===

// Ambil elemen dari HTML untuk kita manipulasi
const gridContainer = document.getElementById('game-grid');
const uangDisplay = document.getElementById('uang-display');
const materialDisplay = document.getElementById('material-display');
const energiDisplay = document.getElementById('energi-display');

// Variabel status game
let gameState = {
    uang: 100,
    material: 50,
    energi: { produksi: 0, kebutuhan: 0 },
    peta: [], // Akan kita isi dengan data grid
    modeBangun: null // Menyimpan jenis bangunan yang akan dibangun
};

// Database bangunan kita (TANPA properti 'warna')
const buildingData = {
    'rumah': { biaya: { material: 10, uang: 0 }, butuhEnergi: 1, hasilUang: 5 },
    'pembangkit': { biaya: { material: 15, uang: 0 }, hasilEnergi: 2 },
    'pabrik': { biaya: { material: 20, uang: 50 }, butuhEnergi: 1, hasilMaterial: 1 }
};

// Fungsi untuk membuat grid di awal
function createGrid() {
    for (let i = 0; i < 400; i++) { // 20x20 = 400 petak
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.index = i;
        cell.addEventListener('click', onGridCellClick);
        gridContainer.appendChild(cell);
        gameState.peta.push(null);
    }
}

// === BAGIAN 2: LOGIKA UTAMA ===

function onGridCellClick(event) {
    const cellIndex = event.target.dataset.index;
    const buildingType = gameState.modeBangun;

    if (!buildingType) return;

    if (gameState.peta[cellIndex]) {
        alert("Petak ini sudah terisi!");
        return;
    }

    const biaya = buildingData[buildingType].biaya;
    if (gameState.uang < biaya.uang || gameState.material < biaya.material) {
        alert("Sumber daya tidak cukup!");
        return;
    }

    gameState.uang -= biaya.uang;
    gameState.material -= biaya.material;

    gameState.peta[cellIndex] = { type: buildingType };
    // Baris ini menambahkan kelas CSS sesuai tipe bangunan (misal: 'rumah', 'pabrik')
    event.target.classList.add(buildingType); 

    gameState.modeBangun = null;
}

function gameLoop() {
    // Hitung ulang energi
    let totalProduksi = 0;
    let totalKebutuhan = 0;
    for (const building of gameState.peta) {
        if (building) {
            const data = buildingData[building.type];
            if (data.hasilEnergi) totalProduksi += data.hasilEnergi;
            if (data.butuhEnergi) totalKebutuhan += data.butuhEnergi;
        }
    }
    gameState.energi.produksi = totalProduksi;
    gameState.energi.kebutuhan = totalKebutuhan;

    // Cek apakah energi cukup
    const energiCukup = gameState.energi.produksi >= gameState.energi.kebutuhan;

    // Produksi sumber daya jika energi cukup
    if (energiCukup) {
        for (const building of gameState.peta) {
            if (building) {
                const data = buildingData[building.type];
                if (data.hasilUang) gameState.uang += data.hasilUang;
                if (data.hasilMaterial) gameState.material += data.hasilMaterial;
            }
        }
    }

    // Perbarui tampilan UI
    uangDisplay.textContent = `Uang: ${Math.floor(gameState.uang)}`;
    materialDisplay.textContent = `Material: ${Math.floor(gameState.material)}`;
    energiDisplay.textContent = `Energi: ${gameState.energi.produksi}/${gameState.energi.kebutuhan}`;
}

// === BAGIAN 3: MENGHUBUNGKAN TOMBOL & MEMULAI GAME ===

document.getElementById('build-rumah').addEventListener('click', () => { gameState.modeBangun = 'rumah'; });
document.getElementById('build-pembangkit').addEventListener('click', () => { gameState.modeBangun = 'pembangkit'; });
document.getElementById('build-pabrik').addEventListener('click', () => { gameState.modeBangun = 'pabrik'; });

// Memulai semuanya
createGrid();
setInterval(gameLoop, 1000);
