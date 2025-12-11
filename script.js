const gameContainer = document.getElementById('game-container');

// --- GAME DATA ---

// 1. Elements Quiz Data (Common HS Level)
const elementsData = [
    { symbol: 'H', name: '水素' },
    { symbol: 'He', name: 'ヘリウム' },
    { symbol: 'C', name: '炭素' },
    { symbol: 'N', name: '窒素' },
    { symbol: 'O', name: '酸素' },
    { symbol: 'Na', name: 'ナトリウム' },
    { symbol: 'Mg', name: 'マグネシウム' },
    { symbol: 'Al', name: 'アルミニウム' },
    { symbol: 'Si', name: 'ケイ素' },
    { symbol: 'S', name: '硫黄' },
    { symbol: 'Cl', name: '塩素' },
    { symbol: 'K', name: 'カリウム' },
    { symbol: 'Ca', name: 'カルシウム' },
    { symbol: 'Fe', name: '鉄' },
    { symbol: 'Cu', name: '銅' },
    { symbol: 'Zn', name: '亜鉛' },
    { symbol: 'Ag', name: '銀' },
    { symbol: 'Au', name: '金' }
];

// 2. Equation Balancing Data (Coefficient answers)
const equationsData = [
    { 
        parts: ['<input type="number" id="c1"> H₂', '+', '<input type="number" id="c2"> O₂', '→', '<input type="number" id="c3"> H₂O'], 
        answer: [2, 1, 2],
        desc: '水の生成'
    },
    { 
        parts: ['<input type="number" id="c1"> N₂', '+', '<input type="number" id="c2"> H₂', '→', '<input type="number" id="c3"> NH₃'], 
        answer: [1, 3, 2],
        desc: 'アンモニアの生成 (ハーバー・ボッシュ法)'
    },
    { 
        parts: ['<input type="number" id="c1"> Cu', '+', '<input type="number" id="c2"> O₂', '→', '<input type="number" id="c3"> CuO'], 
        answer: [2, 1, 2],
        desc: '銅の酸化'
    }
];

// 3. pH Data
const phData = [
    { name: 'レモン汁', type: 'acid', label: '酸性' },
    { name: '石けん水', type: 'base', label: 'アルカリ性' },
    { name: '食塩水', type: 'neutral', label: '中性' },
    { name: '炭酸飲料', type: 'acid', label: '酸性' },
    { name: 'アンモニア水', type: 'base', label: 'アルカリ性' },
    { name: '胃液', type: 'acid', label: '酸性' },
    { name: '重曹 (水溶液)', type: 'base', label: 'アルカリ性' },
    { name: '純水', type: 'neutral', label: '中性' }
];


// --- NAVIGATION FUNCTIONS ---

function showHome() {
    gameContainer.innerHTML = `
        <div class="hero">
            <h1>化学の世界へようこそ！</h1>
            <p>高校化学の基礎をゲームで楽しく学ぼう。</p>
            <div class="menu-grid">
                <div class="menu-card" onclick="loadGame('elements')">
                    <h2>🔥 元素記号マスター</h2>
                    <p>基本の元素記号をスピード暗記！</p>
                </div>
                <div class="menu-card" onclick="loadGame('equations')">
                    <h2>⚖️ 化学反応式パズル</h2>
                    <p>係数を合わせて反応式を完成させよう。</p>
                </div>
                <div class="menu-card" onclick="loadGame('ph')">
                    <h2>🍋 酸性 vs アルカリ性</h2>
                    <p>身近な液体を仕分けしよう。</p>
                </div>
            </div>
        </div>
    `;
}

function loadGame(gameType) {
    if (gameType === 'elements') startElementsGame();
    if (gameType === 'equations') startEquationsGame();
    if (gameType === 'ph') startPhGame();
}


// --- GAME 1: ELEMENTS QUIZ ---

function startElementsGame() {
    let score = 0;
    let questionCount = 0;
    const maxQuestions = 5;

    function nextQuestion() {
        if (questionCount >= maxQuestions) {
            gameContainer.innerHTML = `
                <div class="game-area">
                    <h2>結果発表！</h2>
                    <p class="question-box">${score} / ${maxQuestions} 正解</p>
                    <button class="game-btn" onclick="startElementsGame()">もう一度やる</button>
                    <button class="game-btn" onclick="showHome()">ホームに戻る</button>
                </div>
            `;
            return;
        }

        const currentEl = elementsData[Math.floor(Math.random() * elementsData.length)];
        
        // Create 3 wrong options + 1 correct
        let options = [currentEl.name];
        while (options.length < 4) {
            let randomEl = elementsData[Math.floor(Math.random() * elementsData.length)].name;
            if (!options.includes(randomEl)) options.push(randomEl);
        }
        options.sort(() => Math.random() - 0.5); // Shuffle

        gameContainer.innerHTML = `
            <div class="game-area">
                <h2>元素記号クイズ (${questionCount + 1}/${maxQuestions})</h2>
                <div class="question-box">${currentEl.symbol}</div>
                <p>この記号の元素名は？</p>
                <div class="options-grid" id="options-area">
                    <!-- Buttons injected here -->
                </div>
                <div class="feedback" id="feedback"></div>
            </div>
        `;

        const optionsArea = document.getElementById('options-area');
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'game-btn';
            btn.innerText = opt;
            btn.onclick = () => checkAnswer(opt, currentEl.name);
            optionsArea.appendChild(btn);
        });
    }

    function checkAnswer(selected, correct) {
        const feedback = document.getElementById('feedback');
        if (selected === correct) {
            score++;
            feedback.style.color = 'var(--correct)';
            feedback.innerText = '正解！ (Seikai!)';
        } else {
            feedback.style.color = 'var(--wrong)';
            feedback.innerText = `残念... 正解は ${correct}`;
        }
        questionCount++;
        setTimeout(nextQuestion, 1500);
    }

    nextQuestion();
}


