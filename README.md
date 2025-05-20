# Rush Hour Solver

A JavaScript-based Rush Hour game solver with GUI, implementing Greedy Best-First Search, UCS, Rosanne algorithm. Built for an academic assignment.

## Features
- Reads board configuration from `.txt` files in `assets/inputs/`.
- Supports Greedy Best-First Search, UCS, and A* with customizable heuristics.
- GUI with p5.js for visualizing board and solution steps.
- Colored console output for board states.

## Setup
1. Ensure you have a local server installed (e.g., Live Server in VS Code, `http-server` via Node.js, or Python's `http.server`).
2. Run the server in the `rush-hour/` directory:
   - For Live Server: Open `index.html` with Live Server in VS Code.
   - For http-server: `npm install -g http-server && http-server`
   - For Python: `python -m http.server 8000`
3. Open `http://localhost:<port>` in a browser.
4. Enter the config file name (e.g., `input` for `assets/inputs/input.txt`).
5. Select algorithm and heuristic, then click "Solve".

## Dependencies
- p5.js (https://p5js.org/), licensed under LGPL-2.1.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.