// シングルファイル簡易ゲーム集のスクリプト
// 日本語UI、15歳向けに簡潔に実装しています。
// 使い方: index.html をブラウザで開くだけ

// --- ナビゲーション ---
const navBtns = document.querySelectorAll('.nav-btn');
const panels = document.querySelectorAll('.panel');
navBtns.forEach(b=>{
  b.addEventListener('click', ()=> {
    navBtns.forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    const target = b.dataset.game;
    panels.forEach(p=>{
      if(p.id === target) p.classList.remove('hidden');
      else p.classList.add('hidden');
    });
    // 初期化が必要なパネルだけ呼ぶ
    if(target === 'element-match') initElementMatch();
    if(target === 'equation-balance') loadEquation();
    if(target === 'ph-lab') initPHLab();
    if(target === 'quiz') initQuiz();
  })
});

// ----------------- ELEMENT MATCH -----------------
const ELEMENTS = [
  {symbol:'H', name:'水素'},
  {symbol:'He', name:'ヘリウム'},
  {symbol:'O', name:'酸素'},
  {symbol:'N', name:'窒素'},
  {symbol:'C', name:'炭素'},
  {symbol:'Na', name:'ナトリウム'},
  {symbol:'Cl', name:'塩素'},
  {symbol:'K', name:'カリウム'},
  {symbol:'Ca', name:'カルシウム'},
  {symbol:'Fe', name:'鉄'},
  {symbol:'S', name:'硫黄'},
  {symbol:'Mg', name:'マグネシウム'}
];

let em_boardEl = document.getElementById('em-board');
let em_pairsLeft = document.getElementById('pairs-left');
let em_moves = document.getElementById('moves');
let em_resetBtn = document.getElementById('em-reset');
let em_difficulty = document.getElementById('em-difficulty');

let em_state = {cards:[], first:null, second:null, moves:0, pairs:0};

function initElementMatch(){
  // create board based on difficulty
  const pairs = parseInt(em_difficulty.value,10);
  em_state.pairs = pairs;
  em_state.moves = 0;
  em_state.first = em_state.second = null;
  em_moves.textContent = '0';
  em_pairsLeft.textContent = pairs;
  // pick random elements
  const pool = shuffleArray(ELEMENTS.slice()).slice(0,pairs);
  const pairsArray = [];
  pool.forEach((el, idx)=>{
    pairsArray.push({id:idx, type:'symbol', text:el.symbol, match:idKey(el.symbol+el.name)});
    pairsArray.push({id:idx, type:'name', text:el.name, match:idKey(el.symbol+el.name)});
  });
  const cards = shuffleArray(pairsArray);
  em_state.cards = cards;
  // render
  em_boardEl.innerHTML = '';
  cards.forEach((c, i)=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = i;
    card.dataset.match = c.match;
    card.innerHTML = `<div class="front">?</div><div class="back" style="display:none">${escapeHtml(c.text)}</div>`;
    card.addEventListener('click', onCardClick);
    em_boardEl.appendChild(card);
  });
}

function onCardClick(e){
  const idx = parseInt(e.currentTarget.dataset.index,10);
  const cardEl = e.currentTarget;
  // ignore matched or flipped
  if(cardEl.classList.contains('matched') || cardEl.classList.contains('flipped')) return;
  flipCard(cardEl);
  if(!em_state.first){
    em_state.first = cardEl;
  } else if(!em_state.second){
    em_state.second = cardEl;
    em_state.moves++;
    em_moves.textContent = em_state.moves;
    // check match
    if(em_state.first.dataset.match === em_state.second.dataset.match){
      // matched
      setTimeout(()=>{
        em_state.first.classList.add('matched');
        em_state.second.classList.add('matched');
        em_state.first = em_state.second = null;
        em_state.pairs--;
        em_pairsLeft.textContent = em_state.pairs;
        if(em_state.pairs === 0){
          alert('おめでとう！すべてのペアがそろいました。');
        }
      }, 400);
    } else {
      // flip back
      setTimeout(()=>{
        unflipCard(em_state.first);
        unflipCard(em_state.second);
        em_state.first = em_state.second = null;
      }, 800);
    }
  }
}

