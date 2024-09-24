document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const squareSize = 100; // Tamanho de cada quadrado em pixels

    // Função para calcular a porcentagem dinâmica
    function calculateDynamicPercentage(screenWidth) {
        if (screenWidth < 600) {
            return 0.7; // 70% para telas muito pequenas
        }
        if (screenWidth < 1024) {
            return 0.6; // 60% para telas pequenas
        }
        if (screenWidth < 1440) {
            return 0.6; // 60% para telas médias
        }
        return 0.5; // 50% para telas grandes
    }

    function createGrid() {
        // Limpa o container
        gridContainer.innerHTML = '';

        // Calcula a largura disponível usando a porcentagem dinâmica
        const percentage = calculateDynamicPercentage(window.innerWidth);
        const availableWidth = window.innerWidth * percentage;

        // Calcula o número de colunas e linhas baseado no tamanho da tela
        const columns = Math.floor(availableWidth / squareSize);
        const rows = Math.ceil(window.innerHeight / squareSize);

        // Define o número de colunas e linhas no grid
        gridContainer.style.gridTemplateColumns = `repeat(${columns}, ${squareSize}px)`;
        gridContainer.style.gridTemplateRows = `repeat(${rows}, ${squareSize}px)`;

        // Cria os quadrados
        for (let i = 0; i < rows * columns; i++) {
            const square = document.createElement('div');
            square.className = 'square';
            
            if (Math.random() < 0.5) { // 50% de chance de ser preenchido
                square.classList.add('filled');
            }
            
            gridContainer.appendChild(square);
        }
    }

    // Cria a grade inicial
    createGrid();

    // Recria a grade quando a janela é redimensionada
    window.addEventListener('resize', createGrid);
});