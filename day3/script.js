// Day 3 - Notes Toolkit Functions
// Open DevTools (F12) -> Console to see the results.

let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

const CATEGORIES = ["personal", "work", "study"];

// 1. searchNotes: notes whose text contains the word, ignoring upper/lower case
function searchNotes(word) {
  const search = word.toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(search));
}

// 2. longestNote: the note with the most characters, or null if there are no notes
function longestNote() {
  if (notes.length === 0) {
    return null;
  }
  let longest = notes[0];
  for (const note of notes) {
    if (note.text.length > longest.text.length) {
      longest = note;
    }
  }
  return longest;
}

// 3. countByCategory: how many notes are in each category
function countByCategory() {
  const counts = { personal: 0, work: 0, study: 0 };
  for (const note of notes) {
    counts[note.category] = counts[note.category] + 1;
  }
  return counts;
}

// 4. getSummary: a sentence such as "5 notes: 2 personal, 1 work, 2 study."
function getSummary() {
  const counts = countByCategory();
  const total = notes.length;
  let word = "notes";
  if (total === 1) {
    word = "note";
  }
  return `${total} ${word}: ${counts.personal} personal, ${counts.work} work, ${counts.study} study.`;
}

// 5. isDuplicate: true if a note with the same text already exists
//    (ignoring upper/lower case and extra spaces at the start or end)
function isDuplicate(text) {
  const cleaned = text.trim().toLowerCase();
  return notes.some((note) => note.text.trim().toLowerCase() === cleaned);
}

// 6. addNote: adds a note only if it is valid; returns true or false and logs why
function addNote(text, category) {
  const cleaned = text.trim();

  if (cleaned.length < 1 || cleaned.length > 200) {
    console.log("Not added: a note must be 1-200 characters long.");
    return false;
  }
  if (isDuplicate(cleaned)) {
    console.log(`Not added: "${cleaned}" already exists.`);
    return false;
  }
  if (!CATEGORIES.includes(category)) {
    console.log(`Not added: "${category}" is not a category. Use personal, work or study.`);
    return false;
  }

  notes.push({ id: notes.length + 1, text: cleaned, category: category });
  console.log(`Added: "${cleaned}" (${category})`);
  return true;
}

// ---------------- Tests ----------------

console.log("--- searchNotes ---");
console.log(searchNotes("the")); // 2 notes: id 2 "Finish the Day 3 assignment" and id 3 "Email the project report to Grace"
console.log(searchNotes("JAVASCRIPT")); // 1 note: id 4 "Revise JavaScript arrays" (case is ignored)
console.log(searchNotes("pizza")); // [] (no results)

console.log("--- longestNote ---");
console.log(longestNote()); // { id: 3, text: "Email the project report to Grace", category: "work" }
const savedNotes = notes;
notes = [];
console.log(longestNote()); // null (no notes)
notes = savedNotes;

console.log("--- countByCategory ---");
console.log(countByCategory()); // { personal: 2, work: 1, study: 2 }
notes = [];
console.log(countByCategory()); // { personal: 0, work: 0, study: 0 } (no notes)
notes = savedNotes;

console.log("--- getSummary ---");
console.log(getSummary()); // "5 notes: 2 personal, 1 work, 2 study."
notes = [savedNotes[4]];
console.log(getSummary()); // "1 note: 1 personal, 0 work, 0 study." (singular "note")
notes = savedNotes;

console.log("--- isDuplicate ---");
console.log(isDuplicate("Call mum")); // true
console.log(isDuplicate("  CALL MUM  ")); // true (case and extra spaces ignored)
console.log(isDuplicate("Call dad")); // false

console.log("--- addNote ---");
console.log(addNote("Buy airtime", "personal")); // logs Added: "Buy airtime" (personal), then true
console.log(addNote("buy milk and bread", "personal")); // logs Not added: already exists, then false
console.log(addNote("Plan the weekend", "shopping")); // logs Not added: not a category, then false
console.log(addNote("   ", "work")); // logs Not added: must be 1-200 characters, then false
console.log(addNote("a".repeat(201), "study")); // logs Not added: must be 1-200 characters, then false
console.log(getSummary()); // "6 notes: 3 personal, 1 work, 2 study."