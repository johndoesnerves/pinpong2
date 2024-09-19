const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvasサイズ設定
canvas.width = 800;
canvas.height = 600;

// ゲームオーバー要素
const gameOverEl = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');

// ゲームオブジェクト
let player, enemy, ball, blocks, keys, gameOver;

// 初期化関数
function init() {
    player = {
        x: canvas.width / 2 - 50,
        y: canvas.height - 30,
        width: 100,
        height: 10,
        color: '#00FF00',
        speed: 7,
        dx: 0
    };

    enemy = {
        x: Math.random() * (canvas.width - 100),
        y: Math.random() * (canvas.height / 2),
        width: 100,
        height: 10,
        color: '#FF0000',
        speed: 3,
        dx: 3
    };

    ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 7,
        speed: 5,
        dx: 5 * (Math.random() < 0.5 ? 1 : -1),
        dy: -5
    };

    blocks = [];
    const blockCount = Math.floor(Math.random() * 6) + 15; // 15〜20個
    for (let i = 0; i < blockCount; i++) {
        const blockWidth = 60;
        const blockHeight = 20;
        const blockX = Math.random() * (canvas.width - blockWidth);
        const blockY = Math.random() * (canvas.height / 2 - blockHeight);
        blocks.push({
            x: blockX,
            y: blockY,
            width: blockWidth,
            height: blockHeight,
            color: '#FFFFFF'
        });
    }

    keys = {};
    gameOver = false;
    gameOverEl.classList.add('hidden');

    // イベントリスナー
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
}

// キーボード入力処理
function keyDown(e) {
    keys[e.key] = true;
}

function keyUp(e) {
    keys[e.key] = false;
}

// 更新関数
function update() {
    // プレイヤーの移動
    if (keys['ArrowLeft'] && player.x > 0) {
        player.dx = -player.speed;
    } else if (keys['ArrowRight'] && player.x + player.width < canvas.width) {
        player.dx = player.speed;
    } else {
        player.dx = 0;
    }
    player.x += player.dx;

    // 敵の移動（ランダムな動き）
    if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
        enemy.dx *= -1;
    }
    enemy.x += enemy.dx;

    // ボールの移動
    ball.x += ball.dx;
    ball.y += ball.dy;

    // 壁との衝突
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx *= -1;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    // ラケットとの衝突
    if (collision(ball, player)) {
        ball.dy = -ball.speed;
        ball.y = player.y - ball.radius;
    }

    if (collision(ball, enemy)) {
        ball.dy = ball.speed;
        ball.y = enemy.y + enemy.height + ball.radius;
    }

    // ボールが画面下に落ちた場合
    if (ball.y + ball.radius > canvas.height) {
        endGame(false);
    }

    // ブロックとの衝突
    for (let i = 0; i < blocks.length; i++) {
        if (collision(ball, blocks[i])) {
            ball.dy *= -1;
            blocks.splice(i, 1);
            break;
        }
    }

    // 敵ラケットとの干渉
    if (collision(enemy, player)) {
        // 追加のロジックが必要ならここに
    }

    // 全てのブロックを消した場合
    if (blocks.length === 0) {
        endGame(true);
    }
}

// 描画関数
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // プレイヤー
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // 敵
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

    // ボール
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.closePath();

    // ブロック
    blocks.forEach(block => {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.width, block.height);
    });
}

// ゲームループ
function loop() {
    if (!gameOver) {
        requestAnimationFrame(loop);
        update();
        draw();
    }
}

// 衝突判定関数（矩形と円、または矩形同士）
function collision(obj1, obj2) {
    // ボールと矩形の衝突
    if (obj1.radius && obj2.width) {
        // 最近点を求める
        let closestX = clamp(obj1.x, obj2.x, obj2.x + obj2.width);
        let closestY = clamp(obj1.y, obj2.y, obj2.y + obj2.height);

        // 距離を計算
        let distanceX = obj1.x - closestX;
        let distanceY = obj1.y - closestY;

        let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
        return distanceSquared < (obj1.radius * obj1.radius);
    }

    // 矩形同士の衝突
    if (obj1.width && obj2.width) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    return false;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// ゲーム終了処理
function endGame(won) {
    gameOver = true;
    gameOverEl.classList.remove('hidden');
    gameOverEl.querySelector('h1').textContent = won ? 'ゲームクリア！' : 'ゲームオーバー';
}

// 再スタートボタン
restartBtn.addEventListener('click', () => {
    init();
    loop();
});

// 初期化と開始
init();
loop();
