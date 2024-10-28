let pokemonList = []; 
let currentPokemon;
let gameMode = ""; 
let gameType = "";
let questionCount = 0;
let correctAnswers = 0; // 正解の問題数をカウント
const maxQuestions = 10; // リミテッドモードでの問題数

async function loadPokemonData() {
    const response = await fetch('../data/pokemon_data.json');
    const data = await response.json();
    pokemonList = data;
}

function selectMode(mode) {
    gameMode = mode;
    document.querySelector('.mode-selection').style.display = 'none';
    document.querySelector('.game-type-selection').style.display = 'block';
}

function startGame(selectedGameType) {
    gameType = selectedGameType;
    questionCount = 0;
    correctAnswers = 0; // 正解数の初期化
    document.querySelector('.game-type-selection').style.display = 'none';
    document.querySelector('.game-container').style.display = 'block';

    if (gameType === 'limited') {
        document.getElementById("remaining-count").style.display = 'block';
        updateRemainingCount(); // 初期の残り回数を表示
    } else {
        document.getElementById("remaining-count").style.display = 'none';
    }

    loadNextQuestion();
}

function updateRemainingCount() {
    const remainingQuestions = maxQuestions - questionCount;
    document.getElementById("remaining-count").textContent = `残り回答可能回数: ${remainingQuestions}回`;
}

function loadNextQuestion() {
    if (gameType === 'limited' && questionCount >= maxQuestions) {
        endGame();
        return;
    }
    
    currentPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)];
    document.getElementById("pokemon-name").textContent = currentPokemon.名前;
    document.getElementById("pokemon-image").src = currentPokemon.画像;
    document.getElementById("message").textContent = '';

    if (gameMode === 'input') {
        document.getElementById("input-mode").style.display = 'block';
        document.getElementById("multiple-choice-mode").style.display = 'none';
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
    if (isNaN(guess) || guess < 1 || guess > 1025) {
        Swal.fire({
            icon: 'error',
            title: '無効な入力',
            text: '1から1025の範囲内で入力してください。',
            confirmButtonText: 'OK'
        });
        return;
    }
    checkAnswer(guess);
}

function checkAnswer(guess = null) {
    const message = document.getElementById("message");
    const userGuess = guess !== null ? guess : parseInt(document.getElementById("guess").value);

    const buttons = document.querySelectorAll("#options button");
    buttons.forEach(button => button.disabled = true);

    if (userGuess === currentPokemon.番号) {
        message.textContent = `正解！ ${currentPokemon.番号} 番です！次の問題に進みます...`;
        message.className = "message correct";
        correctAnswers++; // 正解数をカウント
    } else {
        message.textContent = `不正解！正解は ${currentPokemon.番号} 番です！次の問題に進みます...`;
        message.className = "message";
    }

    questionCount++;
    if (gameType === 'limited') {
        updateRemainingCount(); // 回答後に残り回数を更新
    }

    setTimeout(loadNextQuestion, 3000); // 次の問題に進む
}

function endGame() {
    document.querySelector('.game-container').style.display = 'none';
    document.querySelector('.mode-selection').style.display = 'block';
    
    Swal.fire({
        title: 'リミテッドモード終了！',
        text: `お疲れ様でした！\n正解数: ${correctAnswers}/${maxQuestions}`,
        icon: 'success',
        confirmButtonText: 'OK'
    });
}

function resetGame() {
    document.querySelector('.mode-selection').style.display = 'block';
    document.querySelector('.game-type-selection').style.display = 'none';
    document.querySelector('.game-container').style.display = 'none';
    document.getElementById("input-mode").style.display = 'none';
    document.getElementById("multiple-choice-mode").style.display = 'none';
    document.getElementById("remaining-count").style.display = 'none';
}

loadPokemonData(); 