class Solver {
    constructor() {
        this.board = null;
    }

    loadConfig(content) {
        this.board = new Board();
        this.board.parseConfig(content);
    }

    solve(algorithm, heuristicName) {
        if (!this.board) throw new Error('No board loaded');
        const heuristic = heuristicName === 'blocking' ? blockingPieces : manhattanDistance;
        let result;
        switch (algorithm) {
            case 'greedy':
                result = greedyBFS(this.board, heuristic);
                break;
            case 'ucs':
                result = ucs(this.board);
                break;
            case 'astar':
                result = aStar(this.board, heuristic);
                break;
            default:
                throw new Error('Invalid algorithm');
        }
        return result;
    }
}