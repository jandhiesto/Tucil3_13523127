let solver = null;
let solution = null;
let currentStep = 0;
let isSolving = false;
const CELL_SIZE = 60;

// Fungsi untuk mengubah ukuran kanvas
window.updateCanvasSize = function(width, height) {
    if (typeof resizeCanvas === 'function') {
        resizeCanvas(width * CELL_SIZE, height * CELL_SIZE);
    } else {
        console.error('p5.js not ready');
    }
};

function setup() {
    solver = window.solver || new Solver(); // Pastikan solver tersedia
    createCanvas(solver?.board?.width * CELL_SIZE || 360, solver?.board?.height * CELL_SIZE || 360);
    frameRate(60);
}

function draw() {
    if (!solver || !solver.board) return;
    background(220);

    // Gambar grid
    for (let i = 0; i < solver.board.height; i++) {
        for (let j = 0; j < solver.board.width; j++) {
            stroke(0);
            noFill();
            rect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }

    // Gambar balok-balok berwarna
    for (let car of solver.board.cars) {
        fill(car.color);
        noStroke();
        if (car.isHorizontal) {
            rect(car.col * CELL_SIZE, car.row * CELL_SIZE, car.length * CELL_SIZE, CELL_SIZE);
        } else {
            rect(car.col * CELL_SIZE, car.row * CELL_SIZE, CELL_SIZE, car.length * CELL_SIZE);
        }
        // Opsional: Tambahkan label ID di tengah balok
        fill(0);
        textAlign(CENTER, CENTER);
        text(car.id, car.col * CELL_SIZE + (car.length * CELL_SIZE) / 2, car.row * CELL_SIZE + CELL_SIZE / 2);
    }

    // Animasi solusi
    if (isSolving && solution && currentStep < solution.length) {
        if (frameCount % 30 === 0) {
            solver.board.applyMove(solution[currentStep]);
            currentStep++;
            if (currentStep >= solution.length) {
                isSolving = false;
            }
        }
    }

    // Tambahkan penanda K di luar kanvas (opsional, untuk visualisasi)
    if (solver.board.exit) {
        fill('blue');
        noStroke();
        if (solver.board.cars.find(car => car.id === 'P').isHorizontal) {
            // K di dinding kanan, di luar kanvas
            rect(solver.board.width * CELL_SIZE, solver.board.exit.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        } else {
            // K di dinding bawah, di luar kanvas
            rect(solver.board.exit.col * CELL_SIZE, solver.board.height * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
}