function flipCard(cardEl){
  cardEl.classList.add('flipped');
  cardEl.querySelector('.front').style.display='none';
  cardEl.querySelector('.back').style.display='block';
}
function unflipCard(cardEl){
  cardEl.classList.remove('flipped');
  cardEl.querySelector('.front').style.display='block';
  cardEl.querySelector('.back').style.display='none';
}
em_resetBtn.addEventListener('click', initElementMatch);
em_difficulty.addEventListener('change', initElementMatch);

// ----------------- EQUATION BALANCE -----------------
const equations = [
  // left and right arrays of species with their formulas (no coefficients)
  {left:['H2','O2'], right:['H2O'], answer:[2,1,2], hint:'水の生成'},
  {left:['Fe','O2'], right:['Fe2O3'], answer:[4,3,2], hint:'鉄の酸化'},
  {left:['C3H8','O2'], right:['CO2','H2O'], answer:[1,5,3], hint:'プロパンの燃焼'},
  {left:['Na','Cl2'], right:['NaCl'], answer:[2,1,2], hint:'塩の生成'},
  {left:['HCl','NaOH'], right:['NaCl','H2O'], answer:[1,1,1,1], hint:'中和反応'}
];
let eb_index = 0;
const ebQuestionEl = document.getElementById('eb-question');
const ebInputsEl = document.getElementById('eb-inputs');
const ebCheckBtn = document.getElementById('eb-check');
const ebSkipBtn = document.getElementById('eb-skip');
const ebFeedback = document.getElementById('eb-feedback');

function loadEquation(){
  // pick random equation
  eb_index = Math.floor(Math.random()*equations.length);
  renderEquation(equations[eb_index]);
  ebFeedback.textContent = '';
}

function renderEquation(q){
  // show something like: ____ H2 + ____ O2 → ____ H2O
  const parts = [];
  q.left.forEach(s => parts.push(s));
  const rightParts = [];
  q.right.forEach(s => rightParts.push(s));
  ebQuestionEl.textContent = q.left.join(' + ') + ' → ' + q.right.join(' + ');
  ebInputsEl.innerHTML = '';
  // inputs: left coefficients then right coefficients
  q.left.forEach((s,i)=>{
    const input = document.createElement('input');
    input.type='number'; input.min=0; input.value=1;
    input.dataset.pos = 'L' + i;
    ebInputsEl.appendChild(input);
  });
  q.right.forEach((s,i)=>{
    const input = document.createElement('input');
    input.type='number'; input.min=0; input.value=1;
    input.dataset.pos = 'R' + i;
    ebInputsEl.appendChild(input);
  });
}

ebCheckBtn.addEventListener('click', ()=>{
  const q = equations[eb_index];
  const inputs = [...ebInputsEl.querySelectorAll('input')].map(i=>parseInt(i.value||'0',10));
  const correct = arraysEqual(inputs, q.answer);
  if(correct){
    ebFeedback.textContent = '正解！次の問題に進みます。';
    ebFeedback.className = 'feedback success';
    setTimeout(loadEquation, 800);
  } else {
    ebFeedback.textContent = 'ちがいます。原子の数を確認してもう一度考えてみよう。ヒント: ' + q.hint;
    ebFeedback.className = 'feedback error';
  }
});

ebSkipBtn.addEventListener('click', loadEquation);

// ----------------- PH LAB -----------------
const phTargetEl = document.getElementById('ph-target');
const phCurrentEl = document.getElementById('ph-current');
const beakerEl = document.getElementById('beaker');
const addAcidBtn = document.getElementById('add-acid');
const addBaseBtn = document.getElementById('add-base');
const phResetBtn = document.getElementById('ph-reset');
const phFeedbackEl = document.getElementById('ph-feedback');

let phState = {current:7.0, target: null};

function initPHLab(){
  // set random target pH between 1 and 13 but not 7 usually
  let t = Math.round((Math.random()*12)+1);
  if(Math.abs(t-7) < 2) t = (t>7? t+2 : t-2);
  phState.target = t;
  phState.current = 7.0;
  phTargetEl.textContent = phState.target.toFixed(1);
  updatePHUI();
  phFeedbackEl.textContent = '';
}

