let socket;
let bookData; // 保存從 CSV 中讀取的書本資訊

// 初始化 WebSocket 連接
function initWebSocket() {
    socket = new WebSocket('ws://your-esp32-ip:your-esp32-port');

    // WebSocket 連接成功時的處理
    socket.addEventListener('open', (event) => {
        console.log('WebSocket 連接成功');
    });

    // WebSocket 收到消息時的處理
    socket.addEventListener('message', (event) => {
        handleWebSocketMessage(event.data);
    });

    // WebSocket 連接關閉時的處理
    socket.addEventListener('close', (event) => {
        console.log('WebSocket 連接關閉');
    });

    // WebSocket 連接發生錯誤時的處理
    socket.addEventListener('error', (event) => {
        console.error('WebSocket 連接錯誤');
    });
}

// 定義處理 WebSocket 消息的函數
function handleWebSocketMessage(message) {
    // 在這裡處理從 ESP32 收到的消息
    // 這裡只是一個簡單的範例，你需要根據實際情況進行處理
    console.log('Received message:', message);
    const resultElement = document.getElementById('result');
    resultElement.innerText = message;
}

// 初始化 WebSocket 連接
initWebSocket();

// 載入 CSV 文件
function loadCSV() {
    Papa.parse('your-book-data.csv', {
        download: true,
        header: true,
        complete: function (results) {
            // CSV 解析完成時的處理
            bookData = results.data;
            console.log('CSV 載入完成', bookData);
        },
    });
}

// 設定按鈕事件
function setupButtonEvent(bookId, buttonId) {
    const button = document.getElementById(buttonId);

    // 設定按鈕點擊事件
    button.onclick = function () {
        // 將按鈕的 ID 發送到 ESP32
        sendButtonIdToESP32(buttonId);
    };
}

// 載入 CSV 文件
loadCSV();

// 設定每隔一分鐘執行一次獲取書籍資訊的函數
setInterval(() => {
    for (let i = 1; i <= 10; i++) {
        const bookId = i;
        const buttonId = `bookButton${i}`;
        // 設定按鈕事件
        setupButtonEvent(bookId, buttonId);
    }
}, 60000);

// 在頁面載入時立即執行一次
window.onload = () => {
    for (let i = 1; i <= 10; i++) {
        const bookId = i;
        const buttonId = `bookButton${i}`;
        // 設定按鈕事件
        setupButtonEvent(bookId, buttonId);
    }
};

// 將按鈕的 ID 發送到 ESP32
function sendButtonIdToESP32(buttonId) {
    const bookName = getBookNameFromButtonId(buttonId);
    const bookShelf = getBookShelfFromBookName(bookName);

    if (socket.readyState === WebSocket.OPEN) {
        // 發送書櫃位置到 ESP32
        socket.send(`Book ${bookName} is on Shelf ${bookShelf}`);
        
        // 更新網頁中的結果顯示
        const resultElement = document.getElementById('result');
        resultElement.innerText = `Book ${bookName} is on Shelf ${bookShelf}`;
    }
}


// 從按鈕的 ID 中獲取書本名稱
function getBookNameFromButtonId(buttonId) {
    // 假設按鈕的 ID 格式為 "bookButtonX"，其中 X 為書本編號
    const bookNumber = buttonId.replace('bookButton', '');
    return bookData.find(book => book.BookNumber === bookNumber)?.BookName || '未知書籍';
}

// 從書本名稱中獲取書櫃位置
function getBookShelfFromBookName(bookName) {
    const bookInfo = bookData.find(book => book.BookName === bookName);

    if (bookInfo) {
        return bookInfo.BookShelf;
    } else {
        // 如果找不到對應的書本，返回未知書櫃
        return '未知書櫃';
    }
}
