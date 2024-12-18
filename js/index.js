// ポケモンのリスト、現在のポケモン、ゲームの状態を管理するための変数
let pokemonList = []; // ポケモンのデータを格納するリスト
let currentPokemon; // 現在のポケモン
let gameMode = ""; // ゲームモード（"multipleChoice" または "input"）
let gameType = ""; // ゲームタイプ（"endless" または "limited"）
let questionCount = 0; // 現在の質問数
let correctAnswers = 0; // 正解数
let countdown; // タイマーのインスタンス
let timeLimitPerQuestion = 10; // 各質問の制限時間（初期値は10秒）
const maxQuestions = 10; // リミテッドモードでの最大質問数

// ポケモンデータをサーバーまたはローカルからロードする関数
async function loadPokemonData() {
    try {
        const response = await fetch('../data/pokemon_data.json'); // JSONファイルをフェッチ
        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`); // HTTPエラーをキャッチ
        }
        const data = await response.json(); // JSONデータを解析
        pokemonList = data; // ポケモンリストにデータを格納
    } catch (error) {
        console.error('ポケモンデータの読み込み中にエラーが発生しました:', error.message); // エラーログ
        Swal.fire({
            icon: 'error',
            title: 'データエラー',
            text: `ポケモンデータを読み込めませんでした。エラー内容: ${error.message}`,
            confirmButtonText: 'OK'
        });
    }
}

// ゲームモードを選択する関数（4択または入力）
function selectMode(mode) {
    gameMode = mode; // 選択されたモードを記録
    document.querySelector('.mode-selection').style.display = 'none'; // モード選択画面を非表示
    document.querySelector('.game-type-selection').style.display = 'block'; // ゲームタイプ選択画面を表示
}

// ゲームタイプを選択する関数（エンドレスまたはリミテッド）
function selectGameType(selectedGameType) {
    gameType = selectedGameType; // 選択されたゲームタイプを記録
    document.querySelector('.game-type-selection').style.display = 'none'; // ゲームタイプ選択画面を非表示
    document.querySelector('.time-selection').style.display = 'block'; // 時間設定画面を表示
}

// スライダーで選択された制限時間をリアルタイムに表示し、変数を更新
function updateSliderValue(value) {
    document.getElementById("time-display").textContent = `各問題の制限時間: ${value}秒`;
    timeLimitPerQuestion = parseInt(value); // スライダーの値を数値として格納
}

// ゲームを開始する前に、制限時間のチェックを行う関数
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
    startGame(); // 制限時間が正しい場合はゲームを開始
}

// ゲームを開始する関数
function startGame() {
    questionCount = 0; // 質問数をリセット
    correctAnswers = 0; // 正解数をリセット
    document.querySelector('.time-selection').style.display = 'none'; // 時間設定画面を非表示
    document.querySelector('.game-container').style.display = 'block'; // ゲーム画面を表示

    if (gameType === 'limited') {
        document.getElementById("remaining-count").style.display = 'block'; // リミテッドモードでは残り回数を表示
        updateRemainingCount();
    } else {
        document.getElementById("remaining-count").style.display = 'none'; // エンドレスモードでは非表示
    }

    loadNextQuestion(); // 最初の質問をロード
}

// 各質問のタイマーを開始する関数
function startTimer() {
    let timeRemaining = timeLimitPerQuestion; // 残り時間を初期化
    const timerElement = document.getElementById("timer");
    timerElement.style.display = "block"; // タイマー表示

    function updateTimer() {
        timerElement.textContent = `残り時間: ${timeRemaining}秒`;

        if (timeRemaining <= 0) {
            clearInterval(countdown); // タイマーをクリア
            endGame("時間切れです！ゲーム終了"); // ゲームを終了
        } else {
            timeRemaining -= 1; // 残り時間をデクリメント
        }
    }

    updateTimer(); // 初回のタイマー更新
    countdown = setInterval(updateTimer, 1000); // 1秒ごとにタイマーを更新
}

// 残り質問数を更新する関数（リミテッドモード用）
function updateRemainingCount() {
    const remainingQuestions = maxQuestions - questionCount; // 残り質問数を計算
    document.getElementById("remaining-count").textContent = `残り回答可能回数: ${remainingQuestions}回`;
}

// 次の質問をロードする関数
function loadNextQuestion() {
    if (gameType === 'limited' && questionCount >= maxQuestions) {
        endGame("リミテッドモード終了"); // リミテッドモードの終了条件をチェック
        return;
    }

    clearInterval(countdown); // タイマーをリセット
    startTimer(); // 新しいタイマーを開始

    currentPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)]; // ランダムにポケモンを選択
    document.getElementById("pokemon-name").textContent = currentPokemon.名前; // ポケモンの名前を表示
    document.getElementById("pokemon-image").src = currentPokemon.画像 || "default.png"; // ポケモンの画像を設定
    document.getElementById("message").textContent = ''; // メッセージをリセット

    if (gameMode === 'input') {
        document.getElementById("input-mode").style.display = 'block'; // 入力モードを表示
        document.getElementById("multiple-choice-mode").style.display = 'none'; // 選択モードを非表示
        document.getElementById("guess").value = ''; // 入力フィールドをリセット
        document.getElementById("guess").focus(); // 入力フィールドにフォーカス
    } else if (gameMode === 'multipleChoice') {
        setupMultipleChoice(); // 選択肢をセットアップ
        document.getElementById("input-mode").style.display = 'none'; // 入力モードを非表示
        document.getElementById("multiple-choice-mode").style.display = 'block'; // 選択モードを表示
    }
}

// 4択の選択肢をセットアップする関数
function setupMultipleChoice() {
    const optionsContainer = document.getElementById("options");
    optionsContainer.innerHTML = ""; // 選択肢をリセット

    const correctNumber = currentPokemon.番号; // 正解の番号を取得
    const choices = new Set([correctNumber]); // 重複を避けるためにSetを使用

    while (choices.size < 4) {
        const randomChoice = correctNumber + Math.floor(Math.random() * 31) - 15; // ランダムな番号を生成
        if (randomChoice > 0 && randomChoice <= pokemonList.length) {
            choices.add(randomChoice); // 有効な番号を追加
        }
    }

    Array.from(choices).sort(() => 0.5 - Math.random()).forEach(choice => {
        const button = document.createElement("button");
        button.className = "btn btn-outline-primary w-100 mt-2"; // ボタンのスタイルを設定
        button.textContent = choice; // ボタンに番号を表示
        button.onclick = () => checkAnswer(choice); // クリック時に回答をチェック
        optionsContainer.appendChild(button); // コンテナにボタンを追加
    });
}

// 入力モードで回答を検証する関数
function validateAndCheckAnswer() {
    const guess = parseInt(document.getElementById("guess").value); // 入力された値を取得
    if (isNaN(guess) || guess < 1 || guess > pokemonList.length) {
        Swal.fire({
            icon: 'error',
            title: '無効な入力',
            text: '1から正しい範囲で入力してください。',
            confirmButtonText: 'OK'
        });
        return;
    }
    checkAnswer(guess); // 入力値をチェック
}

// 回答をチェックする関数
function checkAnswer(guess = null) {
    const message = document.getElementById("message");
    const userGuess = guess || parseInt(document.getElementById("guess").value); // 入力または選択された値

    if (userGuess === currentPokemon.番号) {
        message.textContent = `正解！ ${currentPokemon.番号} 番です！次の問題に進みます...`;
        message.className = "message correct"; // 正解メッセージを表示
        correctAnswers++; // 正解数をインクリメント
    } else {
        message.textContent = `不正解！正解は ${currentPokemon.番号} 番でした。`;
        message.className = "message"; // 不正解メッセージを表示
    }

    questionCount++; // 質問数をインクリメント
    if (gameType === 'limited' && questionCount >= maxQuestions) {
        setTimeout(() => endGame("リミテッドモード終了"), 2000); // リミテッドモードが終了
    } else {
        setTimeout(loadNextQuestion, 2000); // 次の質問をロード
    }
}

// ゲームを終了する関数
function endGame(reason = "ゲーム終了") {
    document.querySelector('.game-container').style.display = 'none'; // ゲーム画面を非表示
    document.querySelector('.mode-selection').style.display = 'block'; // モード選択画面を表示
    clearInterval(countdown); // タイマーをクリア
    Swal.fire({
        title: reason,
        text: `お疲れ様でした！\n正解数: ${correctAnswers}問`,
        icon: 'info',
        confirmButtonText: 'OK'
    });
}

// ゲームをリセットする関数
function resetGame() {
    clearInterval(countdown); // タイマーをクリア
    document.querySelector('.mode-selection').style.display = 'block'; // モード選択画面を表示
    document.querySelector('.game-type-selection').style.display = 'none'; // ゲームタイプ選択画面を非表示
    document.querySelector('.time-selection').style.display = 'none'; // 時間設定画面を非表示
    document.querySelector('.game-container').style.display = 'none'; // ゲーム画面を非表示
    document.getElementById("input-mode").style.display = 'none'; // 入力モードを非表示
    document.getElementById("multiple-choice-mode").style.display = 'none'; // 選択モードを非表示
    document.getElementById("remaining-count").style.display = 'none'; // 残り質問数を非表示
    document.getElementById("timer").style.display = 'none'; // タイマーを非表示
    gameMode = ""; // ゲームモードをリセット
    gameType = ""; // ゲームタイプをリセット
    questionCount = 0; // 質問数をリセット
    correctAnswers = 0; // 正解数をリセット
    timeLimitPerQuestion = 10; // 制限時間をリセット
}

// ページ読み込み時にポケモンデータをロード
loadPokemonData();
