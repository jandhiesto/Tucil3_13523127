function greedyBFS(board, heuristic, callback) {
    const startTime = performance.now();
    let nodesVisited = 0;
    const queue = new PriorityQueue((a, b) => a.cost - b.cost);
    const visited = new Set();
    queue.push({ board, moves: [], cost: heuristic(board) });
    visited.add(board.toString());

    while (!queue.isEmpty()) {
        const { board: currentBoard, moves } = queue.pop();
        nodesVisited++;
        if (callback) {
            callback(currentBoard, nodesVisited, moves.length > 0 ? moves[moves.length - 1].carId : null);
        }
        if (currentBoard.isSolved()) {
            const timeTaken = performance.now() - startTime;
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
                queue.push({ board: newBoard, moves: newMoves, cost: heuristic(newBoard) });
            }
        }
    }
    const timeTaken = performance.now() - startTime;
    return { moves: null, nodesVisited, timeTaken };
}