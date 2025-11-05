let targetX, targetY;

// "위치 설정" 버튼 클릭
document.getElementById('setPosition').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: "startListening"});
        document.getElementById('coords').innerText = "마우스를 움직여서 위치 설정...";
    });
});

// content script에서 좌표 업데이트 받기
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateCoords") {
        document.getElementById('coords').innerText = `X: ${request.x}, Y: ${request.y}`;
    } else if (request.action === "coordsSet") {
        document.getElementById('coords').innerText = `확정: X: ${request.x}, Y: ${request.y}`;
        targetX = request.x;
        targetY = request.y;
    } else if (request.action === "toggleClicking") {
        document.getElementById('status').innerText = request.isClicking ? "클릭 중..." : "멈춤";
    }
});