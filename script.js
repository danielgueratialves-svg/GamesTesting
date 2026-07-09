const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const startBtn = document.getElementById("startBtn");
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");

// Configurações da Barra (Paddle)
const paddle = {
    height: 12,
    width: 90,
    x: (canvas.width - 90) / 2,
    color: "#39ff14"
};

// Configurações da Bola
const ball = {
    radius: 7,
    x: canvas.width / 2,
    y: canvas.height - 30,
    dx: 4,
    dy: -4,
    color: "#fff",
    speed: 5
};

// Configurações dos Blocos (Bricks)
const brickRowCount = 5;
const brickColumnCount = 7;
const brickWidth = 72;
const brickHeight = 22;
const brickPadding = 7;
const brickOffsetTop = 40;
const brickOffsetLeft = 30;

// Cores das linhas de blocos
const brickColors = ["#ff007f", "#ff00ff", "#7000ff", "#00ffff", "#39ff14"];

let bricks = [];
let score = 0;
let lives = 3;
let gameRunning = false;

function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1, color: brickColors[r] };
        }
    }
}

// Atualiza a posição com o movimento do rato
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    paddle.x = e.clientX - rect.left - paddle.width / 2;
    
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x > canvas.width - paddle.width) paddle.x = canvas.width - paddle.width;
});

// Suporte para touch screen
canvas.addEventListener("touchmove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    paddle.x = touch.clientX - rect.left - paddle.width / 2;
    
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x > canvas.width - paddle.width) paddle.x = canvas.width - paddle.width;
    e.preventDefault();
}, { passive: false });

startBtn.addEventListener("click", startGame);

function startGame() {
    score = 0;
    lives = 3;
    ball.speed = 5.5;
    resetBallAndPaddle();
    initBricks();
    
    scoreElement.innerText = `PONTOS: ${score}`;
    livesElement.innerText = `VIDAS: ${lives}`;
    overlay.style.display = "none";
    gameRunning = true;
    loop();
}

function resetBallAndPaddle() {
    paddle.x = (canvas.width - paddle.width) / 2;
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 40;
    ball.dx = (Math.random() * 4 - 2) || 2; 
    ball.dy = -ball.speed;
}

function collisionDetection() {
    let allDestroyed = true;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                allDestroyed = false;
                if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score += 10;
                    scoreElement.innerText = `PONTOS: ${score}`;
                    ball.speed += 0.1; // Aceleração gradual
                }
            }
        }
    }
    
    if (allDestroyed && gameRunning) {
        gameRunning = false;
        overlayTitle.innerText = "Você Venceu! 🎉";
        startBtn.innerText = "Jogar de Novo";
        overlay.style.display = "flex";
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#fff";
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.height - 10, paddle.width, paddle.height);
    ctx.fillStyle = paddle.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = paddle.color;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = bricks[c][r].color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function loop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    } 
    else if (ball.y + ball.dy > canvas.height - ball.radius - 10) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            // Altera o ângulo de retorno baseado em onde a bola toca na barra
            let collidePoint = ball.x - (paddle.x + paddle.width / 2);
            collidePoint = collidePoint / (paddle.width / 2);
            let angle = collidePoint * (Math.PI / 3); 
            
            ball.dx = ball.speed * Math.sin(angle);
            ball.dy = -ball.speed * Math.cos(angle);
        } else {
            lives--;
            livesElement.innerText = `VIDAS: ${lives}`;
            
            if (lives === 0) {
                gameRunning = false;
                overlayTitle.innerText = "Fim de Jogo 💀";
                startBtn.innerText = "Tentar Novamente";
                overlay.style.display = "flex";
                return;
            } else {
                resetBallAndPaddle();
            }
        }
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    requestAnimationFrame(loop);
}
