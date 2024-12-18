let pokemonList = [];
let currentPokemon;
let gameMode = "";
let gameType = "";
let questionCount = 0;
let correctAnswers = 0;
let countdown;
let timeLimitPerQuestion = 10; // 初期値を10秒に設定
const maxQuestions = 10; // リミテッドモードの最大問題数

async function loadPokemonData() {
    try {
        const response = await fetch('../data/pokemon_data.json');
        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }
        const data = await response.json();
        pokemonList = data;
    } catch (error) {
        console.error('ポケモンデータの読み込み中にエラーが発生しました:', error.message);
        Swal.fire({
            icon: 'error',
            title: 'データエラー',
            text: `ポケモンデータを読み込めませんでした。エラー内容: ${error.message}`,
            confirmButtonText: 'OK'
        });
    }
}

function resetGame() {
    // カウントダウンをクリア
    clearInterval(countdown);

    // UIのリセット
    document.querySelector('.mode-selection').style.display = 'block'; // モード選択画面を表示
    document.querySelector('.game-type-selection').style.display = 'none'; // ゲームタイプ選択を非表示
    document.querySelector('.time-selection').style.display = 'none'; // 時間設定画面を非表示
    document.querySelector('.game-container').style.display = 'none'; // ゲーム画面を非表示

    // 入力モードと選択モードの非表示
    document.getElementById("input-mode").style.display = 'none';
    document.getElementById("multiple-choice-mode").style.display = 'none';

    // 残り回答数とタイマーの非表示
    document.getElementById("remaining-count").style.display = 'none';
    document.getElementById("timer").style.display = 'none';

    // ゲーム関連の状態変数をリセット
    gameMode = "";
    gameType = "";
    questionCount = 0;
    correctAnswers = 0;
    timeLimitPerQuestion = 10; // デフォルト値に戻す
}

function selectMode(mode) {
    gameMode = mode;
    document.querySelector('.mode-selection').style.display = 'none';
    document.querySelector('.game-type-selection').style.display = 'block';
}

function selectGameType(selectedGameType) {
    gameType = selectedGameType;
    document.querySelector('.game-type-selection').style.display = 'none';
    document.querySelector('.time-selection').style.display = 'block';
}

function updateSliderValue(value) {
    document.getElementById("time-display").textContent = `各問題の制限時間: ${value}秒`;
    timeLimitPerQuestion = parseInt(value);
}

function startGameWithCustomTime() {
    if (isNaN(timeLimitPerQuestion) || timeLimitPerQuestion < 5 || timeLimitPerQuestion > 20) {
        Swal.fire({
            icon: 'error',
            title: '無効な入力',
            text: '5秒以上20秒以内の時間を指定してください。',
            confirmButtonText: 'OK'
        });
        return;
    }
    startGame();
}

function startGame() {
    questionCount = 0;
    correctAnswers = 0;
    document.querySelector('.time-selection').style.display = 'none';
    document.querySelector('.game-container').style.display = 'block';

    if (gameType === 'limited') {
        document.getElementById("remaining-count").style.display = 'block';
        updateRemainingCount();
    } else {
        document.getElementById("remaining-count").style.display = 'none';
    }

    loadNextQuestion();
}

function startTimer() {
    let timeRemaining = timeLimitPerQuestion;
    const timerElement = document.getElementById("timer");
    timerElement.style.display = "block";

    function updateTimer() {
        timerElement.textContent = `残り時間: ${timeRemaining}秒`;

        if (timeRemaining <= 0) {
            clearInterval(countdown);
            endGame("時間切れです！ゲーム終了");
        } else {
            timeRemaining -= 1;
        }
    }

    updateTimer();
    countdown = setInterval(updateTimer, 1000);
}

function updateRemainingCount() {
    const remainingQuestions = maxQuestions - questionCount;
    document.getElementById("remaining-count").textContent = `残り回答可能回数: ${remainingQuestions}回`;
}

function loadNextQuestion() {
    if (gameType === 'limited' && questionCount >= maxQuestions) {
        endGame("リミテッドモード終了");
        return;
    }

    clearInterval(countdown);
    startTimer();

    currentPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)];
    document.getElementById("pokemon-name").textContent = currentPokemon.名前;
    document.getElementById("pokemon-image").src = currentPokemon.画像 || "default.png";
    document.getElementById("message").textContent = '';

    if (gameMode === 'input') {
        document.getElementById("input-mode").style.display = 'block';
        document.getElementById("multiple-choice-mode").style.display = 'none';
        document.getElementById("guess").value = '';
        document.getElementById("guess").focus();
    } else if (gameMode === 'multipleChoice') {
        setupMultipleChoice();
        document.getElementById("input-mode").style.display = 'none';
        document.getElementById("multiple-choice-mode").style.display = 'block';
    }
}

function setupMultipleChoice() {
    const optionsContainer = document.getElementById("options");
    optionsContainer.innerHTML = "";

    const correctNumber = currentPokemon.番号;
    const choices = new Set([correctNumber]);

    while (choices.size < 4) {
        const randomChoice = correctNumber + Math.floor(Math.random() * 31) - 15;
        if (randomChoice > 0 && randomChoice <= pokemonList.length) {
            choices.add(randomChoice);
        }
    }

    Array.from(choices).sort(() => 0.5 - Math.random()).forEach(choice => {
        const button = document.createElement("button");
        button.className = "btn btn-outline-primary w-100 mt-2";
        button.textContent = choice;
        button.onclick = () => checkAnswer(choice);
        optionsContainer.appendChild(button);
    });
}

function validateAndCheckAnswer() {
    const guess = parseInt(document.getElementById("guess").value);
    if (isNaN(guess) || guess < 1 || guess > pokemonList.length) {
        Swal.fire({
            icon: 'error',
            title: '無効な入力',
            text: '1から正しい範囲で入力してください。',
            confirmButtonText: 'OK'
        });
        return;
    }
    checkAnswer(guess);
}

function checkAnswer(guess = null) {
    const message = document.getElementById("message");
    const userGuess = guess || parseInt(document.getElementById("guess").value);

    if (userGuess === currentPokemon.番号) {
        message.textContent = `正解！ ${currentPokemon.番号} 番です！次の問題に進みます...`;
        message.className = "message correct";
        correctAnswers++;
    } else {
        message.textContent = `不正解！正解は ${currentPokemon.番号} 番でした。`;
        message.className = "message";
    }

    questionCount++;
    if (gameType === 'limited' && questionCount >= maxQuestions) {
        setTimeout(() => endGame("リミテッドモード終了"), 2000);
    } else {
        setTimeout(loadNextQuestion, 2000);
    }
}

function endGame(reason = "ゲーム終了") {
    document.querySelector('.game-container').style.display = 'none';
    document.querySelector('.mode-selection').style.display = 'block';
    clearInterval(countdown);
    Swal.fire({
        title: reason,
        text: `お疲れ様でした！\n正解数: ${correctAnswers}問`,
        icon: 'info',
        confirmButtonText: 'OK'
    });
}

loadPokemonData();
