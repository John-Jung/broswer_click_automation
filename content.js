let targetX, targetY;
let isListeningForClick = false;
let isClicking = false;
let clickInterval = 100;

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
        clickInterval = request.interval || 100;
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
         // ✅ 사용자에게 피드백 (선택)
        console.log(`✅ 좌표 설정 완료: X: ${targetX}, Y: ${targetY}`);
        console.log(`💡 이제 ESC를 눌러서 클릭을 시작하세요!`);
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
        try {
            const el = document.elementFromPoint(targetX, targetY);
            
            if (el) {
                // 방법 1: 요소가 .click() 메서드를 지원하는지 확인
                if (typeof el.click === 'function') {
                    console.log(`[Content Script] 클릭 - X: ${targetX}, Y: ${targetY}`);
                    el.click();
                } else {
                    // 방법 2: 클릭 불가능한 요소에 MouseEvent 생성
                    const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        clientX: targetX,
                        clientY: targetY
                    });
                    el.dispatchEvent(clickEvent);
                    console.log(`[Content Script] MouseEvent 발생 - X: ${targetX}, Y: ${targetY}`);
                }
            } else {
                console.warn(`[Content Script] ⚠️ 해당 좌표에 요소 없음 - X: ${targetX}, Y: ${targetY}`);
            }
        } catch (err) {
            console.error(`[Content Script] ❌ 클릭 오류:`, err.message);
        }
    }
    setTimeout(clickLoop, clickInterval);
};
clickLoop();
