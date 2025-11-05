let allTabs = [];
let isClickingAll = false;
let tabCoords = {};

console.log(`[Background] Service Worker 로드됨`);

// 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(`[Background] 메시지 수신:`, request.action, `TAB ID: ${sender.tab?.id}`);
    
    if (request.action === "coordsSet") {
        // Content Script에서 좌표 저장
        tabCoords[sender.tab.id] = {x: request.x, y: request.y};
        console.log(`[Background] 좌표 저장:`, tabCoords);
    }
    else if (request.action === "escPressed") {
        // ESC 신호 받음 → 모든 탭에 전파
        console.log(`[Background] ESC 신호 수신`);
        handleEscPressed();
    }
});

async function handleEscPressed() {
    isClickingAll = !isClickingAll;
    
    const tabs = await chrome.tabs.query({url: "<all_urls>"});
    console.log(`[Background] 🔄 상태 변경: ${isClickingAll ? '시작' : '중지'}`);
    console.log(`[Background] 📋 활성 탭: ${tabs.length}개`, tabs.map(t => t.id));
    
    tabs.forEach(tab => {
        if (isClickingAll && tabCoords[tab.id]) {
            console.log(`[Background] ✅ 탭 ${tab.id}에 시작 명령 - 좌표: ${tabCoords[tab.id].x}, ${tabCoords[tab.id].y}`);
            chrome.tabs.sendMessage(tab.id, {
                action: "startClicking",
                coords: tabCoords[tab.id]
            }).catch(err => console.log(`[Background] ❌ 탭 ${tab.id}:`, err));
        } else if (!isClickingAll) {
            console.log(`[Background] 🛑 탭 ${tab.id}에 중지 명령`);
            chrome.tabs.sendMessage(tab.id, {
                action: "stopClicking"
            }).catch(err => console.log(`[Background] ❌ 탭 ${tab.id}:`, err));
        }
    });
    
    // Popup에 상태 알림
    chrome.runtime.sendMessage({
        action: "statusUpdate",
        isClicking: isClickingAll
    }).catch(() => {}); // Popup이 닫혀있을 수도 있음
}