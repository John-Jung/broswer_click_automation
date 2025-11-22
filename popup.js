// 언어 설정
const translations = {
    ko: {
        title: "Clicktomate",
        coordinateSection: "좌표 설정",
        setBtnText: "위치 설정 (현재 탭)",
        coordStatusLabel: "상태",
        coordWaiting: "설정 대기 중",
        intervalSection: "클릭 간격",
        intervalLabel: "초 단위",
        setIntervalBtnText: "설정",
        controlSection: "제어",
        startAllBtnText: "모든 탭에서 시작",
        modeLabel: "상태",
        stopped: "멈춤",
        clicking: "클릭 중...",
        tipText: "💡 팁: 어느 탭에서나 <strong>ESC</strong> 키를 눌러 모든 탭의 클릭을 시작/중지할 수 있습니다.",
        coordSet: "확정: X:",
        currentInterval: "현재:",
        ms: "ms"
    },
    en: {
        title: "Clicktomate",
        coordinateSection: "COORDINATES",
        setBtnText: "Set Position (Current Tab)",
        coordStatusLabel: "STATUS",
        coordWaiting: "Waiting for setup",
        intervalSection: "CLICK INTERVAL",
        intervalLabel: "Seconds",
        setIntervalBtnText: "Set",
        controlSection: "CONTROL",
        startAllBtnText: "Start All Tabs",
        modeLabel: "STATUS",
        stopped: "Stopped",
        clicking: "Clicking...",
        tipText: "💡 Tip: Press <strong>ESC</strong> from any tab to start/stop clicking on all tabs.",
        coordSet: "Set: X:",
        currentInterval: "Current:",
        ms: "ms"
    },
    zh: {
        title: "Clicktomate",
        coordinateSection: "坐标设置",
        setBtnText: "设置位置 (当前选项卡)",
        coordStatusLabel: "状态",
        coordWaiting: "等待设置",
        intervalSection: "点击间隔",
        intervalLabel: "秒",
        setIntervalBtnText: "设置",
        controlSection: "控制",
        startAllBtnText: "开始所有选项卡",
        modeLabel: "状态",
        stopped: "已停止",
        clicking: "点击中...",
        tipText: "💡 提示: 从任何选项卡按 <strong>ESC</strong> 键启动/停止所有选项卡上的点击。",
        coordSet: "设置: X:",
        currentInterval: "当前:",
        ms: "毫秒"
    },
    ja: {
        title: "Clicktomate",
        coordinateSection: "座標設定",
        setBtnText: "位置を設定 (現在のタブ)",
        coordStatusLabel: "ステータス",
        coordWaiting: "セットアップ待機中",
        intervalSection: "クリック間隔",
        intervalLabel: "秒",
        setIntervalBtnText: "設定",
        controlSection: "コントロール",
        startAllBtnText: "すべてのタブを開始",
        modeLabel: "ステータス",
        stopped: "停止中",
        clicking: "クリック中...",
        tipText: "💡 ヒント: 任意のタブから <strong>ESC</strong> キーを押して、すべてのタブでのクリックを開始/停止できます。",
        coordSet: "設定: X:",
        currentInterval: "現在:",
        ms: "ミリ秒"
    }
};

let currentLang = 'ko';
let tabCoords = {};
let isListeningForClick = false;
let currentTab = null;
let isClickingAll = false;
let allTabs = [];
let clickInterval = 100;

// 초기화
async function initPopup() {
    // 저장된 언어 로드
    const savedLang = await chrome.storage.local.get('language');
    currentLang = savedLang.language || 'ko';
    setLanguage(currentLang);

    const setPositionBtn = document.getElementById('setPosition');
    const startAllBtn = document.getElementById('startAll');
    const setIntervalBtn = document.getElementById('setInterval');
    
    if (!setPositionBtn || !startAllBtn) {
        console.error(`[Popup] 요소를 찾을 수 없습니다!`);
        return;
    }
    
    console.log(`[Popup] 팝업 초기화됨`);
    
    allTabs = await chrome.tabs.query({url: "<all_urls>"});
    console.log(`[Popup] 모든 탭: ${allTabs.length}개`);
    
    setPositionBtn.addEventListener('click', handleSetPosition);
    startAllBtn.addEventListener('click', handleStartAll);
    setIntervalBtn.addEventListener('click', handleSetInterval);

    // 언어 토글
    document.getElementById('langKo').addEventListener('click', () => setLanguage('ko'));
    document.getElementById('langEn').addEventListener('click', () => setLanguage('en'));
    document.getElementById('langZh').addEventListener('click', () => setLanguage('zh'));
    document.getElementById('langJa').addEventListener('click', () => setLanguage('ja'));
}

