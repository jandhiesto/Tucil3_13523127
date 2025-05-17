function logBoard(board) {
    let output = '';
    for (let i = 0; i < board.height; i++) {
        for (let j = 0; j < board.width; j++) {
            const cell = board.grid[i][j];
            if (cell === 0) {
                output += '<span style="color: grey;">.</span> ';
            } else {
                // Cari mobil untuk menentukan warnanya
                const car = board.cars.find(c => c.id === cell);
                const color = car ? car.color : 'black';
                output += `<span style="color: ${color};">${cell}</span> `;
            }
        }
        output += '\n';
    }
    return output;
}

// Fungsi untuk membandingkan dua papan dan menyorot perubahan
function logBoardWithChanges(oldBoard, newBoard) {
    let output = '';
    for (let i = 0; i < newBoard.height; i++) {
        for (let j = 0; j < newBoard.width; j++) {
            const oldCell = oldBoard.grid[i][j];
            const newCell = newBoard.grid[i][j];
            if (oldCell !== newCell) {
                // Jika ada perubahan, sorot dengan latar belakang kuning
                const car = newBoard.cars.find(c => c.id === newCell);
                const color = car ? car.color : 'black';
                output += `<span style="color: ${color}; background-color: yellow;">${newCell === 0 ? '.' : newCell}</span> `;
            } else {
                const cell = newBoard.grid[i][j];
                if (cell === 0) {
                    output += '<span style="color: grey;">.</span> ';
                } else {
                    const car = newBoard.cars.find(c => c.id === cell);
                    const color = car ? car.color : 'black';
                    output += `<span style="color: ${color};">${cell}</span> `;
                }
            }
        }
        output += '\n';
    }
    return output;
}