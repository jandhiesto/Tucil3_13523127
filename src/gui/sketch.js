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
        createCanvas(360, 360);
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
        console.log('Starting search loop, algorithm:', window.searchAlgorithm, 'nodesVisited:', window.nodesVisited);
        document.getElementById('output').innerHTML = '<pre>Search in progress... Nodes visited: ' + window.nodesVisited + '\n';
        if (window.previousBoard) {
            document.getElementById('output').innerHTML += logBoardWithChanges(window.previousBoard, boardToDraw);
        } else {
            document.getElementById('output').innerHTML += logBoard(boardToDraw);
        }
        document.getElementById('output').innerHTML += '</pre>';

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
                    document.getElementById('output').innerHTML = '<pre>Error: Unknown algorithm</pre>';
                    return;
            }
            console.log('Executing algorithm:', window.searchAlgorithm);
            try {
                window.searchResult = algorithmFunc(window.currentBoard || window.solver.board.clone(), window.searchAlgorithm !== 'ucs' ? heuristicFunc : null, (board, visited) => {
                    console.log('Callback triggered - Received nodesVisited:', visited);
                    window.previousBoard = window.currentBoard ? window.currentBoard.clone() : window.solver.board.clone();
                    window.currentBoard = board;
                    window.nodesVisited = visited;
                    console.log('Updated window.nodesVisited to:', window.nodesVisited);
                });
                if (window.searchResult) {
                    console.log('Search completed, result:', window.searchResult);
                    window.nodesVisited = window.searchResult.nodesVisited;
                    console.log('Final window.nodesVisited set to:', window.nodesVisited);
                    if (window.searchResult.moves) {
                        document.getElementById('output').innerHTML = '<pre>Solution found: ' + window.searchResult.moves.length + ' moves\n';
                        document.getElementById('output').innerHTML += 'Total nodes visited: ' + window.nodesVisited + '\n'; // Tampilkan nodesVisited di log
                        document.getElementById('output').innerHTML += logBoard(window.currentBoard);
                        document.getElementById('output').innerHTML += '</pre>';
                        solution = window.searchResult.moves;
                        window.isSearching = false;
                        isSolving = true;
                        currentStep = 0;
                    } else {
                        document.getElementById('output').innerHTML = '<pre>No solution found\n';
                        document.getElementById('output').innerHTML += 'Total nodes visited: ' + window.nodesVisited + '\n';
                        document.getElementById('output').innerHTML += '</pre>';
                        window.isSearching = false;
                        alert('No solution found');
                    }
                }
            } catch (e) {
                document.getElementById('output').innerHTML = '<pre>Error running algorithm: ' + e.message + '</pre>';
                console.error('Error running algorithm:', e);
                window.isSearching = false;
                alert('Error during search: ' + e.message);
            }
        }
    }

    // Animasi solusi
    if (isSolving && solution && currentStep < solution.length) {
        if (frameCount % 30 === 0) {
            window.solver.board.applyMove(solution[currentStep]);
            document.getElementById('output').innerHTML = '<pre>Step ' + (currentStep + 1) + ':\n';
            if (window.previousBoard) {
                document.getElementById('output').innerHTML += logBoardWithChanges(window.previousBoard, window.solver.board);
            } else {
                document.getElementById('output').innerHTML += logBoard(window.solver.board);
            }
            document.getElementById('output').innerHTML += '</pre>';
            window.previousBoard = window.solver.board.clone();
            window.currentBoard = window.solver.board;
            currentStep++;
            if (currentStep >= solution.length) {
                isSolving = false;
                document.getElementById('output').innerHTML = '<pre>Solution animation finished (Time taken: ' + window.searchResult.timeTaken.toFixed(2) + ' ms)\n';
                document.getElementById('output').innerHTML += logBoard(window.solver.board);
                document.getElementById('output').innerHTML += '</pre>';
            }
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