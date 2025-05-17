let solution = null;
let currentStep = 0;
let isSolving = false;
const CELL_SIZE = 60;

// Fungsi untuk mengubah ukuran kanvas
window.updateCanvasSize = function(width, height) {
    console.log('Updating canvas size to:', width, height);
    if (typeof resizeCanvas === 'function') {
        resizeCanvas(width * CELL_SIZE, height * CELL_SIZE);
    } else {
        console.error('p5.js not ready');
    }
};

function setup() {
    if (window.solver && window.solver.board) {
        createCanvas(window.solver.board.width * CELL_SIZE, window.solver.board.height * CELL_SIZE);
    } else {
        createCanvas(360, 360); // Default size
    }
    frameRate(60);
    console.log('Setup completed, solver available:', !!window.solver);
}

function draw() {
    if (!window.solver || !window.solver.board) {
        console.log('Draw skipped: solver or board not available');
        return;
    }

    background(220);

    // Gambar grid
    for (let i = 0; i < window.solver.board.height; i++) {
        for (let j = 0; j < window.solver.board.width; j++) {
            stroke(0);
            noFill();
            rect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }

    // Gunakan currentBoard untuk animasi pencarian
    const boardToDraw = window.currentBoard || window.solver.board;

    // Gambar balok-balok berwarna
    for (let car of boardToDraw.cars) {
        fill(car.color);
        noStroke();
        if (car.isHorizontal) {
            rect(car.col * CELL_SIZE, car.row * CELL_SIZE, car.length * CELL_SIZE, CELL_SIZE);
        } else {
            rect(car.col * CELL_SIZE, car.row * CELL_SIZE, CELL_SIZE, car.length * CELL_SIZE);
        }
    }

    // Animasi pencarian
    if (window.isSearching && window.searchAlgorithm) {
        console.log('Search in progress... Nodes visited:', window.nodesVisited);
        if (!window.searchResult) {
            let heuristicFunc = window.searchHeuristic === 'blocking' ? blockingPieces : manhattanDistance;
            let algorithmFunc;
            switch (window.searchAlgorithm) {
                case 'greedy':
                    algorithmFunc = greedyBFS;
                    break;
                case 'ucs':
                    algorithmFunc = ucs;
                    break;
                case 'astar':
                    algorithmFunc = aStar;
                    break;
                default:
                    console.error('Unknown algorithm:', window.searchAlgorithm);
                    window.isSearching = false;
                    return;
            }
            console.log('Starting algorithm:', window.searchAlgorithm);
            try {
                window.searchResult = algorithmFunc(window.currentBoard || window.solver.board.clone(), heuristicFunc, (board, visited) => {
                    window.currentBoard = board;
                    window.nodesVisited = visited;
                    updateProgress();
                    console.log('Callback triggered - Nodes visited:', visited, 'Board updated:', board.toString());
                });
                if (window.searchResult.moves) {
                    console.log('Solution found:', window.searchResult.moves);
                    solution = window.searchResult.moves;
                    window.isSearching = false;
                    isSolving = true;
                    currentStep = 0;
                } else {
                    console.log('No solution found');
                    window.isSearching = false;
                    alert('No solution found');
                }
            } catch (e) {
                console.error('Error running algorithm:', e);
                window.isSearching = false;
                alert('Error during search: ' + e.message);
            }
        }
    } else if (window.isSearching && !window.searchAlgorithm) {
        console.error('Search attempted but no algorithm specified');
        window.isSearching = false;
    }

    // Animasi solusi
    if (isSolving && solution && currentStep < solution.length) {
        if (frameCount % 30 === 0) {
            window.solver.board.applyMove(solution[currentStep]);
            window.currentBoard = window.solver.board;
            currentStep++;
            if (currentStep >= solution.length) {
                isSolving = false;
                document.getElementById('progress').textContent += ` (Done in ${window.searchResult.timeTaken.toFixed(2)} ms)`;
                console.log('Solution animation finished');
            }
            updateProgress();
        }
    }

    // Tambahkan penanda K di luar kanvas
    if (window.solver.board.exit) {
        fill('blue');
        noStroke();
        if (window.solver.board.cars.find(car => car.id === 'P').isHorizontal) {
            rect(window.solver.board.width * CELL_SIZE, window.solver.board.exit.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        } else {
            rect(window.solver.board.exit.col * CELL_SIZE, window.solver.board.height * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
}

// Fungsi untuk memperbarui kemajuan
function updateProgress() {
    const progressElement = document.getElementById('progress');
    if (progressElement && window.nodesVisited >= 0) {
        const estimatedTotal = 1000;
        const percentage = Math.min((window.nodesVisited / estimatedTotal) * 100, 100);
        progressElement.textContent = `Progress: ${percentage.toFixed(1)}% (Nodes visited: ${window.nodesVisited})`;
    }
}