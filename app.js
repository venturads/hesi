let questions = [];
let current = 0;
let score = 0;
let total = 0;
let weak = [];

// Load questions
fetch('./questions.json')
  .then(res => res.json())
  .then(data => {
    questions = shuffle([...data]); // safe copy
    loadQuestion();
  });

// Better shuffle (Fisher-Yates)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function loadQuestion() {
  if (!questions.length) return;

  const q = questions[current];

  document.getElementById("question").innerText = q.question;
  document.getElementById("user-answer").value = "";
  document.getElementById("feedback").innerText = "";
  document.getElementById("explanation").innerText = "";
  document.getElementById("choices").classList.add("hidden");

  updateScore();
}

function checkAnswer() {
  const user = document.getElementById("user-answer").value.trim().toLowerCase();
  const correct = questions[current].answer.trim().toLowerCase();

  total++;

  if (user === correct) {
    score++;
    document.getElementById("feedback").innerText = "✅ Correct";
  } else {
    weak.push(questions[current]);
    document.getElementById("feedback").innerText = "❌ Incorrect";
  }

  document.getElementById("explanation").innerText =
    "Answer: " + questions[current].answer + "\n" +
    questions[current].explanation;

  updateScore();
}

function showHint() {
  document.getElementById("feedback").innerText =
    "Hint: " + questions[current].hint;
}

function showChoices() {
  const div = document.getElementById("choices");
  div.innerHTML = "";

  questions[current].choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.innerText = choice;

    btn.onclick = () => {
      document.getElementById("user-answer").value = choice;
    };

    div.appendChild(btn);
  });

  div.classList.remove("hidden");
}

function nextQuestion() {
  current++;

  // If finished main set
  if (current >= questions.length) {
    if (weak.length > 0) {
      questions = shuffle([...weak]);
      weak = [];
      current = 0;
      alert("Reviewing weak questions 🔁");
    } else {
      questions = shuffle([...questions]); // reshuffle
      current = 0;
    }
  }

  loadQuestion();
}

function updateScore() {
  document.getElementById("score").innerText =
    `Score: ${score} / ${total}`;
}
