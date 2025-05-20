let solution = null;
let currentStep = 0;
let isSolving = false;
const CELL_SIZE = 60;
let estimatedTotalNodes = 1000;

// Fungsi untuk menghitung jarak primary piece ke pintu keluar
function calculateDistanceToExit(board) {
    const primaryCar = board.cars.find(car => car.id === 'P');
    if (!primaryCar) return 0;
    let distance;
    if (primaryCar.isHorizontal) {
        distance = Math.abs((primaryCar.col + primaryCar.length) - board.exit.col);
    } else {
        distance = Math.abs((primaryCar.row + primaryCar.length) - board.exit.row);
    }
    return distance;
}

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
        estimatedTotalNodes = window.solver.board.width * window.solver.board.height * 50;
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
        let output = document.getElementById('output').innerHTML.replace('</pre>', '');
        if (window.previousBoard) {
            output += logBoardWithChanges(window.previousBoard, boardToDraw);
        } else {
            output += logBoard(boardToDraw);
        }
        output += '----\n';
        output += '</pre>';
        document.getElementById('output').innerHTML = output;
        document.getElementById('output').scrollTop = document.getElementById('output').scrollHeight;

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
                case 'iddfs':
                    algorithmFunc = iddfs;
                    break;
                default:
                    console.error('Unknown algorithm:', window.searchAlgorithm);
                    window.isSearching = false;
                    document.getElementById('output').innerHTML = '<pre>Error: Unknown algorithm</pre>';
                    return;
            }
            console.log('Executing algorithm:', window.searchAlgorithm);
            try {
                window.searchResult = algorithmFunc(window.currentBoard || window.solver.board.clone(), window.searchAlgorithm !== 'ucs' && window.searchAlgorithm !== 'iddfs' ? heuristicFunc : null, (board, visited, carId) => {
                    console.log('Callback triggered - Received nodesVisited:', visited, 'Car ID:', carId);
                    window.previousBoard = window.currentBoard ? window.currentBoard.clone() : window.solver.board.clone();
                    window.currentBoard = board;
                    window.nodesVisited = visited;
                    console.log('Updated window.nodesVisited to:', window.nodesVisited);
                    if (window.nodesVisited > estimatedTotalNodes) {
                        estimatedTotalNodes = window.nodesVisited * 2;
                    }
                    updateProgress(board);
                    // Tambahkan log grid untuk setiap langkah pencarian
                    let output = document.getElementById('output').innerHTML.replace('</pre>', '');
                    if (carId) {
                        output += `Moved car ${carId}:\n`;
                    }
                    output += logBoard(board);
                    output += '----\n';
                    output += '</pre>';
                    document.getElementById('output').innerHTML = output;
                    document.getElementById('output').scrollTop = document.getElementById('output').scrollHeight;
                });
                if (window.searchResult) {
                    console.log('Search completed, result:', window.searchResult);
                    window.nodesVisited = window.searchResult.nodesVisited;
                    console.log('Final window.nodesVisited set to:', window.nodesVisited);
                    let finalOutput = document.getElementById('output').innerHTML.replace('</pre>', '');
                    if (window.searchResult.moves) {
                        finalOutput += logBoard(window.currentBoard);
                        finalOutput += '----\n';
                        finalOutput += 'Solution found: ' + window.searchResult.moves.length + ' moves\n';
                        finalOutput += 'Total nodes visited: ' + window.nodesVisited + '\n';
                        finalOutput += 'Time taken: ' + window.searchResult.timeTaken.toFixed(2) + ' ms\n';
                        document.getElementById('output').innerHTML = finalOutput + '</pre>';
                        solution = window.searchResult.moves;
                        window.isSearching = false;
                        isSolving = true;
                        currentStep = 0;
                        updateProgress(window.currentBoard);
                    } else {
                        finalOutput += 'No solution found\n';
                        finalOutput += 'Total nodes visited: ' + window.nodesVisited + '\n';
                        finalOutput += 'Time taken: ' + window.searchResult.timeTaken.toFixed(2) + ' ms\n';
                        document.getElementById('output').innerHTML = finalOutput + '</pre>';
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
            let output = document.getElementById('output').innerHTML.replace('</pre>', '');
            output += `Step ${currentStep + 1}:\n`;
            if (window.previousBoard) {
                output += logBoardWithChanges(window.previousBoard, window.solver.board);
            } else {
                output += logBoard(window.solver.board);
            }
            output += '----\n';
            window.previousBoard = window.solver.board.clone();
            window.currentBoard = window.solver.board;
            currentStep++;
            if (currentStep >= solution.length) {
                isSolving = false;
                output += 'Solution animation finished (Time taken: ' + window.searchResult.timeTaken.toFixed(2) + ' ms)\n';
            }
            output += '</pre>';
            document.getElementById('output').innerHTML = output;
            document.getElementById('output').scrollTop = document.getElementById('output').scrollHeight;
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
function updateProgress(board) {
    const progressElement = document.getElementById('progress');
    if (progressElement && window.nodesVisited >= 0) {
        const initialBoard = window.solver.board;
        const initialDistance = calculateDistanceToExit(initialBoard);
        const currentDistance = calculateDistanceToExit(board);
        let distanceProgress = initialDistance > 0 ? ((initialDistance - currentDistance) / initialDistance) * 100 : 100;
        let nodeProgress = (window.nodesVisited / estimatedTotalNodes) * 100;
        const combinedProgress = Math.min((0.7 * distanceProgress + 0.3 * nodeProgress), 100);
        progressElement.textContent = `Progress: ${combinedProgress.toFixed(1)}% (Nodes visited: ${window.nodesVisited})`;
        console.log('Progress updated:', { distanceProgress, nodeProgress, combinedProgress, nodesVisited: window.nodesVisited });
    }
}