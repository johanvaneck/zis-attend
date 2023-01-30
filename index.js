// Import stylesheets
import './style.css';

let header = [];
let students = [];
let currentStudentNumber = 0;
let lastColumn = null;
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
console.log(today);

// hook up Google Sheets
async function getData() {
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${grade}!A2:C?key=${apiKey}`
  )
    .then((response) => response.json())
    .then((data) => {
      data.values.forEach((row, index) => {
        const studentObject = {
          name: row[0],
          surname: row[1],
          birthday: row[2],
          isPresent: today,
          pastAttendance: row.slice(3),
        };
        if (index == 0) {
          header.push(studentObject);
        } else {
          students.push(studentObject);
        }
      });
      lastColumn = data.values[0].length || 0;
      console.log(lastColumn);
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
  const headers = new Headers({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  });

  const options = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      requests: [
        {
          insertDimension: {
            range: {
              sheetId: 0,
              dimension: 'COLUMNS',
              startIndex: 3,
              endIndex: 4,
            },
            inheritFromBefore: false,
          },
        },
      ],
    }),
  };

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    options
  )
    .then((res) => res.json())
    .then((data) => {
      console.log('Blank column inserted successfully');
      console.log(data);
    })
    .catch((error) => console.error('Error inserting blank column: ', error));

  if(data) {
  const values = header.isPresent + students.map((student) => student.isPresent);
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/valueInputOption=USER_ENTERED`,
      JSON.stringify({
        "range": `${grade}!D1:D`,
        "majorDimension": "COLUMNS",
        "values": values,
      })
    )
      .then((res2) => res2.json())
      .then((data2) => {
        phase3El.style.display = 'none';
        phase4El.style.display = 'flex';
        console.log(data2);
      })
      .catch((error2) => console.error('Error writing data: ', error2));
  }
}

function updateStudent(isNext) {
  if (isNext) {
    currentStudentNumber++;
    nameEl.innerText = students[currentStudentNumber].name;
    birthdayEl.innerText =
      currentStudent.birthday == today
        ? `Today is ${currentStudent.name}'s birthday!`
        : '';
  } else if (currentStudentNumber > 0) {
    currentStudentNumber--;
    nameEl.innerText = students[currentStudentNumber].name;
    birthdayEl.innerText =
      currentStudent.birthday == today
        ? `Today is ${currentStudent.name}'s birthday!`
        : '';
  }
}

async function takeAttendance(isPresent) {
  students[currentStudentNumber].isPresent = isPresent;
  console.log(`${currentStudentNumber} : ${students.length - 1}`);
  if (currentStudentNumber == students.length - 1) {
    console.log(students);
    phase2El.style.display = 'none';
    phase3El.style.display = 'flex';
    // post data back to spreadsheet
    let htmlString = `<tr><th>Name</th><th>Present</th></tr>`;
    students.forEach((student) => {
      htmlString += `<tr><td>${student.name} ${student.surname}</td><td>${
        student.isPresent ? 'Yes' : 'No'
      }</td></tr>`;
    });
    document.querySelector('table').innerHTML = htmlString;
    console.log(htmlString);
  } else {
    updateStudent(true);
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
        grade = clickedButton.replace(/\s/, '+');
        await getData();
        nameEl.innerText = students[currentStudentNumber].name;
        phase1El.style.display = 'none';
        phase2El.style.display = 'flex';
        break;
      case 'Previous':
        updateStudent(false);
        break;
      case 'Absent':
        takeAttendance(false);
        break;
      case 'Present':
        takeAttendance(true);
        break;
      case 'Submit':
        await postData();
        break;
      case 'New Attendance':
        location.reload();
        break;
    }
  });
});
