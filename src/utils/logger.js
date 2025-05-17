function logBoard(board, movedCarId = null) {
    let output = '';
    for (let row = 0; row < board.height; row++) {
        for (let col = 0; col < board.width; col++) {
            const cell = board.grid[row][col];
            if (row === board.exit.row && col === board.exit.col) {
                output += '<span style="color: blue;">K</span>';
            } else if (cell === 'P') {
                output += '<span style="color: red;">P</span>';
            } else if (cell === movedCarId) {
                output += '<span style="color: green;">' + cell + '</span>';
            } else if (cell === 0) {
                output += '.';
            } else {
                output += cell;
            }
        }
        output += '\n';
    }
    document.getElementById('output').innerHTML += output + '<hr>';
}