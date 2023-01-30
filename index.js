// Import stylesheets
import './style.css';

let students = [];
let currentStudentNumber = -1;
let grade = null;

const alphabet = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

const spreadsheetId = '1gLEdCIzp41I6zBdWDELA3rqfV-rR34LBNgWp9kgQ-GI';
const apiKey = 'AIzaSyCMLldbok-l2C5hz4mzKEhHqPAzox0pBtk';

const phase1El = document.getElementById('phase1');
const phase2El = document.getElementById('phase2');
const phase3El = document.getElementById('phase3');
const phase4El = document.getElementById('phase4');
const nameEl = document.getElementById('name');
const birthdayEl = document.getElementById('birthday');

const today = new Date().toLocaleDateString();

// hook up Google Sheets
async function getData() {
  const gradeQuery = grade.replace(/\s/, '+');
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${gradeQuery}!A2:C?key=${apiKey}`
  )
    .then((response) => response.json())
    .then((data) => {
      data.values.forEach((row, index) => {
        const ddmmyyyy = row[2].split('/');
        const mmddyyyy = `${ddmmyyyy[1]}/${ddmmyyyy[0]}/${ddmmyyyy[2]}`;
        const birthday = new Date(mmddyyyy).toLocaleDateString();
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
        'Something probably went wrong with the Google Sheet. Contact Johan.'
      );
      console.error(error);
    });
}

async function postData() {
  let isSuccess = false;
  const body = {
    worksheetId: '1gLEdCIzp41I6zBdWDELA3rqfV-rR34LBNgWp9kgQ-GI',
    sheetName: grade,
    attendance: JSON.stringify(students.map((student) => student.isPresent)),
  };
  let formData = new FormData();
  Object.keys(body).map((key) => formData.append(key, body[key]));

  await fetch(
    'https://script.google.com/macros/s/AKfycbz5rW8Ug2VGbzfqS1nE2PhAJvJnHgJezbY2pkeii3Uuc5SUXcLAFJOA3db000NpVDq1/exec',
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
  if (student.birthday.slice(0, 4) === today.slice(0, 4)) {
    return true;
  }
  return false;
}

function nextStudent() {
  currentStudentNumber++;
  nameEl.innerText = students[currentStudentNumber].name;
  birthdayEl.innerText = isBirthday(students[currentStudentNumber])
    ? `Today is ${students[currentStudentNumber].name}'s birthday!`
    : '';
}

function previousStudent() {
  if (currentStudentNumber > 0) {
    currentStudentNumber--;
    nameEl.innerText = students[currentStudentNumber].name;
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
      case 'Grade 0':
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
