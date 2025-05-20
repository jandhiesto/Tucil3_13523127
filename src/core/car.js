class Car {
    constructor(id, row, col, length, isHorizontal, color) {
        this.id = id;
        this.row = row;
        this.col = col;
        this.length = length;
        this.isHorizontal = isHorizontal;
        this.color = color;
    }

    clone() {
        return new Car(this.id, this.row, this.col, this.length, this.isHorizontal, this.color);
    }
}