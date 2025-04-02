document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById('game-grid');
    const attemptCounter = document.getElementById('attempt-counter');
    const solutionGrid = document.getElementById('solution-grid');
    const gameOverDiv = document.getElementById('game-over');
    const newGameButton = document.getElementById('new-game-button');
    const toggleSolutionButton = document.getElementById('toggle-solution-button');
    const shapes = ['square', 'triangle', 'circle', 'hexagon'];
    const colors = ['red', 'blue', 'yellow', 'green'];
    const sizes = ['small', 'large'];

    let tiles = [];
    let attempts = 0;

    newGameButton.addEventListener('click', () => {
        initializeGrid();
        gameOverDiv.classList.add('hidden');
    });

    toggleSolutionButton.addEventListener('click', () => {
        if (solutionGrid.classList.contains('hidden')) {
            solutionGrid.classList.remove('hidden');
            toggleSolutionButton.textContent = 'Hide Solution';
        } else {
            solutionGrid.classList.add('hidden');
            toggleSolutionButton.textContent = 'View Solution';
        }
    });

    function createTile(shape, color, size, draggable = true) {
        const tile = document.createElement('div');
        tile.classList.add('tile', shape, color, size);
        tile.draggable = draggable;
        if (draggable) {
            tile.addEventListener('dragstart', onDragStart);
            tile.addEventListener('dragover', onDragOver);
            tile.addEventListener('drop', onDrop);
        }
        return tile;
    }

    function onDragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.dataset.index);
    }

    function onDragOver(event) {
        event.preventDefault();
    }

    function onDrop(event) {
        event.preventDefault();
        const fromIndex = event.dataTransfer.getData('text/plain');
        const toIndex = event.target.dataset.index;
        swapTiles(fromIndex, toIndex);
        attempts++;
        attemptCounter.textContent = `Attempts: ${attempts}`;
    }

    function swapTiles(fromIndex, toIndex) {
        const fromTile = tiles[fromIndex];
        const toTile = tiles[toIndex];

        tiles[fromIndex] = toTile;
        tiles[toIndex] = fromTile;

        renderGrid();
        checkSuccessCriteria();
    }

    function renderGrid() {
        grid.innerHTML = '';
        tiles.forEach((tile, index) => {
            tile.dataset.index = index;
            grid.appendChild(tile);
        });
    }

    function renderSolution(solution) {
        solutionGrid.innerHTML = '';
        solution.forEach(tileData => {
            const tile = createTile(tileData.shape, tileData.color, tileData.size, false);
            solutionGrid.appendChild(tile);
        });
    }

    function generateSolution() {
        const solution = [
            { shape: 'hexagon', color: 'yellow', size: 'small' }, { shape: 'hexagon', color: 'blue', size: 'large' }, { shape: 'hexagon', color: 'red', size: 'small' }, { shape: 'hexagon', color: 'blue', size: 'large' },
            { shape: 'circle', color: 'yellow', size: 'small' }, { shape: 'circle', color: 'yellow', size: 'large' }, { shape: 'circle', color: 'red', size: 'small' }, { shape: 'circle', color: 'blue', size: 'large' },
            { shape: 'square', color: 'yellow', size: 'small' }, { shape: 'square', color: 'green', size: 'large' }, { shape: 'square', color: 'red', size: 'small' }, { shape: 'square', color: 'blue', size: 'large' },
            { shape: 'triangle', color: 'yellow', size: 'small' }, { shape: 'triangle', color: 'blue', size: 'large' }, { shape: 'triangle', color: 'red', size: 'small' }, { shape: 'triangle', color: 'blue', size: 'large' }
        ];
        return solution;
    }

    function initializeGrid() {
        // Reset attempts
        attempts = 0;
        attemptCounter.textContent = `Attempts: ${attempts}`;

        // Generate the solution
        const solution = generateSolution();

        // Shuffle the tiles to start the game, but keep one row or column solved
        const shuffledTiles = solution.slice();
        const keepRow = Math.floor(Math.random() * 4);
        const keepCol = Math.floor(Math.random() * 4);

        // Shuffle the tiles except for the kept row and column
        let puzzleTiles = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (i !== keepRow && j !== keepCol) {
                    puzzleTiles.push(solution[i * 4 + j]);
                }
            }
        }
        puzzleTiles = puzzleTiles.sort(() => Math.random() - 0.5);

        let puzzleIndex = 0;
        tiles = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let tileData;
                if (i === keepRow || j === keepCol) {
                    tileData = solution[i * 4 + j];
                } else {
                    tileData = puzzleTiles[puzzleIndex++];
                }
                const tile = createTile(tileData.shape, tileData.color, tileData.size);
                tile.dataset.index = i * 4 + j;
                tiles.push(tile);
            }
        }

        renderGrid();
        checkSuccessCriteria();
        renderSolution(solution);
    }

    function checkSuccessCriteria() {
        let isSolved = true;
        let rowStatus = Array(4).fill(false);
        let colStatus = Array(4).fill(false);

        for (let i = 0; i < 4; i++) {
            let rowColors = new Set(), rowShapes = new Set(), rowSizes = new Set();
            let colColors = new Set(), colShapes = new Set(), colSizes = new Set();

            for (let j = 0; j < 4; j++) {
                let rowTile = tiles[i * 4 + j];
                let colTile = tiles[j * 4 + i];

                rowColors.add(rowTile.classList[2]);
                rowShapes.add(rowTile.classList[1]);
                rowSizes.add(rowTile.classList[3]);

                colColors.add(colTile.classList[2]);
                colShapes.add(colTile.classList[1]);
                colSizes.add(colTile.classList[3]);
            }

            if (rowColors.size === 1 || rowShapes.size === 1 || rowSizes.size === 1) {
                rowStatus[i] = true;
            } else {
                isSolved = false;
            }

            if (colColors.size === 1 || colShapes.size === 1 || colSizes.size === 1) {
                colStatus[i] = true;
            } else {
                isSolved = false;
            }
        }

        updateHighlights(rowStatus, colStatus);

        if (isSolved) {
            gameOverDiv.classList.remove('hidden');
        }
    }

    function updateHighlights(rowStatus, colStatus) {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let tile = tiles[i * 4 + j];
                tile.classList.remove('correct-row', 'correct-column');

                if (rowStatus[i] && colStatus[j]) {
                    tile.classList.add('correct-row', 'correct-column');
                } else if (rowStatus[i]) {
                    tile.classList.add('correct-row');
                } else if (colStatus[j]) {
                    tile.classList.add('correct-column');
                }
            }
        }
    }

    initializeGrid();
});