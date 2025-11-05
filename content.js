let isListeningForClick = false;
let targetX, targetY;
let isClicking = false;

// popup에서 메시지 받기
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startListening") {
        isListeningForClick = true;
    } else if (request.action === "stopListening") {
        isListeningForClick = false;
    }
});

// 웹페이지 전체에서 마우스 움직임 감지
document.addEventListener('mousemove', (e) => {
    if (isListeningForClick) {
        targetX = e.clientX;
        targetY = e.clientY;
        
        // popup에 좌표 전송
        chrome.runtime.sendMessage({
            action: "updateCoords",
            x: targetX,
            y: targetY
        });
    }
});

// 클릭하면 좌표 고정
document.addEventListener('click', (e) => {
    if (isListeningForClick) {
        isListeningForClick = false;
        chrome.runtime.sendMessage({
            action: "coordsSet",
            x: targetX,
            y: targetY
        });
    }
}, true);

// ESC 키로 반복 클릭 시작/중지
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        e.preventDefault();
        isClicking = !isClicking;
        
        chrome.runtime.sendMessage({
            action: "toggleClicking",
            isClicking: isClicking
        });
    }
});

// 반복 클릭 루프
const clickLoop = () => {
    if (isClicking && targetX && targetY) {
        const el = document.elementFromPoint(targetX, targetY);
        if (el) el.click();
    }
    setTimeout(clickLoop, 100);
};
clickLoop();