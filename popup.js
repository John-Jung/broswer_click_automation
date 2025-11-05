let tabCoords = {};
let isClickingAll = false;
let allTabs = [];
let clickInterval = 100; // 기본값: 100ms

console.log(`[Popup] 팝업 로드됨`);

async function initPopup() {
    allTabs = await chrome.tabs.query({url: "<all_urls>"});
    console.log(`[Popup] ✅ 탭 로드: ${allTabs.length}개`);
    
    document.getElementById('setPosition').addEventListener('click', handleSetPosition);
    document.getElementById('startAll').addEventListener('click', handleStartAll);
    document.getElementById('setInterval').addEventListener('click', handleSetInterval);
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

function handleSetInterval() {
    const input = document.getElementById('clickInterval');
    const seconds = parseFloat(input.value);
    
    if (isNaN(seconds) || seconds <= 0) {
        alert('0보다 큰 숫자를 입력하세요');
        return;
    }
    
    clickInterval = seconds * 1000; // 초를 ms로 변환
    console.log(`[Popup] 클릭 간격 설정: ${seconds}초 (${clickInterval}ms)`);
    
    // 모든 탭에 새로운 간격 전송
    chrome.runtime.sendMessage({
        action: "setClickInterval",
        interval: clickInterval
    });
    
    document.getElementById('intervalDisplay').innerText = `현재 간격: ${seconds}초 (${clickInterval}ms)`;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(`[Popup] 메시지:`, request.action);
    
    if (request.action === "updateCoords") {
        document.getElementById('coords').innerText = `[TAB ${sender.tab.id}] X: ${request.x}, Y: ${request.y}`;
    } 
    else if (request.action === "coordsSet") {
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