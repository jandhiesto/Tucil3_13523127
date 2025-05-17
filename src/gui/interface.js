// Priority Queue untuk algoritma
class PriorityQueue {
    constructor(comparator) {
        this.items = [];
        this.comparator = comparator;
    }

    push(item) {
        this.items.push(item);
        this.items.sort(this.comparator);
    }

    pop() {
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

// Inisialisasi solver
let solver = new Solver();

// Fungsi untuk memuat config
function loadConfig() {
    const fileName = document.getElementById('configFileName').value.trim();
    if (!fileName) {
        alert('Please enter a config file name');
        return;
    }
    readConfigFile(fileName, (content) => {
        try {
            solver.loadConfig(content);
            document.getElementById('output').innerHTML = '';
            logBoard(solver.board);
            // Beri tahu sketch.js untuk mengubah ukuran kanvas
            if (typeof window.updateCanvasSize === 'function') {
                window.updateCanvasSize(solver.board.width, solver.board.height);
            } else {
                console.warn('updateCanvasSize is not defined. Ensure sketch.js is loaded.');
            }
        } catch (e) {
            alert('Error parsing config: ' + e.message);
        }
    });
}

// Fungsi solve
function solve() {
    if (!solver.board) {
        alert('Please load a config file first');
        return;
    }
    const algorithm = document.getElementById('algorithm').value;
    const heuristic = document.getElementById('heuristic').value;
    try {
        const result = solver.solve(algorithm, heuristic);
        if (result.moves) {
            solution = result.moves;
            currentStep = 0;
            isSolving = true;
            document.getElementById('output').innerHTML += `Nodes visited: ${result.nodesVisited}\n`;
            document.getElementById('output').innerHTML += `Time taken: ${result.timeTaken.toFixed(2)} ms\n`;
        } else {
            alert('No solution found');
        }
    } catch (e) {
        alert('Error solving: ' + e.message);
    }
}