// --- GAME 2: EQUATION BALANCER ---

function startEquationsGame() {
    let currentEqIndex = 0;

    function renderEquation() {
        if (currentEqIndex >= equationsData.length) {
            gameContainer.innerHTML = `
                <div class="game-area">
                    <h2>全問クリア！</h2>
                    <p>化学反応式の達人ですね。</p>
                    <button class="game-btn" onclick="startEquationsGame()">もう一度やる</button>
                    <button class="game-btn" onclick="showHome()">ホームに戻る</button>
                </div>
            `;
            return;
        }

        const eq = equationsData[currentEqIndex];
        
        gameContainer.innerHTML = `
            <div class="game-area">
                <h2>化学反応式パズル</h2>
                <p>${eq.desc}</p>
                <div class="equation-display">
                    ${eq.parts.join(' ')}
                </div>
                <p style="font-size: 0.9rem; margin-bottom: 1rem;">係数が1の場合は「1」を入力してね。</p>
                <button class="game-btn" onclick="checkEquation()">答える</button>
                <div class="feedback" id="eq-feedback"></div>
            </div>
        `;
    }

    // Making function accessible globally for the button click
    window.checkEquation = function() {
        const eq = equationsData[currentEqIndex];
        const inputs = [
            parseInt(document.getElementById('c1').value) || 0,
            parseInt(document.getElementById('c2').value) || 0,
            parseInt(document.getElementById('c3').value) || 0
        ];

        const feedback = document.getElementById('eq-feedback');

        // Check if arrays match
        const isCorrect = JSON.stringify(inputs) === JSON.stringify(eq.answer);

        if (isCorrect) {
            feedback.style.color = 'var(--correct)';
            feedback.innerText = '素晴らしい！正解です。';
            currentEqIndex++;
            setTimeout(renderEquation, 1500);
        } else {
            feedback.style.color = 'var(--wrong)';
            feedback.innerText = 'うーん、数が合いません。もう一度考えてみよう。';
        }
    };

    renderEquation();
}


// --- GAME 3: pH SORTING ---

function startPhGame() {
    let score = 0;
    let count = 0;
    const maxQ = 5;

    function nextPhQ() {
        if (count >= maxQ) {
            gameContainer.innerHTML = `
                <div class="game-area">
                    <h2>結果発表</h2>
                    <p class="question-box">${score} / ${maxQ} 正解</p>
                    <button class="game-btn" onclick="startPhGame()">もう一度</button>
                    <button class="game-btn" onclick="showHome()">ホーム</button>
                </div>
            `;
            return;
        }

        const q = phData[Math.floor(Math.random() * phData.length)];

        gameContainer.innerHTML = `
            <div class="game-area">
                <h2>酸・塩基仕分け (${count + 1}/${maxQ})</h2>
                <div class="question-box">${q.name}</div>
                <p>これはどれ？</p>
                <div class="options-grid" style="grid-template-columns: 1fr 1fr 1fr;">
                    <button class="game-btn" style="background:#E74C3C" onclick="checkPh('acid', '${q.type}')">酸性</button>
                    <button class="game-btn" style="background:#2ECC71" onclick="checkPh('neutral', '${q.type}')">中性</button>
                    <button class="game-btn" style="background:#3498DB" onclick="checkPh('base', '${q.type}')">アルカリ性</button>
                </div>
                <div class="feedback" id="ph-feedback"></div>
            </div>
        `;
    }

    window.checkPh = function(guess, answer) {
        const feedback = document.getElementById('ph-feedback');
        if (guess === answer) {
            score++;
            feedback.style.color = 'var(--correct)';
            feedback.innerText = '正解！';
        } else {
            feedback.style.color = 'var(--wrong)';
            let ansText = answer === 'acid' ? '酸性' : answer === 'base' ? 'アルカリ性' : '中性';
            feedback.innerText = `間違い！正解は ${ansText}`;
        }
        count++;
        setTimeout(nextPhQ, 1500);
    }

    nextPhQ();
}
