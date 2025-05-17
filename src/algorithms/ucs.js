function ucs(board) {
    const startTime = performance.now();
    let nodesVisited = 0;
    const queue = new PriorityQueue((a, b) => a.cost - b.cost);
    const visited = new Set();
    queue.push({ board, moves: [], cost: 0 });
    visited.add(board.toString());

    while (!queue.isEmpty()) {
        const { board: currentBoard, moves, cost } = queue.pop();
        nodesVisited++;
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
                queue.push({ board: newBoard, moves: newMoves, cost: cost + 1 });
                logBoard(newBoard, move.carId);
            }
        }
    }
    return { moves: null, nodesVisited, timeTaken: performance.now() - startTime };
}