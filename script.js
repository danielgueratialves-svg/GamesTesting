const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("startBtn");
const scoreElement = document.getElementById("score");
const highscoreElement = document.getElementById("highscore");

// Configurações do Jogador (Nave)
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 60,
    width: 40,
    height: 40,
    color: "#00fff2",
    shadowColor: "#00fff2"
};

// Estado do Jogo
let enemies = [];
let score = 0;
let highScore = localStorage.getItem("cyberDodgeHighScore") || 0;
let gameRunning = false;
let enemySpawnRate = 20; // Quanto menor, mais rápido nascem inimigos
let frameCount = 0;
let gameSpeed = 4; // Velocidade inicial dos inimigos

highscoreElement.innerText = `RECORDE: ${highScore}`;

// Atualiza a posição da nave com o movimento do mouse
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    player.x = e.clientX - rect.left - player.width / 2;

    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
});

// Suporte para telas de toque (Celular)
canvas.addEventListener("touchmove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    player.x = touch.clientX - rect.left - player.width / 2;
    
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    e.preventDefault();
}, { passive: false });

startBtn.addEventListener("click", startGame);

function startGame() {
    enemies = [];
    score = 0;
    gameSpeed = 4;
    enemySpawnRate = 20;
    frameCount = 0;
    scoreElement.innerText = `PONTOS: ${score}`;
    overlay.style.display = "none";
    gameRunning = true;
    loop();
}

function spawnEnemy() {
    const size = Math.floor(Math.random() * 35) + 15;
    const x = Math.random() * (canvas.width - size);
    enemies.push({
        x: x,
        y: -size,
        width: size,
        height: size,
        speed: gameSpeed + Math.random() * 2
    });
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function gameOver() {
    gameRunning = false;
    overlay.style.display = "flex";
    startBtn.innerText = "Jogar Novamente";
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("cyberDodgeHighScore", highScore);
        highscoreElement.innerText = `RECORDE: ${highScore}`;
    }
}

function loop() {
    if (!gameRunning) return;

    ctx.fillStyle = "rgba(5, 5, 10, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    frameCount++;

    if (frameCount % enemySpawnRate === 0) {
        spawnEnemy();
    }

    if (frameCount % 500 === 0) {
        gameSpeed += 0.5;
        if (enemySpawnRate > 8) enemySpawnRate -= 2;
    }

    ctx.shadowBlur = 15;
    ctx.shadowColor = player.shadowColor;
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.shadowBlur = 0;

    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        e.y += e.speed;

        ctx.fillStyle = "#ff007f";
        ctx.fillRect(e.x, e.y, e.width, e.height);

        if (checkCollision(player, e)) {
            gameOver();
            return;
        }

        if (e.y > canvas.height) {
            enemies.splice(i, 1);
            score += 1;
            scoreElement.innerText = `PONTOS: ${score}`;
        }
    }

    requestAnimationFrame(loop);
}
