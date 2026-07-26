let questions = [];
let current = 0;
let score = 0;
let total = 0;
let weak = [];

fetch('./questions.json')
  .then(res => res.json())
  .then(data => {
    questions = shuffle(data);
    loadQuestion();
  });

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function loadQuestion() {
  document.getElementById("question").innerText = questions[current].question;
  document.getElementById("user-answer").value = "";
  document.getElementById("feedback").innerText = "";
  document.getElementById("explanation").innerText = "";
  document.getElementById("choices").classList.add("hidden");
  updateScore();
}

function checkAnswer() {
  const user = document.getElementById("user-answer").value.toLowerCase();
  const correct = questions[current].answer.toLowerCase();
  total++;

  if (user.includes(correct)) {
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

  questions[current].choices.forEach(c => {
    const btn = document.createElement("button");
    btn.innerText = c;
    btn.onclick = () => {
      document.getElementById("user-answer").value = c;
    };
    div.appendChild(btn);
  });

  div.classList.remove("hidden");
}

function nextQuestion() {
  current++;

  if (current >= questions.length) {
    if (weak.length > 0) {
      questions = shuffle(weak);
      weak = [];
      current = 0;
      alert("Reviewing weak questions");
    } else {
      current = 0;
    }
  }

  loadQuestion();
}

function updateScore() {
  document.getElementById("score").innerText =
    "Score: " + score + " / " + total;
}
