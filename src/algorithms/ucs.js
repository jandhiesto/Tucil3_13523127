function ucs(board, unused, callback) {
    const startTime = performance.now();
    let nodesVisited = 0;
    const queue = new PriorityQueue((a, b) => a.cost - b.cost);
    const visited = new Set();
    queue.push({ board: board.clone(), moves: [], cost: 0 });
    visited.add(board.toString());

    while (!queue.isEmpty()) {
        const { board: currentBoard, moves, cost } = queue.pop();
        nodesVisited++;
        console.log('UCS - Visiting node:', nodesVisited, 'State:', currentBoard.toString(), 'Cost:', cost);
        if (callback) {
            callback(currentBoard, nodesVisited, moves.length > 0 ? moves[moves.length - 1].carId : null);
        }
        if (currentBoard.isSolved()) {
            const timeTaken = performance.now() - startTime;
            console.log('UCS - Solution found, total nodes visited:', nodesVisited);
            return { moves, nodesVisited, timeTaken };
        }
        const possibleMoves = currentBoard.generateMoves();
        for (const move of possibleMoves) {
            const newBoard = currentBoard.clone();
            newBoard.applyMove(move);
            const stateStr = newBoard.toString();
            if (!visited.has(stateStr)) {
                visited.add(stateStr);
                const newMoves = [...moves, move];
                queue.push({ board: newBoard, moves: newMoves, cost: cost + 1 });
            }
        }
    }
    const timeTaken = performance.now() - startTime;
    console.log('UCS - No solution found, total nodes visited:', nodesVisited);
    return { moves: null, nodesVisited, timeTaken };
}