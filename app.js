"use strict";

let masterQuestions = [];
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

  return data.map((item, index) => {
    const options = item.options ?? item.choices;

    if (!item.question || !Array.isArray(options) || options.length < 2 || !item.answer) {
      throw new Error(`Question ${index + 1} is missing a question, options, or answer.`);
    }

    if (!options.some((option) => normalize(option) === normalize(item.answer))) {
      throw new Error(`Question ${index + 1} has an answer that is not in its options.`);
    }

    return { ...item, options: [...options] };
  });
}

async function loadQuestions() {
  setControlsLoading(true);

  try {
    const response = await fetch(`questions.json?v=${Date.now()}`, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Could not load questions.json (HTTP ${response.status}).`);
    }

    masterQuestions = validateQuestions(await response.json());
    startNewQuiz();
  } catch (error) {
    console.error(error);
    topicEl.textContent = "Load error";
    progressEl.textContent = "";
    questionEl.classList.add("error");
    questionEl.textContent =
      "Questions could not load. Upload index.html, style.css, app.js, and questions.json together in the same GitHub folder.";
    explanationEl.classList.add("error");
    explanationEl.textContent = error.message;
    nextButton.disabled = true;
    restartButton.disabled = true;
  }
}

function setControlsLoading(isLoading) {
  nextButton.disabled = true;
  restartButton.disabled = isLoading;
  nextButton.textContent = isLoading ? "Loading…" : "Next Question";
}

function startNewQuiz() {
  questions = shuffle(masterQuestions);
  current = 0;
  score = 0;
  answered = 0;
  isAnswered = false;
  restartButton.disabled = false;
  renderQuestion();
}

function renderQuestion() {
  const q = questions[current];
  if (!q) return;

  isAnswered = false;
  nextButton.disabled = true;
  nextButton.textContent = current === questions.length - 1 ? "See Results" : "Next Question";

  feedbackEl.textContent = "Choose an answer to continue.";
  explanationEl.textContent = "";
  explanationEl.classList.remove("error");
  questionEl.classList.remove("error");
  choicesEl.innerHTML = "";

  topicEl.textContent = q.topic || q.category || "Mixed HESI";
  progressEl.textContent = `Question ${current + 1} of ${questions.length}`;
  questionEl.textContent = q.question;

  shuffle(q.options).forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.textContent = choice;
    button.addEventListener("click", () => checkAnswer(choice, button, q), { once: true });
    choicesEl.appendChild(button);
  });

  updateScore();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function checkAnswer(choice, selectedButton, q) {
  if (isAnswered) return;

  isAnswered = true;
  answered += 1;
  const correct = normalize(choice) === normalize(q.answer);

  if (correct) {
    score += 1;
    selectedButton.classList.add("correct");
    feedbackEl.textContent = "✅ Correct! Tap Next Question.";
  } else {
    selectedButton.classList.add("wrong");
    feedbackEl.textContent = "❌ Not quite. Tap Next Question.";
  }

  choicesEl.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
    if (normalize(button.textContent) === normalize(q.answer)) {
      button.classList.add("reveal");
    }
  });

  const details = [`Answer: ${q.answer}`];
  if (q.explanation) details.push(q.explanation);
  if (q.memoryTip) details.push(`Memory tip: ${q.memoryTip}`);
  explanationEl.textContent = details.join("\n");

  nextButton.disabled = false;
  nextButton.focus({ preventScroll: true });
  updateScore();
}

function nextQuestion() {
  if (nextButton.disabled || !isAnswered) return;

  nextButton.disabled = true;

  if (current < questions.length - 1) {
    current += 1;
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  const percent = questions.length ? Math.round((score / questions.length) * 100) : 0;

  isAnswered = false;
  topicEl.textContent = "Quiz complete";
  progressEl.textContent = `${questions.length} questions`;
  questionEl.textContent = `Final score: ${score} / ${questions.length} (${percent}%)`;
  choicesEl.innerHTML = "";
  feedbackEl.textContent = percent >= 75 ? "🎉 Nice work!" : "💪 Keep practicing—you’re building it.";
  explanationEl.textContent = "Tap Restart Quiz to reshuffle every question and begin again.";
  nextButton.disabled = true;
  nextButton.textContent = "Quiz Finished";
  restartButton.disabled = false;
  restartButton.focus({ preventScroll: true });
}

function restartQuiz() {
  if (restartButton.disabled || masterQuestions.length === 0) return;
  startNewQuiz();
}

function updateScore() {
  scoreEl.textContent = `Score: ${score} / ${answered}`;
}

nextButton.addEventListener("click", nextQuestion);
restartButton.addEventListener("click", restartQuiz);

loadQuestions();
