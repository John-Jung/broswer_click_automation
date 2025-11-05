let tabCoords = {};
let isClickingAll = false;
let allTabs = [];

console.log(`[Popup] 팝업 로드됨`);

async function initPopup() {
    allTabs = await chrome.tabs.query({url: "<all_urls>"});
    console.log(`[Popup] ✅ 탭 로드: ${allTabs.length}개`);
    
    document.getElementById('setPosition').addEventListener('click', handleSetPosition);
    document.getElementById('startAll').addEventListener('click', handleStartAll);
}

async function handleSetPosition() {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    const tab = tabs[0];
    
    console.log(`[Popup] 위치 설정 시작 - TAB ${tab.id}`);
    document.getElementById('coords').innerText = `[TAB ${tab.id}] 마우스를 움직여서 위치 설정...`;
    
    chrome.tabs.sendMessage(tab.id, {action: "startListening"});
}

async function handleStartAll() {
    console.log(`[Popup] 모든 탭 시작 버튼 클릭`);
    chrome.runtime.sendMessage({action: "escPressed"});
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(`[Popup] 메시지:`, request.action);
    
    if (request.action === "updateCoords") {
        document.getElementById('coords').innerText = `[TAB ${sender.tab.id}] X: ${request.x}, Y: ${request.y}`;
    } 
    else if (request.action === "coordsSet") {
        tabCoords[sender.tab.id] = {x: request.x, y: request.y};
        document.getElementById('coords').innerText = `[TAB ${sender.tab.id}] 확정: X: ${request.x}, Y: ${request.y}`;
    }
    else if (request.action === "statusUpdate") {
        document.getElementById('status').innerText = request.isClicking ? "🟢 클릭 중..." : "🔴 멈춤";
    }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPopup);
} else {
    initPopup();
}