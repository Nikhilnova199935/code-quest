/* =====================================================
   CODE QUEST - script.js
   Quiz logic using only Vanilla JavaScript
   ===================================================== */


/* ==================== 1. QUESTION DATA ==================== */
/* Each quest has a name and a list of 5 questions.
   For every question:
   - question: the text shown to the user
   - options:  the 4 answer choices
   - answer:   the position of the correct option (0 = first, 1 = second, 2 = third, 3 = fourth) */
const questionBank = {
  html: {
    name: "HTML Quest",
    questions: [
      {
        question: "What does HTML stand for?",
        options: [
          "HyperText Markup Language",
          "High Text Machine Language",
          "HyperTool Multi Language",
          "Home Text Markup Level"
        ],
        answer: 0
      },
      {
        question: "Which tag creates the largest heading on a page?",
        options: ["<heading>", "<h6>", "<head>", "<h1>"],
        answer: 3
      },
      {
        question: "Which tag is used to create a hyperlink?",
        options: ["<link>", "<a>", "<href>", "<url>"],
        answer: 1
      },
      {
        question: "Which attribute tells an <img> tag which image file to show?",
        options: ["alt", "href", "src", "title"],
        answer: 2
      },
      {
        question: "Which tag creates an unordered (bullet) list?",
        options: ["<ul>", "<ol>", "<li>", "<list>"],
        answer: 0
      }
    ]
  },

  css: {
    name: "CSS Quest",
    questions: [
      {
        question: "What does CSS stand for?",
        options: [
          "Creative Style System",
          "Cascading Style Sheets",
          "Computer Style Sheets",
          "Colorful Style Syntax"
        ],
        answer: 1
      },
      {
        question: "Which CSS property changes the color of text?",
        options: ["text-color", "font-color", "color", "background"],
        answer: 2
      },
      {
        question: "How do you select the element with id=\"main\" in CSS?",
        options: ["#main", ".main", "main#", "*main"],
        answer: 0
      },
      {
        question: "Which property adds space OUTSIDE an element's border?",
        options: ["padding", "border", "spacing", "margin"],
        answer: 3
      },
      {
        question: "Which declaration turns an element into a Flexbox container?",
        options: [
          "display: flex;",
          "display: block;",
          "flex: display;",
          "position: flex;"
        ],
        answer: 0
      }
    ]
  },

  js: {
    name: "JavaScript Quest",
    questions: [
      {
        question: "Which keyword declares a variable that cannot be reassigned?",
        options: ["let", "var", "const", "set"],
        answer: 2
      },
      {
        question: "Which statement prints a message to the browser console?",
        options: ["print(\"Hi\")", "console.log(\"Hi\")", "echo(\"Hi\")", "log.console(\"Hi\")"],
        answer: 1
      },
      {
        question: "What is the result of 5 + \"5\" in JavaScript?",
        options: ["\"55\"", "10", "NaN", "Error"],
        answer: 0
      },
      {
        question: "Which is the correct way to create a function?",
        options: [
          "create myFunction() {}",
          "function = myFunction() {}",
          "function myFunction() {}",
          "def myFunction() {}"
        ],
        answer: 2
      },
      {
        question: "Which method selects an element by its id?",
        options: [
          "document.findId()",
          "document.getElement()",
          "document.selectId()",
          "document.getElementById()"
        ],
        answer: 3
      }
    ]
  }
};

// How much XP a correct answer is worth
const XP_PER_CORRECT = 10;


/* ==================== 2. DOM SELECTION ==================== */
/* Store the HTML elements in variables so we can use them later. */

// Main panels
const questSelection = document.getElementById("quest-selection");
const quizArea = document.getElementById("quiz-area");
const resultScreen = document.getElementById("result-screen");

// Quest buttons (all three "Begin" buttons)
const questButtons = document.querySelectorAll(".quest-btn");

// Quiz elements
const quizQuestName = document.getElementById("quiz-quest-name");
const xpDisplay = document.getElementById("xp-display");
const questionCounter = document.getElementById("question-counter");
const progressTrack = document.querySelector(".progress-track");
const progressFill = document.getElementById("progress-fill");
const questionText = document.getElementById("question-text");
const optionButtons = document.querySelectorAll(".option-btn");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");

// Result elements
const resultRank = document.getElementById("result-rank");
const resultXp = document.getElementById("result-xp");
const resultScore = document.getElementById("result-score");
const resultMessage = document.getElementById("result-message");
const restartBtn = document.getElementById("restart-btn");
const chooseAnotherBtn = document.getElementById("choose-another-btn");


/* ==================== 3. QUIZ STATE ==================== */
/* These variables remember what is happening in the quiz right now. */
let currentQuestKey = "";     // "html", "css" or "js"
let currentQuestions = [];    // the 5 questions of the selected quest
let currentIndex = 0;         // which question we are on (0 = first)
let xp = 0;                   // total XP earned
let score = 0;                // number of correct answers
let answered = false;         // has the user answered the current question?


