function aStar(board, heuristic, callback) {
    const startTime = performance.now();
    let nodesVisited = 0;
    const queue = new PriorityQueue((a, b) => a.cost - b.cost);
    const visited = new Set();
    queue.push({ board: board.clone(), moves: [], g: 0, cost: heuristic(board) });
    visited.add(board.toString());

    while (!queue.isEmpty()) {
        const { board: currentBoard, moves, g } = queue.pop();
        nodesVisited++;
        callback(currentBoard, nodesVisited); // Panggil callback untuk update visual
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
                const newG = g + 1;
                const h = heuristic(newBoard);
                queue.push({ board: newBoard, moves: newMoves, g: newG, cost: newG + h });
            }
        }
    }
    const timeTaken = performance.now() - startTime;
    return { moves: null, nodesVisited, timeTaken };
}