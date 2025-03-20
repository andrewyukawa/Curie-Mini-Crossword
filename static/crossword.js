document.addEventListener('DOMContentLoaded', () => {
    const crosswordGrid = document.getElementById('crossword-grid');
    const acrossClues = document.getElementById('across-clues');
    const downClues = document.getElementById('down-clues');
    const checkBtn = document.getElementById('check-btn');
    const revealBtn = document.getElementById('reveal-btn');
    const resetBtn = document.getElementById('reset-btn');
    const messageEl = document.getElementById('message');

    let puzzleData = null;
    let cells = [];
    let selectedCell = null;
    let selectedClue = null;
    let selectedDirection = 'across';
    let userAnswers = [];

    // Fetch puzzle data from the API
    async function fetchPuzzleData() {
        try {
            const response = await fetch('/api/puzzle');
            if (!response.ok) {
                throw new Error('Failed to fetch puzzle data');
            }
            puzzleData = await response.json();
            initPuzzle();
        } catch (error) {
            messageEl.textContent = 'Error loading puzzle: ' + error.message;
            messageEl.classList.add('error');
        }
    }

    function initPuzzle() {
        createGrid();
        createClues();
        initUserAnswers();
    }

    function createGrid() {
        const size = puzzleData.size;
        crosswordGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        crosswordGrid.style.gridTemplateRows = `repeat(${size}, 1fr)`;

        cells = [];
        crosswordGrid.innerHTML = '';

        for (let row = 0; row < size; row++) {
            cells[row] = [];
            for (let col = 0; col < size; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                
                // Add cell number if needed
                const cellNum = puzzleData.gridnums[row][col];
                if (cellNum > 0) {
                    const numSpan = document.createElement('span');
                    numSpan.classList.add('cell-number');
                    numSpan.textContent = cellNum;
                    cell.appendChild(numSpan);
                }

                // Mark black cells
                if (puzzleData.grid[row][col] === '#') {
                    cell.classList.add('black');
                } else {
                    // Add click event for playable cells
                    cell.dataset.row = row;
                    cell.dataset.col = col;
                    cell.addEventListener('click', () => selectCell(row, col));
                    
                    // Add input handling
                    cell.tabIndex = 0;
                    cell.addEventListener('keydown', (e) => handleKeyDown(e, row, col));
                }

                crosswordGrid.appendChild(cell);
                cells[row][col] = cell;
            }
        }
    }

    function createClues() {
        acrossClues.innerHTML = '';
        downClues.innerHTML = '';

        // Create across clues
        Object.entries(puzzleData.clues.across).forEach(([number, clue]) => {
            const clueItem = document.createElement('li');
            clueItem.classList.add('clue-item');
            clueItem.dataset.direction = 'across';
            clueItem.dataset.number = number;
            
            const clueNumber = document.createElement('span');
            clueNumber.classList.add('clue-number');
            clueNumber.textContent = number + '.';
            
            const clueText = document.createElement('span');
            clueText.classList.add('clue-text');
            clueText.textContent = clue;
            
            clueItem.appendChild(clueNumber);
            clueItem.appendChild(clueText);
            clueItem.addEventListener('click', () => selectClue('across', number));
            
            acrossClues.appendChild(clueItem);
        });

        // Create down clues
        Object.entries(puzzleData.clues.down).forEach(([number, clue]) => {
            const clueItem = document.createElement('li');
            clueItem.classList.add('clue-item');
            clueItem.dataset.direction = 'down';
            clueItem.dataset.number = number;
            
            const clueNumber = document.createElement('span');
            clueNumber.classList.add('clue-number');
            clueNumber.textContent = number + '.';
            
            const clueText = document.createElement('span');
            clueText.classList.add('clue-text');
            clueText.textContent = clue;
            
            clueItem.appendChild(clueNumber);
            clueItem.appendChild(clueText);
            clueItem.addEventListener('click', () => selectClue('down', number));
            
            downClues.appendChild(clueItem);
        });
    }

    function initUserAnswers() {
        userAnswers = [];
        for (let row = 0; row < puzzleData.size; row++) {
            userAnswers[row] = [];
            for (let col = 0; col < puzzleData.size; col++) {
                userAnswers[row][col] = puzzleData.grid[row][col] === '#' ? '#' : '';
            }
        }
    }

    function selectCell(row, col) {
        // Ignore black cells
        if (puzzleData.grid[row][col] === '#') return;

        // Clear previous selection
        clearHighlights();

        // Set new selection
        selectedCell = { row, col };
        cells[row][col].classList.add('selected');

        // Find which clues this cell belongs to
        const cellNum = puzzleData.gridnums[row][col];
        let acrossClueNum = null;
        let downClueNum = null;

        // Check if this cell starts an across clue
        if (cellNum > 0 && puzzleData.clues.across[cellNum]) {
            acrossClueNum = cellNum;
        } else {
            // Find which across clue this cell belongs to
            for (let c = col; c >= 0; c--) {
                const num = puzzleData.gridnums[row][c];
                if (num > 0 && puzzleData.clues.across[num]) {
                    acrossClueNum = num;
                    break;
                }
                if (puzzleData.grid[row][c] === '#') break;
            }
        }

        // Check if this cell starts a down clue
        if (cellNum > 0 && puzzleData.clues.down[cellNum]) {
            downClueNum = cellNum;
        } else {
            // Find which down clue this cell belongs to
            for (let r = row; r >= 0; r--) {
                const num = puzzleData.gridnums[r][col];
                if (num > 0 && puzzleData.clues.down[num]) {
                    downClueNum = num;
                    break;
                }
                if (puzzleData.grid[r][col] === '#') break;
            }
        }

        // Determine which direction to highlight
        if (selectedDirection === 'across' && acrossClueNum) {
            highlightClue('across', acrossClueNum);
        } else if (selectedDirection === 'down' && downClueNum) {
            highlightClue('down', downClueNum);
        } else if (acrossClueNum) {
            highlightClue('across', acrossClueNum);
            selectedDirection = 'across';
        } else if (downClueNum) {
            highlightClue('down', downClueNum);
            selectedDirection = 'down';
        }

        // Toggle direction if clicking the same cell twice
        if (selectedClue && 
            selectedClue.number === (selectedDirection === 'across' ? acrossClueNum : downClueNum)) {
            toggleDirection();
        }
    }

    function selectClue(direction, number) {
        clearHighlights();
        selectedDirection = direction;
        highlightClue(direction, number);

        // Also select the first cell of the clue
        for (let row = 0; row < puzzleData.size; row++) {
            for (let col = 0; col < puzzleData.size; col++) {
                if (puzzleData.gridnums[row][col] == number) {
                    selectedCell = { row, col };
                    cells[row][col].classList.add('selected');
                    cells[row][col].focus();
                    return;
                }
            }
        }
    }

    function highlightClue(direction, number) {
        // Highlight the clue in the clue list
        const clueElements = document.querySelectorAll('.clue-item');
        clueElements.forEach(el => {
            if (el.dataset.direction === direction && el.dataset.number === number) {
                el.classList.add('selected');
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                selectedClue = { direction, number };
            }
        });

        // Find all cells for this clue and highlight them
        let startCell = null;

        // Find the starting cell of the clue
        outerLoop:
        for (let row = 0; row < puzzleData.size; row++) {
            for (let col = 0; col < puzzleData.size; col++) {
                if (puzzleData.gridnums[row][col] == number) {
                    startCell = { row, col };
                    break outerLoop;
                }
            }
        }

        if (startCell) {
            if (direction === 'across') {
                for (let col = startCell.col; col < puzzleData.size; col++) {
                    if (puzzleData.grid[startCell.row][col] === '#') break;
                    cells[startCell.row][col].classList.add('highlighted');
                }
            } else { // down
                for (let row = startCell.row; row < puzzleData.size; row++) {
                    if (puzzleData.grid[row][startCell.col] === '#') break;
                    cells[row][startCell.col].classList.add('highlighted');
                }
            }
        }
    }

    function toggleDirection() {
        selectedDirection = selectedDirection === 'across' ? 'down' : 'across';
        
        // Re-highlight with new direction
        clearHighlights();
        selectCell(selectedCell.row, selectedCell.col);
    }

    function clearHighlights() {
        // Clear cell highlights
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected', 'highlighted');
        });

        // Clear clue highlights
        document.querySelectorAll('.clue-item').forEach(clue => {
            clue.classList.remove('selected');
        });
    }

    function handleKeyDown(e, row, col) {
        const key = e.key.toUpperCase();
        
        // Handle letter input
        if (/^[A-Z]$/.test(key)) {
            enterLetter(key);
            moveToNextCell();
            e.preventDefault();
        }
        // Handle backspace/delete
        else if (e.key === 'Backspace' || e.key === 'Delete') {
            userAnswers[row][col] = '';
            cells[row][col].textContent = '';
            
            // Keep the cell number if it exists
            const cellNum = puzzleData.gridnums[row][col];
            if (cellNum > 0) {
                const numSpan = document.createElement('span');
                numSpan.classList.add('cell-number');
                numSpan.textContent = cellNum;
                cells[row][col].appendChild(numSpan);
            }
            
            if (e.key === 'Backspace') {
                moveToPrevCell();
            }
            e.preventDefault();
        }
        // Handle arrow keys
        else if (e.key === 'ArrowRight') {
            moveByDirection(0, 1);
            e.preventDefault();
        }
        else if (e.key === 'ArrowLeft') {
            moveByDirection(0, -1);
            e.preventDefault();
        }
        else if (e.key === 'ArrowDown') {
            moveByDirection(1, 0);
            e.preventDefault();
        }
        else if (e.key === 'ArrowUp') {
            moveByDirection(-1, 0);
            e.preventDefault();
        }
        // Handle Tab for navigation between clues
        else if (e.key === 'Tab') {
            if (e.shiftKey) {
                selectPrevClue();
            } else {
                selectNextClue();
            }
            e.preventDefault();
        }
        // Handle space to toggle direction
        else if (e.key === ' ') {
            toggleDirection();
            e.preventDefault();
        }
    }

    function enterLetter(letter) {
        if (!selectedCell) return;
        
        const { row, col } = selectedCell;
        userAnswers[row][col] = letter;
        
        // Update cell content, preserving the cell number if it exists
        const cellNum = puzzleData.gridnums[row][col];
        
        cells[row][col].textContent = letter;
        
        if (cellNum > 0) {
            const numSpan = document.createElement('span');
            numSpan.classList.add('cell-number');
            numSpan.textContent = cellNum;
            cells[row][col].appendChild(numSpan);
        }
    }

    function moveToNextCell() {
        if (!selectedCell) return;
        
        const { row, col } = selectedCell;
        
        if (selectedDirection === 'across') {
            // Move right until we hit a black cell or the edge
            for (let c = col + 1; c < puzzleData.size; c++) {
                if (puzzleData.grid[row][c] !== '#') {
                    selectCell(row, c);
                    return;
                }
            }
        } else { // down
            // Move down until we hit a black cell or the edge
            for (let r = row + 1; r < puzzleData.size; r++) {
                if (puzzleData.grid[r][col] !== '#') {
                    selectCell(r, col);
                    return;
                }
            }
        }
    }

    function moveToPrevCell() {
        if (!selectedCell) return;
        
        const { row, col } = selectedCell;
        
        if (selectedDirection === 'across') {
            // Move left until we hit a black cell or the edge
            for (let c = col - 1; c >= 0; c--) {
                if (puzzleData.grid[row][c] !== '#') {
                    selectCell(row, c);
                    return;
                }
            }
        } else { // down
            // Move up until we hit a black cell or the edge
            for (let r = row - 1; r >= 0; r--) {
                if (puzzleData.grid[r][col] !== '#') {
                    selectCell(r, col);
                    return;
                }
            }
        }
    }

    function moveByDirection(rowDelta, colDelta) {
        if (!selectedCell) return;
        
        const { row, col } = selectedCell;
        const newRow = row + rowDelta;
        const newCol = col + colDelta;
        
        // Check if new position is within grid and not a black cell
        if (newRow >= 0 && newRow < puzzleData.size && 
            newCol >= 0 && newCol < puzzleData.size && 
            puzzleData.grid[newRow][newCol] !== '#') {
            selectCell(newRow, newCol);
        }
    }

    function selectNextClue() {
        // Get all clues in order (across then down)
        const allClues = [...document.querySelectorAll('#across-clues .clue-item'), 
                           ...document.querySelectorAll('#down-clues .clue-item')];
        
        if (!selectedClue) {
            if (allClues.length > 0) {
                const firstClue = allClues[0];
                selectClue(firstClue.dataset.direction, firstClue.dataset.number);
            }
            return;
        }
        
        // Find current clue index
        const currentIndex = allClues.findIndex(clue => 
            clue.dataset.direction === selectedClue.direction && 
            clue.dataset.number === selectedClue.number);
        
        if (currentIndex >= 0 && currentIndex < allClues.length - 1) {
            const nextClue = allClues[currentIndex + 1];
            selectClue(nextClue.dataset.direction, nextClue.dataset.number);
        }
    }

    function selectPrevClue() {
        // Get all clues in order (across then down)
        const allClues = [...document.querySelectorAll('#across-clues .clue-item'), 
                           ...document.querySelectorAll('#down-clues .clue-item')];
        
        if (!selectedClue) {
            if (allClues.length > 0) {
                const lastClue = allClues[allClues.length - 1];
                selectClue(lastClue.dataset.direction, lastClue.dataset.number);
            }
            return;
        }
        
        // Find current clue index
        const currentIndex = allClues.findIndex(clue => 
            clue.dataset.direction === selectedClue.direction && 
            clue.dataset.number === selectedClue.number);
        
        if (currentIndex > 0) {
            const prevClue = allClues[currentIndex - 1];
            selectClue(prevClue.dataset.direction, prevClue.dataset.number);
        }
    }

    function checkPuzzle() {
        let allCorrect = true;
        
        for (let row = 0; row < puzzleData.size; row++) {
            for (let col = 0; col < puzzleData.size; col++) {
                if (puzzleData.grid[row][col] === '#') continue;
                
                const userAnswer = userAnswers[row][col];
                const correctAnswer = puzzleData.solution[row][col];
                
                cells[row][col].classList.remove('correct', 'incorrect');
                
                if (userAnswer === '') {
                    allCorrect = false;
                } else if (userAnswer === correctAnswer) {
                    cells[row][col].classList.add('correct');
                } else {
                    cells[row][col].classList.add('incorrect');
                    allCorrect = false;
                }
            }
        }
        
        if (allCorrect && isPuzzleCompleted()) {
            messageEl.textContent = 'Congratulations! You solved the puzzle!';
            messageEl.classList.add('completed');
        } else {
            messageEl.textContent = 'Keep going, you\'re making progress!';
            messageEl.classList.remove('completed');
        }
        
        // Remove feedback after 3 seconds
        setTimeout(() => {
            document.querySelectorAll('.cell').forEach(cell => {
                cell.classList.remove('correct', 'incorrect');
            });
        }, 3000);
    }

    function revealPuzzle() {
        for (let row = 0; row < puzzleData.size; row++) {
            for (let col = 0; col < puzzleData.size; col++) {
                if (puzzleData.grid[row][col] === '#') continue;
                
                const correctAnswer = puzzleData.solution[row][col];
                userAnswers[row][col] = correctAnswer;
                
                cells[row][col].textContent = correctAnswer;
                
                // Preserve cell numbers
                const cellNum = puzzleData.gridnums[row][col];
                if (cellNum > 0) {
                    const numSpan = document.createElement('span');
                    numSpan.classList.add('cell-number');
                    numSpan.textContent = cellNum;
                    cells[row][col].appendChild(numSpan);
                }
            }
        }
        
        messageEl.textContent = 'Puzzle revealed. Try again from scratch!';
    }

    function resetPuzzle() {
        initUserAnswers();
        
        for (let row = 0; row < puzzleData.size; row++) {
            for (let col = 0; col < puzzleData.size; col++) {
                if (puzzleData.grid[row][col] === '#') continue;
                
                cells[row][col].textContent = '';
                cells[row][col].classList.remove('correct', 'incorrect');
                
                // Preserve cell numbers
                const cellNum = puzzleData.gridnums[row][col];
                if (cellNum > 0) {
                    const numSpan = document.createElement('span');
                    numSpan.classList.add('cell-number');
                    numSpan.textContent = cellNum;
                    cells[row][col].appendChild(numSpan);
                }
            }
        }
        
        messageEl.textContent = 'Puzzle reset. Good luck!';
        messageEl.classList.remove('completed');
    }

    function isPuzzleCompleted() {
        for (let row = 0; row < puzzleData.size; row++) {
            for (let col = 0; col < puzzleData.size; col++) {
                if (puzzleData.grid[row][col] === '#') continue;
                
                if (userAnswers[row][col] === '') {
                    return false;
                }
            }
        }
        return true;
    }

    // Set up event listeners for buttons
    checkBtn.addEventListener('click', checkPuzzle);
    revealBtn.addEventListener('click', revealPuzzle);
    resetBtn.addEventListener('click', resetPuzzle);

    // Initialize the puzzle
    fetchPuzzleData();
}); 