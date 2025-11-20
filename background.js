let allTabs = [];
let isClickingAll = false;
let tabCoords = {};
let clickInterval = 100;

console.log(`[Background] Service Worker 로드됨`);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(`[Background] 메시지 수신:`, request.action, `TAB ID: ${sender.tab?.id}`);
    
    if (request.action === "coordsSet") {
        tabCoords[sender.tab.id] = {x: request.x, y: request.y};
        console.log(`[Background] 좌표 저장:`, tabCoords);
    }
    else if (request.action === "escPressed") {
        console.log(`[Background] ESC 신호 수신`);
        handleEscPressed();
    }
    else if (request.action === "setClickInterval") {
        clickInterval = request.interval;
        console.log(`[Background] 🔧 클릭 간격 설정: ${clickInterval}ms`);
        broadcastClickInterval();
    }
});

async function broadcastClickInterval() {
    const tabs = await chrome.tabs.query({url: "<all_urls>"});
    
    tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
            action: "setClickInterval",
            interval: clickInterval
        }).catch(err => console.log(`[Background] 탭 ${tab.id}:`, err));
    });
}

async function handleEscPressed() {
    isClickingAll = !isClickingAll;
    
    const tabs = await chrome.tabs.query({url: "<all_urls>"});
    console.log(`[Background] 🔄 상태 변경: ${isClickingAll ? '시작' : '중지'}`);
    console.log(`[Background] 📋 활성 탭: ${tabs.length}개`, tabs.map(t => t.id));
    console.log(`[Background] ⏱️ 클릭 간격: ${clickInterval}ms`);
    
    tabs.forEach(tab => {
        if (isClickingAll && tabCoords[tab.id]) {
            console.log(`[Background] ✅ 탭 ${tab.id}에 시작 명령 - 좌표: ${tabCoords[tab.id].x}, ${tabCoords[tab.id].y}`);
            chrome.tabs.sendMessage(tab.id, {
                action: "startClicking",
                coords: tabCoords[tab.id],
                interval: clickInterval
            }).catch(err => console.log(`[Background] ❌ 탭 ${tab.id}:`, err));
        } else if (!isClickingAll) {
            console.log(`[Background] 🛑 탭 ${tab.id}에 중지 명령`);
            chrome.tabs.sendMessage(tab.id, {
                action: "stopClicking"
            }).catch(err => console.log(`[Background] ❌ 탭 ${tab.id}:`, err));
        }
    });
    
    chrome.runtime.sendMessage({
        action: "statusUpdate",
        isClicking: isClickingAll
    }).catch(() => {});
}
