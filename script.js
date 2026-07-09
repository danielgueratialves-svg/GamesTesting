const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const startBtn = document.getElementById("startBtn");
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");

// Configurações do Jogador
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 25,
    speed: 5,
    color: "#00ffff"
};

// Configurações da Moeda
const coin = {
    x: 0,
    y: 0,
    size: 12,
    color: "#ffd700"
};

let score = 0;
let timeLeft = 10;
let gameRunning = false;
let keys = {};
let gameCountdown;

// Captura de teclado
window.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

startBtn.addEventListener("click", startGame);

function startGame() {
    score = 0;
    timeLeft = 10;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    spawnCoin();
    
    scoreElement.innerText = `MOEDAS: ${score}`;
    timerElement.innerText = `TEMPO: ${timeLeft}s`;
    overlay.style.display = "none";
    gameRunning = true;

    // Cronómetro do jogo
    clearInterval(gameCountdown);
    gameCountdown = setInterval(() => {
        if (gameRunning) {
            timeLeft--;
            timerElement.innerText = `TEMPO: ${timeLeft}s`;
            
            if (timeLeft <= 0) {
                gameOver();
            }
        }
    }, 1000);

    loop();
}

function spawnCoin() {
    coin.x = Math.random() * (canvas.width - coin.size * 2) + coin.size;
    coin.y = Math.random() * (canvas.height - coin.size * 2) + coin.size;
}

function updateMovement() {
    if (keys["arrowup"] || keys["w"]) player.y -= player.speed;
    if (keys["arrowdown"] || keys["s"]) player.y += player.speed;
    if (keys["arrowleft"] || keys["a"]) player.x -= player.speed;
    if (keys["arrowright"] || keys["d"]) player.x += player.speed;

    // Colisão com as bordas do cenário
    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x > canvas.width - player.size) player.x = canvas.width - player.size;
    if (player.y > canvas.height - player.size) player.y = canvas.height - player.size;
}

function checkCoinCollision() {
    // Verificação simples de colisão (caixa de colisão do jogador vs centro da moeda)
    if (coin.x > player.x && coin.x < player.x + player.size &&
        coin.y > player.y && coin.y < player.y + player.size) {
        
        score++;
        timeLeft += 2; // Dá mais 2 segundos de bónus
        scoreElement.innerText = `MOEDAS: ${score}`;
        timerElement.innerText = `TEMPO: ${timeLeft}s`;
        spawnCoin();
    }
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameCountdown);
    overlayTitle.innerText = `Fim de Tempo! Moedas: ${score}`;
    startBtn.innerText = `Jogar de Novo`;
    overlay.style.display = "flex";
}

function loop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateMovement();
    checkCoinCollision();

    // Desenhar a Moeda com brilho
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.size, 0, Math.PI * 2);
    ctx.fillStyle = coin.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = coin.color;
    ctx.fill();
    ctx.closePath();

    // Desenhar o Jogador
    ctx.fillStyle = player.color;
    ctx.shadowColor = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);
    ctx.shadowBlur = 0; // reset do blur

    requestAnimationFrame(loop);
}
