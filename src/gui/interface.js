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

let solver = new Solver();
window.solver = solver;
window.previousBoard = null;

function loadConfig() {
    const fileName = document.getElementById('configFileName').value.trim();
    if (!fileName) {
        alert('Please enter a config file name');
        return;
    }
    window.configFileName = fileName; // Simpan nama file konfigurasi untuk digunakan saat menyimpan solusi
    readConfigFile(fileName, (content) => {
        try {
            solver.loadConfig(content);
            window.previousBoard = solver.board.clone();
            const primaryCar = solver.board.cars.find(c => c.id === 'P');
            if (primaryCar && solver.board.exit) {
                if (primaryCar.isHorizontal && solver.board.exit.row !== primaryCar.row) {
                    throw new Error('Exit (K) must be on the same row as horizontal primary car (P)');
                } else if (!primaryCar.isHorizontal && solver.board.exit.col !== primaryCar.col) {
                    throw new Error('Exit (K) must be on the same column as vertical primary car (P)');
                }
            }
            document.getElementById('output').innerHTML = '<pre>Config loaded successfully:\n' + logBoard(solver.board) + '</pre>';
            if (typeof window.updateCanvasSize === 'function') {
                window.updateCanvasSize(solver.board.width, solver.board.height);
            } else {
                console.warn('updateCanvasSize is not defined.');
            }
        } catch (e) {
            alert('Error parsing config: ' + e.message);
            document.getElementById('output').innerHTML = '<pre>Error: ' + e.message + '</pre>';
        }
    });
}

function startSolve() {
    if (!solver.board) {
        alert('Please load a config file first');
        return;
    }
    window.solutionSteps = []; // Reset langkah-langkah sebelum memulai pencarian
    window.searchAlgorithm = null;
    window.searchHeuristic = null;
    window.searchStep = 0;
    window.searchResult = null;
    window.isSearching = false;
    window.nodesVisited = 0;
    window.currentBoard = null;
    window.previousBoard = solver.board.clone();
    document.getElementById('progress').textContent = 'Progress: 0% (Nodes visited: 0)';
    document.getElementById('output').innerHTML = '<pre>Starting search...</pre>';

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
        console.log('startSolve called with algorithm:', algorithm, 'heuristic:', heuristic);
        console.log('Global variables after reset:', {
            searchAlgorithm: window.searchAlgorithm,
            searchHeuristic: window.searchHeuristic,
            isSearching: window.isSearching,
            nodesVisited: window.nodesVisited
        });
    } catch (e) {
        alert('Error starting solve: ' + e.message);
        document.getElementById('output').innerHTML = '<pre>Error: ' + e.message + '</pre>';
        console.error('Error in startSolve:', e);
    }
}