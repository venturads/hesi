let allQuestions = [];
let questions = [];
let weakQuestions = [];
let current = 0;
let score = 0;
let total = 0;

fetch('./questions.json')
  .then(res => res.json())
  .then(data => {
    allQuestions = data;
    questions = [...allQuestions];
    loadQuestion();
  });

function loadQuestion() {
  if (questions.length === 0) return;

  document.getElementById("question").innerText = questions[current].question;
  document.getElementById("user-answer").value = "";
  document.getElementById("feedback").innerText = "";
  document.getElementById("explanation").innerText = "";
  document.getElementById("choices").classList.add("hidden");
  updateScore();
}

function checkAnswer() {
  const userAnswer = document.getElementById("user-answer").value.toLowerCase();
  const correct = questions[current].answer.toLowerCase();

  total++;

  if (userAnswer.includes(correct)) {
    score++;
    document.getElementById("feedback").innerText = "✅ Correct";
  } else {
    document.getElementById("feedback").innerText = "❌ Incorrect";
    weakQuestions.push(questions[current]);
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

  if (current >= questions.length) {
    if (weakQuestions.length > 0) {
      questions = [...weakQuestions];
      weakQuestions = [];
      current = 0;
      alert("Reviewing weak areas 🔁");
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

function filterCategory() {
  const selected = document.getElementById("category").value;

  if (selected === "All") {
    questions = [...allQuestions];
  } else {
    questions = allQuestions.filter(q => q.category === selected);
  }

  current = 0;
  weakQuestions = [];
  loadQuestion();
}
