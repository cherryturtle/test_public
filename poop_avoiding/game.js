// 게임 변수 초기화
const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// 게임 컨테이너 크기 가져오기
const containerWidth = gameContainer.offsetWidth;
const playerWidth = 30; // 플레이어 너비

// 플레이어 초기 위치 (화면 하단 가운데)
let playerPosition = (containerWidth / 2) - (playerWidth / 2);
let poops = [];
let score = 0;
let gameActive = true;
let gameSpeed = 2000; // 똥이 생성되는 간격 (밀리초)
let lastTime = 0;
let animationId;

// 플레이어 초기 위치 설정 (화면 하단 가운데)
player.style.left = playerPosition + 'px';
player.style.bottom = '10px';

// 키보드 이벤트 처리
document.addEventListener('keydown', (event) => {
    if (!gameActive) return;
    
    const playerWidth = player.offsetWidth;
    const containerWidth = gameContainer.offsetWidth;
    const moveStep = 15; // 이동 속도 조정
    
    if (event.key === 'ArrowLeft') {
        // 왼쪽 이동 (화면 밖으로 나가지 않도록)
        playerPosition = Math.max(0, playerPosition - moveStep);
    } else if (event.key === 'ArrowRight') {
        // 오른쪽 이동 (화면 밖으로 나가지 않도록)
        playerPosition = Math.min(containerWidth - playerWidth, playerPosition + moveStep);
    }
    
    player.style.left = playerPosition + 'px';
});

// 터치/마우스 이벤트 처리
gameContainer.addEventListener('touchmove', handleTouch);
gameContainer.addEventListener('mousemove', handleMouse);

function handleTouch(event) {
    if (!gameActive) return;
    event.preventDefault();
    
    const touch = event.touches[0];
    movePlayerTo(touch.clientX);
}

function handleMouse(event) {
    if (!gameActive) return;
    movePlayerTo(event.clientX);
}

function movePlayerTo(xPosition) {
    const playerWidth = player.offsetWidth;
    const containerWidth = gameContainer.offsetWidth;
    
    playerPosition = xPosition - playerWidth / 2;
    
    // 화면 경계 체크
    if (playerPosition < 0) {
        playerPosition = 0;
    } else if (playerPosition > containerWidth - playerWidth) {
        playerPosition = containerWidth - playerWidth;
    }
    
    player.style.left = playerPosition + 'px';
}

// 똥 생성 함수
function createPoop() {
    if (!gameActive) return;
    
    // div 대신 img 요소 생성
    const poop = document.createElement('img');
    poop.className = 'poop';
    poop.src = 'poop.jpg'; // poop.jpg 이미지 사용
    poop.style.width = '30px';
    poop.style.height = '30px';
    poop.style.borderRadius = '0'; // 이미지를 사용하므로 CSS 스타일 초기화
    poop.style.transform = 'none'; // 이미지를 사용하므로 회전 제거
    
    const containerWidth = gameContainer.offsetWidth;
    const poopPosition = Math.random() * (containerWidth - 30);
    
    poop.style.left = poopPosition + 'px';
    poop.style.top = '0px';
    
    gameContainer.appendChild(poop);
    poops.push({
        element: poop,
        position: poopPosition,
        top: 0,
        speed: 2 + Math.random() * 3 // 떨어지는 속도 랜덤화
    });
}

// 게임 업데이트 함수
function updateGame(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // 플레이어가 항상 보이도록 확인
    if (!player.style.display || player.style.display === 'none') {
        player.style.display = 'block';
    }
    
    // 똥 이동 및 충돌 체크
    for (let i = poops.length - 1; i >= 0; i--) {
        const poop = poops[i];
        poop.top += poop.speed * deltaTime / 16;
        poop.element.style.top = poop.top + 'px';
        
        // 화면 밖으로 나간 똥 제거
        if (poop.top > gameContainer.offsetHeight) {
            gameContainer.removeChild(poop.element);
            poops.splice(i, 1);
            score++;
            scoreElement.textContent = `점수: ${score}`;
            
            // 점수에 따라 게임 속도 증가
            if (score % 2 === 0 && gameSpeed > 300) {
                gameSpeed = Math.max(300, gameSpeed - 150);
                clearInterval(poopInterval);
                poopInterval = setInterval(createPoop, gameSpeed);
            }
        }
        
        // 충돌 감지
        if (checkCollision(poop)) {
            gameOver();
            return;
        }
    }
    
    animationId = requestAnimationFrame(updateGame);
}

// 충돌 감지 함수
function checkCollision(poop) {
    const playerRect = player.getBoundingClientRect();
    const poopRect = poop.element.getBoundingClientRect();
    
    return !(
        playerRect.right < poopRect.left + 5 ||
        playerRect.left > poopRect.right - 5 ||
        playerRect.bottom < poopRect.top + 5 ||
        playerRect.top > poopRect.bottom - 5
    );
}

// 게임 오버 함수
function gameOver() {
    gameActive = false;
    finalScoreElement.textContent = `최종 점수: ${score}`;
    gameOverElement.style.display = 'block';
    
    // 애니메이션 및 타이머 정지
    cancelAnimationFrame(animationId);
    clearInterval(poopInterval);
}

// 게임 재시작 함수
function restartGame() {
    // 기존 똥 제거
    poops.forEach(poop => {
        gameContainer.removeChild(poop.element);
    });
    poops = [];
    
    // 변수 초기화
    score = 0;
    gameActive = true;
    gameSpeed = 2000;
    lastTime = 0;
    scoreElement.textContent = `점수: ${score}`;
    gameOverElement.style.display = 'none';
    
    // 플레이어 위치 초기화 (화면 하단 가운데)
    playerPosition = (containerWidth / 2) - (playerWidth / 2);
    player.style.left = playerPosition + 'px';
    player.style.bottom = '10px';
    
    // 게임 재시작
    startGame();
}

// 게임 시작 함수
function startGame() {
    // 똥 생성 타이머 설정
    poopInterval = setInterval(createPoop, gameSpeed);
    
    // 게임 루프 시작
    animationId = requestAnimationFrame(updateGame);
}

// 재시작 버튼 이벤트
restartBtn.addEventListener('click', restartGame);

// 플레이어가 보이는지 확인
player.style.display = 'block';

// 게임 시작
startGame();