// 언어 설정
function setLanguage(lang) {
    currentLang = lang;
    chrome.storage.local.set({ language: lang });
    
    // UI 업데이트
    document.getElementById('title').textContent = translations[lang].title;
    document.getElementById('coordinateSection').textContent = translations[lang].coordinateSection;
    document.getElementById('setBtnText').textContent = translations[lang].setBtnText;
    document.getElementById('coordStatusLabel').textContent = translations[lang].coordStatusLabel;
    document.getElementById('intervalSection').textContent = translations[lang].intervalSection;
    document.getElementById('intervalLabel').textContent = translations[lang].intervalLabel;
    document.getElementById('setIntervalBtnText').textContent = translations[lang].setIntervalBtnText;
    document.getElementById('controlSection').textContent = translations[lang].controlSection;
    document.getElementById('startAllBtnText').textContent = translations[lang].startAllBtnText;
    document.getElementById('modeLabel').textContent = translations[lang].modeLabel;
    document.getElementById('tipText').innerHTML = translations[lang].tipText;
    
    // 현재 상태에 맞게 좌표 표시 업데이트
    const currentCoordText = document.getElementById('coords').textContent;
    if (currentCoordText === '설정 대기 중' || currentCoordText === 'Waiting for setup' || 
        currentCoordText === '等待设置' || currentCoordText === 'セットアップ待機中') {
        document.getElementById('coords').textContent = translations[lang].coordWaiting;
    }
    
    // 언어 버튼 활성화 표시
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    if (lang === 'ko') {
        document.getElementById('langKo').classList.add('active');
    } else if (lang === 'en') {
        document.getElementById('langEn').classList.add('active');
    } else if (lang === 'zh') {
        document.getElementById('langZh').classList.add('active');
    } else if (lang === 'ja') {
        document.getElementById('langJa').classList.add('active');
    }
    
    // 현재 상태 다시 표시
    updateStatusDisplay();
    updateIntervalDisplay();
}

async function getCurrentTab() {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    return tabs[0];
}

async function handleSetPosition() {
    const tab = await getCurrentTab();
    currentTab = tab.id;
    
    console.log(`[Popup] 위치 설정 시작 - TAB ${tab.id}`);
    
    // ✅ 특수 페이지 확인
    if (
    tab.url.startsWith("chrome://") ||
    tab.url.startsWith("edge://") ||
    tab.url.startsWith("about:") ||
    tab.url.startsWith("chrome-extension://") ||
    tab.url.includes("chrome.google.com/webstore")
    )  {
            alert(currentLang === 'ko' ? 
                '일반 웹사이트에서만 사용 가능합니다. (Google, GitHub 등)' : 
                'Only works on regular websites (Google, GitHub, etc)');
            return;
        }
    
    isListeningForClick = true;
    updateCoordinatesDisplay(`[TAB ${tab.id}] ${currentLang === 'ko' ? '마우스를 움직여서 위치 설정...' : 'Move mouse to set position...'}`);
    
    // ✅ 에러 처리 개선
    try {
        await chrome.tabs.sendMessage(tab.id, {action: "startListening"});
        console.log(`[Popup] 메시지 전송 성공`);
        
        // 1000ms 후 팝업 닫기 (content script 로드 보장)
        setTimeout(() => {
            window.close();
        }, 1000);
    } catch (err) {
        console.error(`[Popup] Content script 로드 실패:`, err);
        alert(currentLang === 'ko' ? 
            '이 페이지에서는 작동하지 않습니다. 다른 웹사이트를 시도해주세요.' : 
            'This page is not supported. Try another website.');
        isListeningForClick = false;
    }
}

async function handleStartAll() {
    console.log(`[Popup] 모든 탭 시작 버튼 클릭`);
    chrome.runtime.sendMessage({action: "escPressed"});
}

function handleSetInterval() {
    const input = document.getElementById('clickInterval');
    const seconds = parseFloat(input.value);
    
    if (isNaN(seconds) || seconds <= 0) {
        alert(currentLang === 'ko' ? '0보다 큰 숫자를 입력하세요' : 'Please enter a number greater than 0');
        return;
    }
    
    clickInterval = seconds * 1000;
    console.log(`[Popup] 클릭 간격 설정: ${seconds}초 (${clickInterval}ms)`);
    
    chrome.runtime.sendMessage({
        action: "setClickInterval",
        interval: clickInterval
    });
    
    updateIntervalDisplay();
}

function updateCoordinatesDisplay(text) {
    document.getElementById('coords').textContent = text;
}

function updateIntervalDisplay() {
    const seconds = clickInterval / 1000;
    const t = translations[currentLang];
    document.getElementById('intervalDisplay').textContent = 
        `${t.currentInterval} ${seconds}${t.intervalLabel === '초 단위' ? '초' : 's'} (${clickInterval}ms)`;
}

function updateStatusDisplay() {
    const t = translations[currentLang];
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    if (isClickingAll) {
        statusDot.classList.add('active');
        statusText.textContent = t.clicking;
    } else {
        statusDot.classList.remove('active');
        statusText.textContent = t.stopped;
    }
}

// Service Worker에서 메시지 받기
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(`[Popup] 메시지:`, request.action);
    
    if (request.action === "updateCoords") {
        const t = translations[currentLang];
        updateCoordinatesDisplay(`[TAB ${sender.tab.id}] X: ${request.x}, Y: ${request.y}`);
    } 
    else if (request.action === "coordsSet") {
        const t = translations[currentLang];
        updateCoordinatesDisplay(`[TAB ${sender.tab.id}] ${t.coordSet} ${request.x}, Y: ${request.y}`);
    }
    else if (request.action === "statusUpdate") {
        isClickingAll = request.isClicking;
        updateStatusDisplay();
    }
});

// DOM 준비 확인
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPopup);
} else {
    initPopup();
}
