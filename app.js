let questions = [];
let current = 0;
let score = 0;
let total = 0;
let weak = [];

fetch('./questions.json')
  .then(res => res.json())
  .then(data => {
    questions = shuffle([...data]);
    loadQuestion();
  });

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    let j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

function loadQuestion(){
  const q = questions[current];
  document.getElementById("question").innerText = q.question;
  document.getElementById("feedback").innerText = "";
  document.getElementById("explanation").innerText = "";

  const div = document.getElementById("choices");
  div.innerHTML = "";

  let choices = shuffle([...q.choices]);

  choices.forEach(c=>{
    const btn = document.createElement("button");
    btn.innerText = c;

    btn.onclick = ()=>{
      total++;

      if(c.toLowerCase() === q.answer.toLowerCase()){
        score++;
        btn.classList.add("correct");
        document.getElementById("feedback").innerText = "✅ Correct";
      } else {
        btn.classList.add("wrong");
        weak.push(q);
        document.getElementById("feedback").innerText = "❌ Incorrect";
      }

      document.getElementById("explanation").innerText =
        "Answer: " + q.answer + "\n" + q.explanation;

      updateScore();
      disableButtons();
    };

    div.appendChild(btn);
  });

  updateScore();
}

function disableButtons(){
  const buttons = document.querySelectorAll("#choices button");
  buttons.forEach(b=>b.disabled = true);
}

function nextQuestion(){
  current++;

  if(current >= questions.length){
    if(weak.length > 0){
      questions = shuffle([...weak]);
      weak = [];
      current = 0;
      alert("Reviewing weak questions");
    } else {
      questions = shuffle([...questions]);
      current = 0;
    }
  }

  loadQuestion();
}

function updateScore(){
  document.getElementById("score").innerText =
    "Score: " + score + " / " + total;
}
