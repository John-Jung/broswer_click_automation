let targetX, targetY;
let isListeningForClick = false;
let isClicking = false;

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
        isClicking = true;
        console.log(`[Content Script] 🟢 클릭 시작 - X: ${targetX}, Y: ${targetY}`);
    }
    else if (request.action === "stopClicking") {
        isClicking = false;
        console.log(`[Content Script] 🔴 클릭 중지`);
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

// ESC를 Service Worker로 전송
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        e.preventDefault();
        console.log(`[Content Script] ⚠️ ESC 눌림`);
        
        // Service Worker로 전송 (Popup 아니라!)
        chrome.runtime.sendMessage({
            action: "escPressed"
        });
    }
}, true);

const clickLoop = () => {
    if (isClicking && targetX && targetY) {
        const el = document.elementFromPoint(targetX, targetY);
        if (el) {
            el.click();
        }
    }
    setTimeout(clickLoop, 100);
};
clickLoop();