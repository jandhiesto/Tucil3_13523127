function blockingPieces(board) {
    const primaryCar = board.cars.find(car => car.id === 'P');
    if (!primaryCar.isHorizontal || primaryCar.row !== board.exit.row) return Infinity;
    let count = 0;
    for (let col = primaryCar.col + primaryCar.length; col < board.exit.col; col++) {
        if (board.grid[primaryCar.row][col] !== 0) count++;
    }
    return count;
}

function manhattanDistance(board) {
    const primaryCar = board.cars.find(car => car.id === 'P');
    if (!primaryCar.isHorizontal || primaryCar.row !== board.exit.row) return Infinity;
    return Math.abs((primaryCar.col + primaryCar.length - 1) - board.exit.col);
}