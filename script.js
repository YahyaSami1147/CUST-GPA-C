let subjectCount = 1;
    let categoryCounts = {};

    function initializeSubjects() {
      const container = document.getElementById('subject-container');
      container.innerHTML = `
        <div class="subject-row" id="subject-row-0">
          <input type="text" placeholder="Subject Name" id="subject0">
          <input type="number" placeholder="CH" min="1" id="credits0">
          <div id="category-container0"></div>
          <button class="add-category-btn" id="addCategory0" onclick="addCategory(0)">Add Category</button>
          <button class="remove-category-btn" id="removeCategory0" onclick="removeCategory(0)" style="display: none;">Remove</button>
        </div>
      `;
      categoryCounts[0] = 0;
      toggleMode();
    }

    function toggleMode() {
      const useDirect = document.getElementById('useDirectMarks');
      const useGradeLetters = document.getElementById('useGradeLetters');

      if (useDirect.checked && useGradeLetters.checked) {
        if (event && event.target === useGradeLetters) {
          useDirect.checked = false;
        } else {
          useGradeLetters.checked = false;
        }
      }

      for (let i = 0; i < subjectCount; i++) {
        const container = document.getElementById(`category-container${i}`);
        const addCategoryButton = document.getElementById(`addCategory${i}`);
        const removeCategoryButton = document.getElementById(`removeCategory${i}`);
        if (useDirect.checked && container) {
          container.innerHTML = `<input type="number" placeholder="%" min="0" max="100" id="directMarks${i}">`;
          addCategoryButton.style.display = 'none';
          removeCategoryButton.style.display = 'none';
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
          addCategoryButton.style.display = 'none';
          removeCategoryButton.style.display = 'none';
        } else if (!useDirect.checked && !useGradeLetters.checked && container) {
          if (!container.querySelector('.category-row')) {
            container.innerHTML = '';
          }
          addCategoryButton.style.display = 'inline-block';
          removeCategoryButton.style.display = categoryCounts[i] > 0 ? 'inline-block' : 'none';
        }
      }
    }

    function addSubject() {
      const container = document.getElementById('subject-container');
      const div = document.createElement('div');
      div.className = 'subject-row';
      div.id = `subject-row-${subjectCount}`;
      div.innerHTML = `
        <input type="text" placeholder="Subject Name" id="subject${subjectCount}">
        <input type="number" placeholder="CH" min="1" id="credits${subjectCount}">
        <div id="category-container${subjectCount}"></div>
        <button class="add-category-btn" id="addCategory${subjectCount}" onclick="addCategory(${subjectCount})">Add Category</button>
        <button class="remove-category-btn" id="removeCategory${subjectCount}" onclick="removeCategory(${subjectCount})" style="display: none;">Remove</button>
      `;
      container.appendChild(div);
      categoryCounts[subjectCount] = 0;
      subjectCount++;
      toggleMode();
    }

    function addCategory(subjectIndex) {
      const container = document.getElementById(`category-container${subjectIndex}`);
      if (!container) return;
      const categoryIndex = categoryCounts[subjectIndex] || 0;
      const div = document.createElement('div');
      div.className = 'input-group category-row';
      div.id = `category-row-${subjectIndex}-${categoryIndex}`;
      div.innerHTML = `
        <input type="text" placeholder="Category (e.g., Quiz)" id="categoryName${subjectIndex}_${categoryIndex}">
        <input type="number" placeholder="%" min="0" max="100" id="categoryPercent${subjectIndex}_${categoryIndex}">
        <input type="number" placeholder="Weight (%)" min="0" max="100" id="categoryWeight${subjectIndex}_${categoryIndex}">
      `;
      container.appendChild(div);
      categoryCounts[subjectIndex] = categoryIndex + 1;
      document.getElementById(`removeCategory${subjectIndex}`).style.display = 'inline-block';
    }

    function removeCategory(subjectIndex) {
      const categoryCount = categoryCounts[subjectIndex] || 0;
      if (categoryCount > 0) {
        const container = document.getElementById(`category-container${subjectIndex}`);
        const lastCategory = document.getElementById(`category-row-${subjectIndex}-${categoryCount - 1}`);
        if (lastCategory) {
          container.removeChild(lastCategory);
          categoryCounts[subjectIndex]--;
          if (categoryCounts[subjectIndex] === 0) {
            document.getElementById(`removeCategory${subjectIndex}`).style.display = 'none';
          }
        }
      }
    }

    function calculateWeightedMarks(percentage, weight) {
      return (percentage / 100) * weight;
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

    function getGradePointFromLetter(grade) {
      const gradePoints = {
        'A': 4.00, 'A-': 3.67, 'B+': 3.33, 'B': 3.00, 'B-': 2.67,
        'C+': 2.33, 'C': 2.00, 'C-': 1.67, 'D+': 1.33, 'D': 1.00, 'F': 0.00
      };
      return gradePoints[grade] || 0.00;
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
          const categoryCount = categoryCounts[i] || 0;
          for (let j = 0; j < categoryCount; j++) {
            const percentage = parseFloat(document.getElementById(`categoryPercent${i}_${j}`).value) || 0;
            const weight = parseFloat(document.getElementById(`categoryWeight${i}_${j}`).value) || 0;
            if (percentage > 0 && weight > 0) {
              const weightedMarks = calculateWeightedMarks(percentage, weight);
              finalMarksTotal += weightedMarks;
              totalWeight += weight;
            }
          }
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
