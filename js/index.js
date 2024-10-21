let selectedPokemonNumber = null;  // 選ばれたポケモンの番号を保持
let remainingPoints = null;  // 初期ポイント
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
            endGame();  // 時間切れ時の処理
        }
    }, 1000);  // 1秒ごとにカウントダウン
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

    // 難易度に応じて入力方式を変更
    if (timeLimit === 10) {  // 簡単モード（4択）
        document.getElementById('userInput').style.display = 'none';  // 通常の入力フィールドを非表示
        document.querySelector('input[type="submit"]').style.display = 'none';  // 送信ボタンを非表示
        document.getElementById('remainingPoints').parentElement.style.display = 'none';  // ポイントの表示を非表示
        displayMultipleChoiceOptions(selectedPokemonNumber, pokemonData);  // 4択問題を表示
    } else {
        document.getElementById('userInput').style.display = '';  // 通常の入力フィールドを表示
        document.querySelector('input[type="submit"]').style.display = '';  // 送信ボタンを表示
        document.getElementById('userInput').value = '';  // 入力欄をリセット
        document.getElementById('userInput').disabled = false;
        document.querySelector('input[type="submit"]').disabled = false;
        document.getElementById('userInput').focus();  // テキストボックスにフォーカス
    }

    // タイマーをリセットして開始
    clearInterval(timer);
    startTimer();
}

// 難易度選択のアラートを表示
function chooseDifficulty() {
    return Swal.fire({
        title: '難易度を選んでください',
        input: 'radio',
        inputOptions: {
            'select': '四択問題 (時間: 10秒)',
            'input': '入力問題 (時間: 15秒, ポイント: 1000)',
        },
        inputValidator: (value) => {
            if (!value) {
                return '難易度を選んでください！';
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            switch (result.value) {
                case 'select':
                    timeLimit = 10;
                    break;
                case 'input':
                    timeLimit = 15;
                    remainingPoints = 1000;
                    break;
            }
            resetGame();  // ゲームの初期化と開始
        }
    });
}

// 4択の選択肢ボタンを生成する関数
function displayMultipleChoiceOptions(correctNumber, pokemonData) {
    // まず既存の選択肢を削除
    const form = document.getElementById('pokemonForm');
    const existingButtons = document.querySelectorAll('.choice-button');
    existingButtons.forEach(button => button.remove());

    // 正解を含めた4つの選択肢を用意
    let options = [correctNumber];
    while (options.length < 4) {
        // 正解番号の±15の範囲でランダムな番号を生成
        const randomOffset = Math.floor(Math.random() * 31) - 15;  // -15～15の範囲の乱数
        const randomNumber = correctNumber + randomOffset;

        // 番号がポケモンの範囲外にならないようにチェックし、重複を避ける
        if (randomNumber > 0 && randomNumber <= pokemonData.length && !options.includes(randomNumber)) {
            options.push(randomNumber);
        }
    }

    // 選択肢をシャッフル
    options = options.sort(() => Math.random() - 0.5);

    // 4つの選択肢ボタンを生成
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.innerText = option;
        button.addEventListener('click', () => {
            checkMultipleChoiceAnswer(option, correctNumber);
        });
        form.appendChild(button);
    });
}

// 4択問題の回答をチェックする関数
function checkMultipleChoiceAnswer(selectedNumber, correctNumber) {
    clearInterval(timer);  // タイマーを停止
    const resultMessage = document.getElementById('resultMessage');

    if (selectedNumber === correctNumber) {
        resultMessage.innerText = '正解！ 50ポイント追加！';
        resultMessage.style.color = 'green';
        remainingPoints += 50;
        correctAnswers++;  // 正解数をカウント
    } else {
        resultMessage.innerText = `不正解… 正解は${correctNumber}番！`;
        resultMessage.style.color = 'red';
    }

    document.getElementById('remainingPoints').innerText = remainingPoints;

    // 次の問題に進む
    setTimeout(function() {
        loadPokemonData().then(pokemonData => {
            displayRandomPokemon(pokemonData);
        });
    }, 2000);
}



// ゲームをリセットする関数
function resetGame() {
    correctAnswers = 0;  // 正解数を初期化
    document.getElementById('remainingPoints').innerText = remainingPoints;  // ポイント表示をリセット
    document.getElementById('resultMessage').innerText = '';  // ゲームオーバーメッセージを消す
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

    // 正解/不正解の判定
    if (inputNumber === selectedPokemonNumber) {
        resultMessage.innerText = '正解！ 50ポイント追加！';
        resultMessage.style.color = 'green';
        remainingPoints += 50;  // 正解時に50ポイント追加
        // ポイント表示を更新
        document.getElementById('remainingPoints').innerText = remainingPoints;
        // 次のポケモンに自動で進む（2秒後）
        setTimeout(function() {
            loadPokemonData().then(pokemonData => {
                displayRandomPokemon(pokemonData);
            });
        }, 2000);  // 2秒後に次のポケモンを表示
        correctAnswers++;  // 問題数をカウント
    } else {
        resultMessage.innerText = `不正解… 正解は${selectedPokemonNumber}番！`;
        resultMessage.style.color = 'red';
        // ポイント表示を更新
        document.getElementById('remainingPoints').innerText = remainingPoints;
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
    document.getElementById('resultMessage').innerText = 'ゲームオーバー！';
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
    chooseDifficulty();  // 難易度選択を呼び出す
    loadPokemonData().then(pokemonData => {
        displayRandomPokemon(pokemonData);
        document.getElementById('userInput').focus();  // テキストボックスにフォーカス
    });
};

// フォームの送信イベントでユーザーの答えを確認
document.getElementById('pokemonForm').addEventListener('submit', checkAnswer);