function updatePHUI(){
  phCurrentEl.textContent = phState.current.toFixed(1);
  // change beaker color as simple indicator
  const c = phColorFor(phState.current);
  beakerEl.style.background = c;
  // check success
  if(Math.abs(phState.current - phState.target) <= 0.4){
    phFeedbackEl.textContent = '目標pHに近づいたよ！よくできた！';
    phFeedbackEl.className = 'feedback success';
  } else {
    phFeedbackEl.textContent = '';
    phFeedbackEl.className = 'feedback';
  }
}

addAcidBtn.addEventListener('click', ()=>{
  // adding acid lowers pH; amount depends on how close current is
  const delta = 0.6 + Math.random()*0.5;
  phState.current = Math.max(0, phState.current - delta);
  updatePHUI();
});
addBaseBtn.addEventListener('click', ()=>{
  const delta = 0.6 + Math.random()*0.5;
  phState.current = Math.min(14, phState.current + delta);
  updatePHUI();
});
phResetBtn.addEventListener('click', initPHLab);

function phColorFor(pH){
  // Return gradient based on pH (simple)
  if(pH <= 3) return 'linear-gradient(180deg,#ffadad,#ff6b6b)'; // red
  if(pH <= 6) return 'linear-gradient(180deg,#ffd6a5,#ffb347)'; // orange
  if(pH < 7.5) return 'linear-gradient(180deg,#d4f4dd,#86efac)'; // greenish (near neutral)
  if(pH <= 11) return 'linear-gradient(180deg,#a0c4ff,#6690ff)'; // blue
  return 'linear-gradient(180deg,#cdb4db,#9b5de5)'; // purple
}

// ----------------- QUIZ -----------------
const quizQuestions = [
  {q:'水素の元素記号はどれ？', options:['H','He','O','N'], a:0},
  {q:'酸性のpHはどれ？', options:['pH 2','pH 7','pH 10','pH 15'], a:0},
  {q:'化学反応で「生成物」を意味する英語は？', options:['Reactant','Product','Catalyst','Ion'], a:1},
  {q:'NaCl はどのような物質？', options:['金属','塩','ガス','酸'], a:1}
];
let quizIndex = 0;
const quizQuestionEl = document.getElementById('quiz-question');
const quizAnswersEl = document.getElementById('quiz-answers');
const quizNextBtn = document.getElementById('quiz-next');
const quizFeedback = document.getElementById('quiz-feedback');

function initQuiz(){
  quizIndex = 0;
  renderQuiz();
  quizFeedback.textContent = '';
}
function renderQuiz(){
  const q = quizQuestions[quizIndex];
  quizQuestionEl.textContent = (quizIndex+1) + '. ' + q.q;
  quizAnswersEl.innerHTML = '';
  q.options.forEach((opt,i)=>{
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.addEventListener('click', ()=> {
      handleQuizAnswer(i);
    });
    quizAnswersEl.appendChild(btn);
  });
}

function handleQuizAnswer(selected){
  const q = quizQuestions[quizIndex];
  if(selected === q.a){
    quizFeedback.textContent = '正解！';
    quizFeedback.className = 'feedback success';
  } else {
    quizFeedback.textContent = '不正解。正しい答えは: ' + q.options[q.a];
    quizFeedback.className = 'feedback error';
  }
}

quizNextBtn.addEventListener('click', ()=>{
  quizIndex++;
  if(quizIndex >= quizQuestions.length){
    alert('クイズ終了！おつかれさま。');
    quizIndex = 0;
  }
  renderQuiz();
  quizFeedback.textContent = '';
});

// ----------------- ユーティリティ関数 -----------------
function shuffleArray(a){ return a.map(v=>({v, r:Math.random()})).sort((x,y)=>x.r-y.r).map(x=>x.v) }
function idKey(s){ return btoa(unescape(encodeURIComponent(s))) } // simple unique key generator
function arraysEqual(a,b){ if(a.length!==b.length) return false; for(let i=0;i<a.length;i++) if(a[i]!==b[i]) return false; return true }
function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

// --- 初期表示 ---
initElementMatch();
