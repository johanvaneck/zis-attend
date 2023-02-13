let students = [];
let currentStudentNumber = -1;
let grade = null;

const phase1El = document.getElementById('phase1');
const phase2El = document.getElementById('phase2');
const phase3El = document.getElementById('phase3');
const phase4El = document.getElementById('phase4');
const nameEl = document.getElementById('name');
const birthdayEl = document.getElementById('birthday');

const today = new Date().toLocaleDateString();

async function getData() {
  const gradeQuery = grade.replace(/\s/, '+');
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${gradeQuery}!A2:C?key=${apiKey}`
  )
    .then((response) => response.json())
    .then((data) => {
      data.values.forEach((row) => {
        let birthday;
        if (row[2]) {
          const ddmmyyyy = row[2].split('/');
          const mmddyyyy = `${ddmmyyyy[1]}/${ddmmyyyy[0]}/${ddmmyyyy[2]}`;
          birthday = new Date(mmddyyyy).toLocaleDateString();
        } else {
          birthday = null;
        }
        students.push({
          name: row[0],
          surname: row[1],
          birthday,
          isPresent: null,
        });
      });
      console.log(students);
    })
    .catch((error) => {
      alert(
        "Check your connection...\n\nIf that's working, then contact Johan."
      );
      console.error(error);
    });
}

async function postData() {
  let isSuccess = false;
  const body = {
    worksheetId: '1UzlQscA4446nKpCquNBfxmXtwoKCd4juLqeTBpsDup4',
    sheetName: grade,
    attendance: JSON.stringify(students.map((student) => student.isPresent)),
  };
  let formData = new FormData();
  Object.keys(body).map((key) => formData.append(key, body[key]));

  await fetch(
    'https://script.google.com/macros/s/AKfycbzoUmlF_6CS9O5OzY3AZhdcuPOgZS5sPNwmMAvTIbaSQr8sEKHveSmdBXXb50ho1ko/exec',
    { method: 'POST', body: formData }
  )
    .then((response) => {
      isSuccess = true;
      console.log('Success!', response);
    })
    .catch((error) => console.error('Error!', error.message));
  return isSuccess;
}

function isBirthday(student) {
  if (student.birthday) {
    if (student.birthday.slice(0, 4) === today.slice(0, 4)) {
      return true;
    }
  }
  return false;
}

function nextStudent() {
  currentStudentNumber++;
  nameEl.innerText =
    students[currentStudentNumber].name +
    ' ' +
    students[currentStudentNumber].surname;
  birthdayEl.innerText = isBirthday(students[currentStudentNumber])
    ? `Today is ${students[currentStudentNumber].name}'s birthday!`
    : '';
}

function previousStudent() {
  if (currentStudentNumber > 0) {
    currentStudentNumber--;
    nameEl.innerText =
      students[currentStudentNumber].name +
      ' ' +
      students[currentStudentNumber].surname;
    birthdayEl.innerText = isBirthday(students[currentStudentNumber])
      ? `Today is ${students[currentStudentNumber].name}'s birthday!`
      : '';
  }
}

async function takeAttendance(isPresent) {
  students[currentStudentNumber].isPresent = isPresent;
  if (currentStudentNumber === students.length - 1) {
    phase2El.style.display = 'none';
    phase3El.style.display = 'flex';

    let htmlString = `<tr><th>Name</th><th>Present</th></tr>`;
    students.forEach((student) => {
      htmlString += `<tr><td>${student.name} ${student.surname}</td><td>${
        student.isPresent ? 'Yes' : 'No'
      }</td></tr>`;
    });
    document.querySelector('table').innerHTML = htmlString;
    // post data back to spreadsheet
  } else {
    nextStudent();
  }
}

const buttons = document.querySelectorAll('button');
buttons.forEach(async function (button) {
  button.addEventListener('click', async function () {
    const clickedButton = this.innerText;
    switch (clickedButton) {
      case 'Grade RR':
      case 'Grade R':
      case 'Grade 1':
      case 'Grade 2':
      case 'Grade 3':
      case 'Grade 4':
      case 'Grade 5':
      case 'Grade 6':
      case 'Grade 7':
        grade = clickedButton;
        await getData();
        nextStudent();
        phase1El.style.display = 'none';
        phase2El.style.display = 'flex';
        break;
      case 'Previous':
        previousStudent();
        break;
      case 'Absent':
        takeAttendance(false);
        break;
      case 'Present':
        takeAttendance(true);
        break;
      case 'Submit':
        const success = await postData();
        if (success) {
          phase3El.style.display = 'none';
          phase4El.style.display = 'flex';
        }
        break;
      case 'New Attendance':
        location.reload();
        break;
    }
  });
});
