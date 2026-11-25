// Simple interactive quiz

const QUESTIONS = [
  { q: "What does HTML stand for?",
    options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyperlinks and Text Markup Language", "Home Tool Markup Language"],
    answer: 0 },
  { q: "Which HTML tag is used to create a hyperlink?",
    options: ["<link>", "<a>", "<href>", "<url>"],
    answer: 1 },
  { q: "Which CSS property changes the text colour?",
    options: ["font-color", "text-color", "color", "foreground"],
    answer: 2 },
  { q: "Which keyword declares a block-scoped variable that cannot be reassigned?",
    options: ["var", "let", "const", "static"],
    answer: 2 },
  { q: "What is the output of typeof null in JavaScript?",
    options: ["\"null\"", "\"undefined\"", "\"object\"", "\"number\""],
    answer: 2 },
  { q: "Which method adds an element to the end of an array?",
    options: ["push()", "pop()", "shift()", "unshift()"],
    answer: 0 },
  { q: "Which HTML element is used for the largest heading?",
    options: ["<head>", "<h6>", "<heading>", "<h1>"],
    answer: 3 },
  { q: "How do you select an element with id \"main\" in CSS?",
    options: [".main", "#main", "main", "*main"],
    answer: 1 },
  { q: "Which event fires when a user clicks an HTML element?",
    options: ["onmouseover", "onchange", "onclick", "onload"],
    answer: 2 },
  { q: "What does === check in JavaScript?",
    options: ["Value only", "Type only", "Value and type", "Assignment"],
    answer: 2 },
];

const TIME_PER_QUESTION = 15;

const $ = (id) => document.getElementById(id);
const screens = {
  start: $("startScreen"),
  question: $("questionScreen"),
  result: $("resultScreen"),
};

let order = [];
let current = 0;
let score = 0;
let answers = [];
let timerId = null;
let timeLeft = TIME_PER_QUESTION;

$("totalQ").textContent = QUESTIONS.length;
$("timeLimit").textContent = TIME_PER_QUESTION;

function show(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startQuiz() {
  order = shuffle(QUESTIONS.map((_, i) => i));
  current = 0;
  score = 0;
  answers = [];
  $("score").textContent = 0;
  show("question");
  renderQuestion();
}

function renderQuestion() {
  const item = QUESTIONS[order[current]];
  $("progressText").textContent = `Question ${current + 1} / ${QUESTIONS.length}`;
  $("progressFill").style.width = `${(current / QUESTIONS.length) * 100}%`;
  $("questionText").textContent = item.q;
  $("feedback").textContent = "";
  $("feedback").className = "feedback";
  $("nextBtn").disabled = true;
  $("nextBtn").textContent = current === QUESTIONS.length - 1 ? "Finish" : "Next";

  const box = $("options");
  box.innerHTML = "";
  item.options.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = `${String.fromCharCode(65 + i)}. ${text}`;
    btn.addEventListener("click", () => selectAnswer(i));
    box.appendChild(btn);
  });

  startTimer();
}

function startTimer() {
  clearInterval(timerId);
  timeLeft = TIME_PER_QUESTION;
  updateTimer();
  timerId = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) selectAnswer(-1); // time up
  }, 1000);
}

function updateTimer() {
  const t = $("timer");
  t.textContent = `${timeLeft}s`;
  t.classList.toggle("low", timeLeft <= 5);
}

function selectAnswer(choice) {
  clearInterval(timerId);
  const item = QUESTIONS[order[current]];
  const buttons = $("options").querySelectorAll(".option");
  buttons.forEach((b) => (b.disabled = true));
  buttons[item.answer].classList.add("correct");

  const fb = $("feedback");
  const isCorrect = choice === item.answer;
  if (isCorrect) {
    score++;
    $("score").textContent = score;
    fb.textContent = "Correct! Well done.";
    fb.classList.add("good");
  } else {
    if (choice >= 0) buttons[choice].classList.add("wrong");
    fb.textContent = choice < 0
      ? `Time's up! Correct answer: ${item.options[item.answer]}`
      : `Wrong! Correct answer: ${item.options[item.answer]}`;
    fb.classList.add("bad");
  }

  answers.push({ item, choice, isCorrect });
  $("nextBtn").disabled = false;
  $("nextBtn").focus();
}

function next() {
  current++;
  if (current < QUESTIONS.length) renderQuestion();
  else showResult();
}

function showResult() {
  $("progressFill").style.width = "100%";
  $("finalScore").textContent = score;
  $("finalTotal").textContent = QUESTIONS.length;

  const pct = (score / QUESTIONS.length) * 100;
  $("remark").textContent =
    pct === 100 ? "Perfect score! Outstanding!" :
    pct >= 80   ? "Excellent work!" :
    pct >= 50   ? "Good effort, keep practising!" :
                  "Keep learning and try again!";

  const list = $("review");
  list.innerHTML = "";
  answers.forEach(({ item, choice, isCorrect }) => {
    const li = document.createElement("li");
    const yours = choice < 0 ? "No answer (time up)" : item.options[choice];
    li.innerHTML = `<b></b><br><span class="${isCorrect ? "ans-ok" : "ans-bad"}">Your answer: <span class="y"></span></span>` +
      (isCorrect ? "" : `<br><span class="ans-ok">Correct: <span class="c"></span></span>`);
    li.querySelector("b").textContent = item.q;
    li.querySelector(".y").textContent = yours;
    if (!isCorrect) li.querySelector(".c").textContent = item.options[item.answer];
    list.appendChild(li);
  });

  show("result");
}

$("startBtn").addEventListener("click", startQuiz);
$("nextBtn").addEventListener("click", next);
$("restartBtn").addEventListener("click", startQuiz);
