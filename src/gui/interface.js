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
window.solver = solver; // Pastikan solver tersedia secara global

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
            if (typeof window.updateCanvasSize === 'function') {
                window.updateCanvasSize(solver.board.width, solver.board.height);
            } else {
                console.warn('updateCanvasSize is not defined.');
            }
            console.log('Config loaded successfully:', solver.board);
        } catch (e) {
            alert('Error parsing config: ' + e.message);
            console.error('Error in loadConfig:', e);
        }
    });
}

// Fungsi untuk memulai pencarian
function startSolve() {
    if (!solver.board) {
        alert('Please load a config file first');
        return;
    }
    const algorithm = document.getElementById('algorithm').value;
    const heuristic = document.getElementById('heuristic').value;
    try {
        window.searchAlgorithm = algorithm;
        window.searchHeuristic = heuristic;
        window.searchStep = 0;
        window.searchResult = null;
        window.isSearching = true;
        window.nodesVisited = 0;
        window.currentBoard = solver.board.clone();
        document.getElementById('progress').textContent = 'Progress: 0% (Nodes visited: 0)';
        console.log('startSolve called with algorithm:', algorithm, 'heuristic:', heuristic);
        console.log('Global variables set:', {
            searchAlgorithm: window.searchAlgorithm,
            searchHeuristic: window.searchHeuristic,
            isSearching: window.isSearching,
            nodesVisited: window.nodesVisited
        });
    } catch (e) {
        alert('Error starting solve: ' + e.message);
        console.error('Error in startSolve:', e);
    }
}