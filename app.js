"use strict";

let questions = [];
let current = 0;
let score = 0;
let answered = 0;
let isAnswered = false;

const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");
const explanationEl = document.getElementById("explanation");
const scoreEl = document.getElementById("score");
const topicEl = document.getElementById("topic");
const progressEl = document.getElementById("progress");
const nextButton = document.getElementById("nextButton");
const restartButton = document.getElementById("restartButton");

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function validateQuestions(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("questions.json must contain a non-empty array.");
  }

  data.forEach((item, index) => {
    const options = item.options ?? item.choices;
    if (!item.question || !Array.isArray(options) || options.length < 2 || !item.answer) {
      throw new Error(`Question ${index + 1} is missing a question, options, or answer.`);
    }
    item.options = options;
  });

  return data;
}

async function loadQuestions() {
  try {
    const response = await fetch(`questions.json?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Could not load questions.json (HTTP ${response.status}).`);
    }

    const data = await response.json();
    questions = shuffle(validateQuestions(data));
    renderQuestion();
  } catch (error) {
    console.error(error);
    topicEl.textContent = "Load error";
    progressEl.textContent = "";
    questionEl.classList.add("error");
    questionEl.textContent =
      "Questions could not load.\n\nUpload index.html, style.css, app.js, and questions.json together in the same GitHub folder.";
    explanationEl.classList.add("error");
    explanationEl.textContent = error.message;
  }
}

function renderQuestion() {
  const q = questions[current];
  isAnswered = false;
  nextButton.disabled = true;
  feedbackEl.textContent = "";
  explanationEl.textContent = "";
  questionEl.classList.remove("error");
  choicesEl.innerHTML = "";

  topicEl.textContent = q.topic || "Mixed HESI";
  progressEl.textContent = `Question ${current + 1} of ${questions.length}`;
  questionEl.textContent = q.question;

  shuffle(q.options).forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.textContent = choice;
    button.addEventListener("click", () => checkAnswer(choice, button, q));
    choicesEl.appendChild(button);
  });

  updateScore();
}

function checkAnswer(choice, selectedButton, q) {
  if (isAnswered) return;
  isAnswered = true;
  answered += 1;

  const correct = normalize(choice) === normalize(q.answer);
  if (correct) {
    score += 1;
    selectedButton.classList.add("correct");
    feedbackEl.textContent = "✅ Correct!";
  } else {
    selectedButton.classList.add("wrong");
    feedbackEl.textContent = "❌ Not quite.";
  }

  [...choicesEl.querySelectorAll("button")].forEach((button) => {
    button.disabled = true;
    if (normalize(button.textContent) === normalize(q.answer)) {
      button.classList.add("reveal");
    }
  });

  explanationEl.textContent = q.explanation
    ? `Answer: ${q.answer}\n${q.explanation}`
    : `Correct answer: ${q.answer}`;

  nextButton.disabled = false;
  nextButton.textContent = current === questions.length - 1 ? "See Results" : "Next Question";
  updateScore();
}

function nextQuestion() {
  if (!isAnswered) return;

  if (current < questions.length - 1) {
    current += 1;
    renderQuestion();
    return;
  }

  showResults();
}

function showResults() {
  const percent = questions.length ? Math.round((score / questions.length) * 100) : 0;
  topicEl.textContent = "Quiz complete";
  progressEl.textContent = `${questions.length} questions`;
  questionEl.textContent = `Final score: ${score} / ${questions.length} (${percent}%)`;
  choicesEl.innerHTML = "";
  feedbackEl.textContent = percent >= 75 ? "🎉 Nice work!" : "💪 Keep practicing—you’re building it.";
  explanationEl.textContent = "Tap Restart Quiz to reshuffle every question and try again.";
  nextButton.disabled = true;
  nextButton.textContent = "Quiz Finished";
}

function restartQuiz() {
  if (questions.length === 0) return;
  questions = shuffle(questions);
  current = 0;
  score = 0;
  answered = 0;
  renderQuestion();
}

function updateScore() {
  scoreEl.textContent = `Score: ${score} / ${answered}`;
}

nextButton.addEventListener("click", nextQuestion);
restartButton.addEventListener("click", restartQuiz);
loadQuestions();
