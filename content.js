let targetX, targetY;
let isListeningForClick = false;
let isClicking = false;
let clickInterval = 100; // 기본값: 100ms

console.log(`[Content Script] 탭 로드됨`);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(`[Content Script] 메시지 수신:`, request.action, request);
    
    if (request.action === "startListening") {
        isListeningForClick = true;
        console.log(`[Content Script] 위치 설정 시작`);
    }
    else if (request.action === "startClicking") {
        targetX = request.coords.x;
        targetY = request.coords.y;
        clickInterval = request.interval || 100; // 간격 설정
        isClicking = true;
        console.log(`[Content Script] 🟢 클릭 시작 - X: ${targetX}, Y: ${targetY}, 간격: ${clickInterval}ms`);
    }
    else if (request.action === "stopClicking") {
        isClicking = false;
        console.log(`[Content Script] 🔴 클릭 중지`);
    }
    else if (request.action === "setClickInterval") {
        clickInterval = request.interval;
        console.log(`[Content Script] 🔧 클릭 간격 변경: ${clickInterval}ms`);
    }
});

document.addEventListener('mousemove', (e) => {
    if (isListeningForClick) {
        targetX = e.clientX;
        targetY = e.clientY;
        
        chrome.runtime.sendMessage({
            action: "updateCoords",
            x: targetX,
            y: targetY
        });
    }
});

document.addEventListener('click', (e) => {
    if (isListeningForClick) {
        isListeningForClick = false;
        console.log(`[Content Script] 좌표 확정 - X: ${targetX}, Y: ${targetY}`);
        
        chrome.runtime.sendMessage({
            action: "coordsSet",
            x: targetX,
            y: targetY
        });
    }
}, true);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        e.preventDefault();
        console.log(`[Content Script] ⚠️ ESC 눌림`);
        
        chrome.runtime.sendMessage({
            action: "escPressed"
        });
    }
}, true);

const clickLoop = () => {
    if (isClicking && targetX && targetY) {
        const el = document.elementFromPoint(targetX, targetY);
        if (el) {
            console.log(`[Content Script] 클릭 - X: ${targetX}, Y: ${targetY}`);
            el.click();
        }
    }
    setTimeout(clickLoop, clickInterval); // 동적 간격 사용
};
clickLoop();