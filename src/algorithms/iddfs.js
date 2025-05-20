function iddfs(board, unused, callback) {
    const startTime = performance.now();
    let nodesVisited = 0;
    const visitedAtDepth = new Map();

    function depthLimitedDFS(currentBoard, depth, moves, visited) {
        nodesVisited++;
        console.log('IDDFS - Visiting node:', nodesVisited, 'Depth:', depth, 'State:', currentBoard.toString());
        if (callback) {
            callback(currentBoard, nodesVisited, moves.length > 0 ? moves[moves.length - 1].carId : null);
        }
        if (currentBoard.isSolved()) {
            return { moves, found: true };
        }
        if (depth <= 0) {
            return { moves: null, found: false };
        }

        const possibleMoves = currentBoard.generateMoves();
        for (const move of possibleMoves) {
            const newBoard = currentBoard.clone();
            newBoard.applyMove(move);
            const stateStr = newBoard.toString();
            const prevDepth = visitedAtDepth.get(stateStr) || -1;
            if (prevDepth < depth) {
                visitedAtDepth.set(stateStr, depth);
                const newMoves = [...moves, move];
                const result = depthLimitedDFS(newBoard, depth - 1, newMoves, visited);
                if (result.found) {
                    return result;
                }
            }
        }
        return { moves: null, found: false };
    }

    let depth = 0;
    let result = { moves: null, found: false };
    while (!result.found) {
        console.log('IDDFS - Starting depth:', depth);
        visitedAtDepth.clear();
        visitedAtDepth.set(board.toString(), depth);
        result = depthLimitedDFS(board.clone(), depth, [], new Set());
        depth++;
        if (depth > 1000) { // Batas untuk mencegah loop tak terbatas
            break;
        }
    }

    const timeTaken = performance.now() - startTime;
    if (result.found) {
        console.log('IDDFS - Solution found, total nodes visited:', nodesVisited);
        return { moves: result.moves, nodesVisited, timeTaken };
    } else {
        console.log('IDDFS - No solution found, total nodes visited:', nodesVisited);
        return { moves: null, nodesVisited, timeTaken };
    }
}