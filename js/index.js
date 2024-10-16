let selectedPokemonNumber = null;  // 選ばれたポケモンの番号を保持
let remainingPoints = 1000;  // 初期ポイント
let timeLimit = 15;  // 制限時間（秒）
let timer;  // タイマーを格納する変数
let correctAnswers = 0;  // 正解した問題数をカウント

// 右クリックを無効化
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});
    
// F12キーを無効化
document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
    }
});

// JSONファイルをfetchで読み込む
function loadPokemonData() {
    return fetch('../js/pokemon_data.json')  // JSONファイルを指定
        .then(response => response.json())  // JSONデータとして処理
        .then(data => {
            return data;  // データを返す
        })
        .catch(error => {
            console.error("データの読み込みに失敗しました:", error);
        });
}

// タイマーを開始する関数
function startTimer() {
    let timeLeft = timeLimit;
    document.getElementById('timeLeft').innerText = timeLeft;

    timer = setInterval(function() {
        timeLeft--;
        document.getElementById('timeLeft').innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            timeOut();  // 時間切れ時の処理
        }
    }, 1000);  // 1秒ごとにカウントダウン
}

// 時間切れ時の処理
function timeOut() {
    const resultMessage = document.getElementById('resultMessage');
    resultMessage.innerText = '時間切れ！';
    resultMessage.style.color = 'red';

    // ゲームオーバー処理を追加
    endGame();
}

// ランダムなポケモンを表示する関数
function displayRandomPokemon(pokemonData) {
    const randomIndex = Math.floor(Math.random() * pokemonData.length);
    const selectedPokemon = pokemonData[randomIndex];

    // 選ばれたポケモンの番号を保持
    selectedPokemonNumber = selectedPokemon['番号'];

    // 名前と画像を表示
    document.getElementById('pokemonName').innerText = selectedPokemon['名前'];
    document.getElementById('pokemonImage').src = selectedPokemon['画像'];

    // 結果メッセージをクリア
    document.getElementById('resultMessage').innerText = '';
    document.getElementById('userInput').value = '';  // 入力欄をリセット

    // 再度入力を有効化
    document.getElementById('userInput').disabled = false;
    document.querySelector('input[type="submit"]').disabled = false;
    document.getElementById('userInput').focus();  // テキストボックスにフォーカスを設定

    // タイマーをリセットして開始
    clearInterval(timer);
    startTimer();
}

// ゲームをリセットする関数
function resetGame() {
    remainingPoints = 1000;  // ポイントを初期化
    correctAnswers = 0;  // 正解数を初期化
    document.getElementById('remainingPoints').innerText = remainingPoints;  // ポイント表示をリセット
    document.getElementById('gameOverMessage').innerText = '';  // ゲームオーバーメッセージを消す
    document.getElementById('userInput').disabled = false;  // 入力欄を有効化

    // 次のポケモンを表示
    loadPokemonData().then(pokemonData => {
        displayRandomPokemon(pokemonData);
    });
}

// ユーザーの入力をチェックする関数
function checkAnswer(event) {
    event.preventDefault();  // フォームの送信を防ぐ
    clearInterval(timer);  // タイマーを停止
    const userInput = document.getElementById('userInput').value;
    const resultMessage = document.getElementById('resultMessage');

    if (userInput == "") {
        resultMessage.innerText = '番号を入力してください。';
        resultMessage.style.color = 'red';
    }

    const inputNumber = parseInt(userInput);
    const difference = Math.abs(inputNumber - selectedPokemonNumber);  // 入力と正解の番号の差

    // ポイントを差し引く
    remainingPoints -= difference;
    if (remainingPoints < 0) remainingPoints = 0;

    // ポイント表示を更新
    document.getElementById('remainingPoints').innerText = remainingPoints;

    // 正解/不正解の判定
    if (inputNumber === selectedPokemonNumber) {
        resultMessage.innerText = '正解！ 50ポイント追加！';
        resultMessage.style.color = 'green';
        // 次のポケモンに自動で進む（2秒後）
        setTimeout(function() {
            loadPokemonData().then(pokemonData => {
                displayRandomPokemon(pokemonData);
            });
        }, 2000);  // 2秒後に次のポケモンを表示
        correctAnswers++;  // 問題数をカウント
        remainingPoints += 50;  // 正解時に50ポイント追加
    } else {
        resultMessage.innerText = `不正解… 正解は${selectedPokemonNumber}番！`;
        resultMessage.style.color = 'red';
        // ポイントが0になったらゲームオーバー
        if (remainingPoints <= 0) {
            endGame();  // ポイントが0になったら時間切れ時と同じ処理を実行
        } else {
            // 次のポケモンに自動で進む（2秒後）
            setTimeout(function() {
                loadPokemonData().then(pokemonData => {
                    displayRandomPokemon(pokemonData);
                });
            }, 2000);  // 2秒後に次のポケモンを表示
        }
        correctAnswers++;  // 問題数をカウント
    }
    // 入力フィールドとsubmitボタンを無効化する
    document.getElementById('userInput').disabled = true;
    document.querySelector('input[type="submit"]').disabled = true;
}

// ゲームオーバー処理
function endGame() {
    clearInterval(timer);  // タイマーをクリア
    document.getElementById('gameOverMessage').innerText = 'ゲームオーバー！';
    document.getElementById('userInput').disabled = true;  // 入力欄を無効化

    // アラートで結果を表示
    Swal.fire({
        title: 'ゲームオーバー！',
        text: `あなたは${correctAnswers}問耐えた！`,
        icon: 'error',
        confirmButtonText: 'リトライ',
        allowOutsideClick: false  // アラート外をクリックしても閉じないように設定
    }).then((result) => {
        if (result.isConfirmed) {
            resetGame();  // リトライボタンを押したときにゲームをリセット
        }
    });
}

// ページロード時に最初のポケモンを表示し、テキストボックスにフォーカスを設定
window.onload = function() {
    loadPokemonData().then(pokemonData => {
        displayRandomPokemon(pokemonData);
        document.getElementById('userInput').focus();  // テキストボックスにフォーカス
    });
};

// フォームの送信イベントでユーザーの答えを確認
document.getElementById('pokemonForm').addEventListener('submit', checkAnswer);