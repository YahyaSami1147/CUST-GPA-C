let subjectCount = 1;
let currentSubject = 0;

function initializeSubjects() {
  const container = document.getElementById('subject-container');
  container.innerHTML = `
    <div class="subject-row" id="subject-row-0">
      <input type="text" placeholder="Subject Name" id="subject0">
      <input type="number" placeholder="Credit Hours" min="1" id="credits0">
      <div id="category-container0"></div>
    </div>
  `;
  toggleMode();
}

function toggleMode() {
  const useDirect = document.getElementById('useDirectMarks');
  const useGradeLetters = document.getElementById('useGradeLetters');

  // Prevent both checkboxes from being checked
  if (useDirect.checked && useGradeLetters.checked) {
    if (event && event.target === useGradeLetters) {
      useDirect.checked = false;
    } else {
      useGradeLetters.checked = false;
    }
  }

  const buttons = ['addQuiz', 'addAssignment', 'addProject', 'addMid', 'addFinal'];
  for (let i = 0; i < subjectCount; i++) {
    const container = document.getElementById(`category-container${i}`);
    if (useDirect.checked && container) {
      container.innerHTML = `<input type="number" placeholder="Marks (%)" min="0" max="100" id="directMarks${i}">`;
    } else if (useGradeLetters.checked && container) {
      container.innerHTML = `
        <select id="gradeLetter${i}">
          <option value="A">A</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B">B</option>
          <option value="B-">B-</option>
          <option value="C+">C+</option>
          <option value="C">C</option>
          <option value="C-">C-</option>
          <option value="D+">D+</option>
          <option value="D">D</option>
          <option value="F">F</option>
        </select>
      `;
    } else if (!useDirect.checked && !useGradeLetters.checked && container) {
      // Preserve existing category rows if they exist, otherwise leave empty
      if (!container.querySelector('.category-row')) {
        container.innerHTML = '';
      }
    }
  }

  // Update button visibility based on the current subject
  buttons.forEach(btn => document.getElementById(btn).style.display = (!useDirect.checked && !useGradeLetters.checked) ? 'inline-block' : 'none');
  document.querySelectorAll('.category-row').forEach(row => row.style.display = (!useDirect.checked && !useGradeLetters.checked) ? 'flex' : 'none');
}

function selectSubject(index) {
  currentSubject = parseInt(index);
  // Ensure all subject rows are preserved, only update the selected subject's category container
  toggleMode();
}

function addSubject() {
  const container = document.getElementById('subject-container');
  const div = document.createElement('div');
  div.className = 'subject-row';
  div.id = `subject-row-${subjectCount}`;
  div.innerHTML = `
    <input type="text" placeholder="Subject Name" id="subject${subjectCount}">
    <input type="number" placeholder="Credit Hours" min="1" id="credits${subjectCount}">
    <div id="category-container${subjectCount}"></div>
  `;
  container.appendChild(div);
  const select = document.getElementById('subjectSelect');
  select.innerHTML += `<option value="${subjectCount}">Subject ${subjectCount}</option>`;
  currentSubject = subjectCount;
  select.value = currentSubject;
  subjectCount++;
  toggleMode();
}

function addCategory(category) {
  const container = document.getElementById(`category-container${currentSubject}`);
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'input-group category-row';
  div.innerHTML = `
    <input type="number" placeholder="${category.charAt(0).toUpperCase() + category.slice(1)} Percentage (%)" min="0" max="100" id="${category}Percent${currentSubject}">
    <input type="number" placeholder="Weightage (%)" min="0" max="100" id="${category}Weight${currentSubject}">
  `;
  container.appendChild(div);
}

function calculateWeightedMarks(percentage, weight) {
  return (percentage / 100) * weight; // e.g., 75% of 20% weight = 15
}

function getGradePointFromMarks(marks) {
  if (marks >= 86) return 4.00;
  if (marks >= 82) return 3.67;
  if (marks >= 78) return 3.33;
  if (marks >= 74) return 3.00;
  if (marks >= 70) return 2.67;
  if (marks >= 66) return 2.33;
  if (marks >= 62) return 2.00;
  if (marks >= 58) return 1.67;
  if (marks >= 54) return 1.33;
  if (marks >= 50) return 1.00;
  return 0.00;
}

function getGradePointFromLetter(letter) {
  const gradePoints = { 'A': 4.00, 'A-': 3.67, 'B+': 3.33, 'B': 3.00, 'B-': 2.67, 'C+': 2.33, 'C': 2.00, 'C-': 1.67, 'D+': 1.33, 'D': 1.00, 'F': 0.00 };
  return gradePoints[letter] || 0.00;
}

function calculateGPA() {
  let totalPoints = 0;
  let totalCredits = 0;

  for (let i = 0; i < subjectCount; i++) {
    const credits = parseFloat(document.getElementById(`credits${i}`).value) || 0;
    let finalPoints = 0;

    if (document.getElementById('useDirectMarks').checked) {
      finalPoints = getGradePointFromMarks(parseFloat(document.getElementById(`directMarks${i}`).value) || 0);
    } else if (document.getElementById('useGradeLetters').checked) {
      finalPoints = getGradePointFromLetter(document.getElementById(`gradeLetter${i}`).value || 'F');
    } else {
      let finalMarksTotal = 0;
      let totalWeight = 0;
      const categories = ['quiz', 'assignment', 'project', 'mid', 'final'];
      categories.forEach(cat => {
        const percentage = parseFloat(document.getElementById(`${cat}Percent${i}`).value) || 0;
        const weight = parseFloat(document.getElementById(`${cat}Weight${i}`).value) || 0;
        if (percentage > 0 && weight > 0) {
          const weightedMarks = calculateWeightedMarks(percentage, weight);
          finalMarksTotal += weightedMarks;
          totalWeight += weight;
        }
      });
      if (totalWeight > 0 && totalWeight !== 100) {
        alert(`Weightage for subject ${i + 1} must add up to 100%`);
        return;
      }
      finalPoints = getGradePointFromMarks(finalMarksTotal);
    }

    if (finalPoints > 0 && credits > 0) {
      totalPoints += finalPoints * credits;
      totalCredits += credits;
    }
  }

  const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  document.getElementById('result').innerText = `Your GPA: ${gpa}`;
}

window.onload = initializeSubjects;
