class Board {
    constructor() {
        this.width = 0;
        this.height = 0;
        this.grid = [];
        this.cars = [];
        this.exit = { row: -1, col: -1 }; // Posisi K di luar papan
    }

    // Parse input .txt
    parseConfig(content) {
        console.log('Parsing content:', content); // Debug: Cetak konten yang diterima
        const lines = content.trim().split('\n');
        // Baris pertama: A B (dimensi)
        const [width, height] = lines[0].split(' ').map(Number);
        this.width = width;
        this.height = height;
        // Baris kedua: N (jumlah balok)
        const numCars = parseInt(lines[1]);
        // Baris berikutnya: konfigurasi papan
        const gridLines = lines.slice(2, 2 + height);
        this.grid = gridLines.map(line => line.trim().split('').map(c => c === '.' ? 0 : c));

        console.log('Parsed grid:', this.grid); // Debug: Cetak grid setelah parsing

        // Identifikasi balok
        const carMap = new Map(); // Map untuk melacak balok berdasarkan ID
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const id = this.grid[row][col];
                if (id === 0) continue; // Sel kosong
                if (!carMap.has(id)) {
                    carMap.set(id, { id, positions: [] });
                }
                carMap.get(id).positions.push({ row, col });
            }
        }

        // Konversi posisi ke objek Car
        this.cars = Array.from(carMap.values()).map(carData => {
            const { id, positions } = carData;
            positions.sort((a, b) => a.row === b.row ? a.col - b.col : a.row - b.row);
            const isHorizontal = positions[0].row === positions[1]?.row || false;
            const length = positions.length;
            const row = positions[0].row;
            const col = positions[0].col;
            const color = id === 'P' ? 'red' : `hsl(${Math.random() * 360}, 70%, 50%)`;
            return new Car(id, row, col, length, isHorizontal, color);
        });

        // Tentukan posisi exit (K) berdasarkan primary piece (P)
        const primaryCar = this.cars.find(car => car.id === 'P');
        if (!primaryCar) {
            throw new Error('Primary piece (P) tidak ditemukan');
        }

        // Tentukan posisi K di luar papan, sejajar dengan P
        if (primaryCar.isHorizontal) {
            this.exit.col = this.width; // K di dinding kanan, di luar papan
            this.exit.row = primaryCar.row;
        } else {
            this.exit.row = this.height; // K di dinding bawah, di luar papan
            this.exit.col = primaryCar.col;
        }
        console.log(`Exit set at (${this.exit.row}, ${this.exit.col}) outside board`); // Debug

        // Validasi
        if (this.cars.length !== numCars + 1) { // +1 untuk primary piece
            console.warn('Number of cars mismatch:', this.cars.length, 'expected', numCars + 1);
            throw new Error('Jumlah balok tidak sesuai dengan N');
        }
    }

    // Salin papan untuk state baru
    clone() {
        const newBoard = new Board();
        newBoard.width = this.width;
        newBoard.height = this.height;
        newBoard.grid = this.grid.map(row => [...row]);
        newBoard.cars = this.cars.map(car => car.clone());
        newBoard.exit = { ...this.exit };
        return newBoard;
    }

    // Terapkan gerakan
    applyMove(move) {
        const car = this.cars.find(c => c.id === move.carId);
        if (!car) return false;
        if (car.isHorizontal) {
            for (let i = 0; i < car.length; i++) {
                this.grid[car.row][car.col + i] = 0;
            }
            car.col += move.direction;
            for (let i = 0; i < car.length; i++) {
                this.grid[car.row][car.col + i] = car.id;
            }
        } else {
            for (let i = 0; i < car.length; i++) {
                this.grid[car.row + i][car.col] = 0;
            }
            car.row += move.direction;
            for (let i = 0; i < car.length; i++) {
                this.grid[car.row + i][car.col] = car.id;
            }
        }
        return true;
    }

    // Generate kemungkinan gerakan
    generateMoves() {
        const moves = [];
        for (const car of this.cars) {
            if (car.isHorizontal) {
                if (car.col > 0 && this.grid[car.row][car.col - 1] === 0) {
                    moves.push({ carId: car.id, direction: -1 });
                }
                if (car.col + car.length < this.width && this.grid[car.row][car.col + car.length] === 0) {
                    moves.push({ carId: car.id, direction: 1 });
                }
            } else {
                if (car.row > 0 && this.grid[car.row - 1][car.col] === 0) {
                    moves.push({ carId: car.id, direction: -1 });
                }
                if (car.row + car.length < this.height && this.grid[car.row + car.length][car.col] === 0) {
                    moves.push({ carId: car.id, direction: 1 });
                }
            }
        }
        return moves;
    }

    // Cek apakah selesai
    isSolved() {
        const primaryCar = this.cars.find(car => car.id === 'P');
        return primaryCar.isHorizontal && primaryCar.col + primaryCar.length === this.exit.col && primaryCar.row === this.exit.row ||
               !primaryCar.isHorizontal && primaryCar.row + primaryCar.length === this.exit.row && primaryCar.col === this.exit.col;
    }

    // Konversi ke string untuk visited set
    toString() {
        return this.cars.map(car => `${car.id}:${car.row},${car.col}`).join('|');
    }
}