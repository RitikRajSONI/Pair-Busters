const UNSPLASH_ACCESS_KEY = "lF4OX86z0ZX1x0IOMDQPkaPALdyOqOq9qN-NYjDCHDY";

const gameContainer = document.getElementById("game");
const message = document.getElementById("message");
const resetBtn = document.getElementById("resetBtn");
const timerEl = document.getElementById("timer");
const bestScoreEl = document.getElementById("bestScore");

let cards = [];
let flippedCards = [];
let matchedCards = [];
let lockBoard = false;

let timerInterval;
let elapsedTime = 0;

let gameStarted = false;

// Shuffle helper function
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Fetch images and start the game
async function fetchImagesAndStart() {
  lockBoard = true;
  resetBtn.disabled = true;
  message.textContent = "Loading new game...";
  stopTimer();

  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?count=6&client_id=${UNSPLASH_ACCESS_KEY}`
    );
    if (!res.ok) throw new Error("Failed to fetch images from Unsplash API");
    const data = await res.json();

    const images = data.map(img => img.urls.small);

    // Duplicate images to create pairs, then shuffle
    cards = shuffle([...images, ...images].map((url, index) => ({
      id: index,
      image: url,
    })));

    renderCards();
    message.textContent = "";
    flippedCards = [];
    matchedCards = [];
    lockBoard = false;

    elapsedTime = 0;
    timerEl.textContent = `Time: 0s`;

    startTimer();
    updateBestScoreDisplay();
  } catch (error) {
    message.textContent = "Error loading images. Please try again later.";
    console.error(error);
  } finally {
    resetBtn.disabled = false;
  }
}

// Render cards into DOM
function renderCards() {
  gameContainer.innerHTML = "";
  cards.forEach((card, index) => {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.dataset.index = index;

    cardElement.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back"><img src="${card.image}" alt="Card image" /></div>
      </div>
    `;

    cardElement.addEventListener("click", () => handleCardClick(index, cardElement));
    gameContainer.appendChild(cardElement);
  });
}


function handleCardClick(index, cardElement) {
  if (lockBoard) return;
  if (flippedCards.includes(index) || matchedCards.includes(index)) return;

  flipCard(cardElement);

  if (flippedCards.length === 0) {
    flippedCards.push(index);
  } else if (flippedCards.length === 1) {
    flippedCards.push(index);
    lockBoard = true;
    checkForMatch();
  }
}


function flipCard(cardElement) {
  cardElement.classList.add("flipped");
}


function unflipCards(index1, index2) {
  const cardElements = document.querySelectorAll(".card");
  cardElements[index1].classList.remove("flipped");
  cardElements[index2].classList.remove("flipped");
}


function checkForMatch() {
  const [firstIndex, secondIndex] = flippedCards;

  if (cards[firstIndex].image === cards[secondIndex].image) {
    matchedCards.push(firstIndex, secondIndex);
    flippedCards = [];
    lockBoard = false;

    if (matchedCards.length === cards.length) {
      stopTimer();
      message.textContent = `Game Completed!`;
      saveBestScore(elapsedTime);
      updateBestScoreDisplay();
    }
  } else {
    setTimeout(() => {
      unflipCards(firstIndex, secondIndex);
      flippedCards = [];
      lockBoard = false;
    }, 1000);
  }
}

// Timer functions
function startTimer() {
  clearInterval(timerInterval);
  elapsedTime = 0;
  timerEl.textContent = `Time: 0s`;
  timerInterval = setInterval(() => {
    elapsedTime++;
    timerEl.textContent = `Time: ${elapsedTime}s`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function saveBestScore(time) {
  const storedBest = localStorage.getItem("bestTime");
  if (storedBest === null || time < parseInt(storedBest, 10)) {
    localStorage.setItem("bestTime", time);
  }
}


function updateBestScoreDisplay() {
  const storedBest = localStorage.getItem("bestTime");
  bestScoreEl.textContent = storedBest ? `Best Time: ${storedBest}s` : "Best Time: Not Played Yet";
}



resetBtn.addEventListener("click", () => {
  if (!gameStarted) {
    resetBtn.textContent = "Restart Game";
    gameStarted = true;
  }

  fetchImagesAndStart();
});