/* ==================== 4. START A QUEST ==================== */
function startQuest(questKey) {
  // Safety check: stop if the quest name does not exist
  if (!questionBank[questKey]) {
    return;
  }

  // Remember which quest was chosen and load its questions
  currentQuestKey = questKey;
  currentQuestions = questionBank[questKey].questions;

  // Reset everything for a fresh start
  currentIndex = 0;
  xp = 0;
  score = 0;

  // Show the quest name
  quizQuestName.textContent = questionBank[questKey].name;

  // Show only the quiz panel
  questSelection.classList.add("hidden");
  resultScreen.classList.add("hidden");
  quizArea.classList.remove("hidden");

  // Display the first question
  loadQuestion();
}


/* ==================== 5. LOAD A QUESTION ==================== */
function loadQuestion() {
  const currentQuestion = currentQuestions[currentIndex];

  // A new question has not been answered yet
  answered = false;

  // Show the question text, counter and XP
  questionText.textContent = currentQuestion.question;
  questionCounter.textContent =
    "Question " + (currentIndex + 1) + " of " + currentQuestions.length;
  xpDisplay.textContent = xp;

  // Fill the 4 option buttons and clear any old colors
  optionButtons.forEach(function (button, index) {
    button.textContent = currentQuestion.options[index];
    button.classList.remove("correct", "wrong");
    button.disabled = false;
  });

  // Clear the feedback message
  feedback.textContent = "";
  feedback.classList.remove("correct", "wrong");

  // Hide the Next button until the user answers
  nextBtn.classList.add("hidden");

  // Progress shows how many questions are already finished
  updateProgress(currentIndex);
}


/* ==================== 6. PROGRESS BAR ==================== */
function updateProgress(completedQuestions) {
  const percent = Math.round((completedQuestions / currentQuestions.length) * 100);

  // Change the width of the bar (the CSS transition makes it smooth)
  progressFill.style.width = percent + "%";

  // Update the accessibility value for screen readers
  progressTrack.setAttribute("aria-valuenow", percent);
}


/* ==================== 7. CHECK AN ANSWER ==================== */
function checkAnswer(selectedIndex) {
  // Allow only one answer per question
  if (answered) {
    return;
  }
  answered = true;

  const currentQuestion = currentQuestions[currentIndex];
  const correctIndex = currentQuestion.answer;

  if (selectedIndex === correctIndex) {
    // Correct answer
    optionButtons[selectedIndex].classList.add("correct");
    xp = xp + XP_PER_CORRECT;
    score = score + 1;
    feedback.textContent = "Correct! +" + XP_PER_CORRECT + " XP";
    feedback.classList.add("correct");
  } else {
    // Wrong answer: mark it red and reveal the right one in green
    optionButtons[selectedIndex].classList.add("wrong");
    optionButtons[correctIndex].classList.add("correct");
    feedback.textContent =
      "Wrong! The correct answer is: " + currentQuestion.options[correctIndex];
    feedback.classList.add("wrong");
  }

  // Lock all answer buttons
  optionButtons.forEach(function (button) {
    button.disabled = true;
  });

  // Update XP and progress on screen
  xpDisplay.textContent = xp;
  updateProgress(currentIndex + 1);

  // Show the Next button (with a different label on the last question)
  if (currentIndex === currentQuestions.length - 1) {
    nextBtn.textContent = "See Result";
  } else {
    nextBtn.textContent = "Next";
  }
  nextBtn.classList.remove("hidden");
}


/* ==================== 8. RESULT SCREEN ==================== */
function showResult() {
  // Switch panels
  quizArea.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  // Show XP and score
  resultXp.textContent = xp;
  resultScore.textContent = score + "/" + currentQuestions.length;

  // Choose a rank and message based on the score
  if (score === 5) {
    resultRank.textContent = "Quest Master";
    resultMessage.textContent = "Perfect score! You conquered every question.";
  } else if (score === 4) {
    resultRank.textContent = "Code Warrior";
    resultMessage.textContent = "Great job! You are almost at the top.";
  } else if (score === 3) {
    resultRank.textContent = "Code Explorer";
    resultMessage.textContent = "Nice effort! Keep practicing to level up.";
  } else {
    resultRank.textContent = "Code Rookie";
    resultMessage.textContent = "Every coder starts somewhere. Try again and earn more XP!";
  }
}


/* ==================== 9. EVENT LISTENERS ==================== */

// "Begin" buttons: start the quest named in data-quest
questButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const selectedQuest = button.dataset.quest;
    startQuest(selectedQuest);
  });
});

// Answer buttons: check the answer that was clicked
optionButtons.forEach(function (button, index) {
  button.addEventListener("click", function () {
    checkAnswer(index);
  });
});

// Next button: go to the next question or show the result
nextBtn.addEventListener("click", function () {
  currentIndex = currentIndex + 1;

  if (currentIndex < currentQuestions.length) {
    loadQuestion();
  } else {
    showResult();
  }
});

// Restart button: play the same quest again
restartBtn.addEventListener("click", function () {
  startQuest(currentQuestKey);
});

// Choose Another Quest button: go back to the quest cards
chooseAnotherBtn.addEventListener("click", function () {
  resultScreen.classList.add("hidden");
  quizArea.classList.add("hidden");
  questSelection.classList.remove("hidden");
});