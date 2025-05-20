let solution = null;
let currentStep = 0;
let isSolving = false;
const CELL_SIZE = 60;
let estimatedTotalNodes = 1000;
let solutionSteps = []; // Array untuk menyimpan langkah-langkah
let configFileName = ''; // Untuk menyimpan nama file konfigurasi

// Fungsi untuk menghitung jarak primary piece ke pintu keluar
function calculateDistanceToExit(board) {
    const primaryCar = board?.cars?.find(car => car.id === 'P');
    if (!primaryCar || !board.exit) return 0;
    let distance;
    if (primaryCar.isHorizontal) {
        distance = Math.abs((primaryCar.col + primaryCar.length) - (board.exit.col >= 0 ? board.exit.col : board.width));
    } else {
        distance = Math.abs((primaryCar.row + primaryCar.length) - (board.exit.row >= 0 ? board.exit.row : board.height));
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

// Fungsi untuk menyimpan langkah-langkah ke file .txt
function saveSolutionToFile(steps, configName) {
    const fileName = configName.replace(/\.[^/.]+$/, "") + 'solution.txt'; // Hapus ekstensi dan tambahkan "solution.txt"
    const content = steps.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`Solution saved as ${fileName}`);
}

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
    console.log('boardToDraw:', boardToDraw);

    // Gambar balok-balok berwarna
    if (boardToDraw && Array.isArray(boardToDraw.cars)) {
        for (let car of boardToDraw.cars) {
            fill(car.color);
            noStroke();
            if (car.isHorizontal) {
                rect(car.col * CELL_SIZE, car.row * CELL_SIZE, car.length * CELL_SIZE, CELL_SIZE);
            } else {
                rect(car.col * CELL_SIZE, car.row * CELL_SIZE, CELL_SIZE, car.length * CELL_SIZE);
            }
        }
    } else {
        console.error('boardToDraw.cars is not iterable:', boardToDraw?.cars);
    }

    // Gambar kotak exit di luar papan
    if (boardToDraw?.exit) {
        fill('blue');
        noStroke();
        if (boardToDraw.exit.col === -1) {
            rect(-CELL_SIZE, boardToDraw.exit.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        } else if (boardToDraw.exit.col === boardToDraw.width) {
            rect(boardToDraw.width * CELL_SIZE, boardToDraw.exit.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        } else if (boardToDraw.exit.row === -1) {
            rect(boardToDraw.exit.col * CELL_SIZE, -CELL_SIZE, CELL_SIZE, CELL_SIZE);
        } else if (boardToDraw.exit.row === boardToDraw.height) {
            rect(boardToDraw.exit.col * CELL_SIZE, boardToDraw.height * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }

    // Animasi pencarian
    if (window.isSearching && window.searchAlgorithm) {
        console.log('Starting search loop, algorithm:', window.searchAlgorithm, 'nodesVisited:', window.nodesVisited);
        let output = document.getElementById('output').innerHTML.replace('</pre>', '');
        let stepOutput = [];
        if (window.previousBoard) {
            const log = logBoardWithChanges(window.previousBoard, boardToDraw);
            output += log;
            stepOutput.push(log);
        } else {
            const log = logBoard(boardToDraw);
            output += log;
            stepOutput.push(log);
        }
        output += '----\n';
        stepOutput.push('----');
        output += '</pre>';
        document.getElementById('output').innerHTML = output;
        document.getElementById('output').scrollTop = document.getElementById('output').scrollHeight;
        solutionSteps.push(...stepOutput);

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
                    let output = document.getElementById('output').innerHTML.replace('</pre>', '');
                    let stepOutput = [];
                    if (carId) {
                        const moveLog = `Moved car ${carId}:`;
                        output += moveLog + '\n';
                        stepOutput.push(moveLog);
                    }
                    const boardLog = logBoard(board);
                    output += boardLog;
                    stepOutput.push(boardLog);
                    output += '----\n';
                    stepOutput.push('----');
                    output += '</pre>';
                    document.getElementById('output').innerHTML = output;
                    document.getElementById('output').scrollTop = document.getElementById('output').scrollHeight;
                    solutionSteps.push(...stepOutput);
                });
                if (window.searchResult) {
                    console.log('Search completed, result:', window.searchResult);
                    window.nodesVisited = window.searchResult.nodesVisited;
                    console.log('Final window.nodesVisited set to:', window.nodesVisited);
                    let finalOutput = document.getElementById('output').innerHTML.replace('</pre>', '');
                    let finalSteps = [];
                    if (window.searchResult.moves) {
                        const boardLog = logBoard(window.currentBoard);
                        finalOutput += boardLog;
                        finalSteps.push(boardLog);
                        finalOutput += '----\n';
                        finalSteps.push('----');
                        const solutionFound = 'Solution found: ' + window.searchResult.moves.length + ' moves';
                        finalOutput += solutionFound + '\n';
                        finalSteps.push(solutionFound);
                        const nodesVisited = 'Total nodes visited: ' + window.nodesVisited;
                        finalOutput += nodesVisited + '\n';
                        finalSteps.push(nodesVisited);
                        const timeTaken = 'Time taken: ' + window.searchResult.timeTaken.toFixed(2) + ' ms';
                        finalOutput += timeTaken + '\n';
                        finalSteps.push(timeTaken);
                        document.getElementById('output').innerHTML = finalOutput + '</pre>';
                        solutionSteps.push(...finalSteps);
                        solution = window.searchResult.moves;
                        window.isSearching = false;
                        isSolving = true;
                        currentStep = 0;
                        updateProgress(window.currentBoard);
                    } else {
                        const noSolution = 'No solution found';
                        finalOutput += noSolution + '\n';
                        finalSteps.push(noSolution);
                        finalOutput += 'Total nodes visited: ' + window.nodesVisited + '\n';
                        finalSteps.push('Total nodes visited: ' + window.nodesVisited);
                        finalOutput += 'Time taken: ' + window.searchResult.timeTaken.toFixed(2) + ' ms\n';
                        finalSteps.push('Time taken: ' + window.searchResult.timeTaken.toFixed(2) + ' ms');
                        document.getElementById('output').innerHTML = finalOutput + '</pre>';
                        solutionSteps.push(...finalSteps);
                        window.isSearching = false;
                        alert('No solution found');
                    }
                    // Simpan langkah-langkah ke file setelah pencarian selesai
                    saveSolutionToFile(solutionSteps, configFileName);
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
            let stepOutput = [];
            const stepLog = `Step ${currentStep + 1}:`;
            output += stepLog + '\n';
            stepOutput.push(stepLog);
            if (window.previousBoard) {
                const log = logBoardWithChanges(window.previousBoard, window.solver.board);
                output += log;
                stepOutput.push(log);
            } else {
                const log = logBoard(window.solver.board);
                output += log;
                stepOutput.push(log);
            }
            output += '----\n';
            stepOutput.push('----');
            window.previousBoard = window.solver.board.clone();
            window.currentBoard = window.solver.board;
            currentStep++;
            if (currentStep >= solution.length) {
                isSolving = false;
                const finishedLog = 'Solution animation finished (Time taken: ' + window.searchResult.timeTaken.toFixed(2) + ' ms)';
                output += finishedLog + '\n';
                stepOutput.push(finishedLog);
            }
            output += '</pre>';
            document.getElementById('output').innerHTML = output;
            document.getElementById('output').scrollTop = document.getElementById('output').scrollHeight;
            solutionSteps.push(...stepOutput);
            // Simpan ulang setelah animasi selesai
            if (!isSolving) {
                saveSolutionToFile(solutionSteps, configFileName);
            }
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