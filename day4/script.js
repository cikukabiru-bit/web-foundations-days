// Select all the elements
const noteText = document.querySelector("#note-text");
const charCount = document.querySelector("#char-count");
const wordCount = document.querySelector("#word-count");
const clearBtn = document.querySelector("#clear-btn");
const themeToggle = document.querySelector("#theme-toggle");

// updateCounts(): both counters + warning classes
function updateCounts() {
 let text = noteText.value;
  let chars = text.length;
  
  let words = 0;
   if (text.trim() !== "") {
    words = text.trim().split(/\s+/).length; // split wherever there are spaces, then count the pieces
  }

  charCount.textContent = chars + " / 200 characters";
  wordCount.textContent = words + " words";

  if (chars > 180) {
    charCount.classList.add("warning");
  } else {
    charCount.classList.remove("warning");
  }

  if (chars > 200) {
    charCount.classList.add("over");
  } else {
    charCount.classList.remove("over");
  }
}

// On every input: update counts and save the draft
noteText.addEventListener("input", function () {
  updateCounts();
  localStorage.setItem("draft", noteText.value);
});

// Clear button and Escape key clear everything
function clearAll() {
  noteText.value = "";
  updateCounts();
  localStorage.removeItem("draft");
}

clearBtn.addEventListener("click", clearAll);

noteText.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    clearAll();
  }
});

// Theme button toggles dark mode and remembers the choice
function applyThemeLabel() {
  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "Light mode";
  } else {
    themeToggle.textContent = "Dark mode";
  }
}

themeToggle.addEventListener("click", function () {
  document.body.classList.toggle("dark");
  applyThemeLabel();

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});

// On page load: restore draft and theme, then updateCounts()
const savedDraft = localStorage.getItem("draft");
if (savedDraft !== null) {
  noteText.value = savedDraft;
}

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}
applyThemeLabel();

updateCounts();