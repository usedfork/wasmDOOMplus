import Module from '../wasm/wasm-doom.js';

const canvas = document.getElementById('canvas');
const startBtn = document.getElementById('start-btn');
let started = false;
let doom;

canvas.style.display = 'block';
canvas.tabIndex = 0; // allow keyboard focus

const module_args = {
    canvas: canvas,
    locateFile: (remote_package_base, _) => {
        return 'wasm/' + remote_package_base;
    }
};

function validateWadFile(buffer) {
    if (buffer.length < 4) return false;
    const header = String.fromCharCode(buffer[0], buffer[1], buffer[2], buffer[3]);
    return header === 'IWAD' || header === 'PWAD';
}

async function startDoomWithShareware() {
    if (started) return;
    started = true;
    startBtn.style.display = 'none';

    doom = await Module(module_args);

    const response = await fetch('./shareware.wad');
    const arrBuffer = await response.arrayBuffer();
    const wadBuffer = new Uint8Array(arrBuffer);

    if (!validateWadFile(wadBuffer)) {
        alert('Shareware WAD is missing or invalid.');
        return;
    }

    doom.FS.writeFile('/doom-data.wad', wadBuffer);
    doom.callMain(['-iwad', 'doom-data.wad']);
    canvas.focus();
}

startBtn.addEventListener('click', startDoomWithShareware);

// No fullscreen logic, no upload/shareware buttons, just a windowed canvas.

function resizeCanvas() {
    const aspect = 640 / 400; // or your game's aspect ratio
    let width = Math.floor(window.innerWidth * 0.9);
    let height = Math.floor(width / aspect);

    // If height is too big for viewport, scale down
    if (height > window.innerHeight * 0.9) {
        height = Math.floor(window.innerHeight * 0.9);
        width = Math.floor(height * aspect);
    }

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();


