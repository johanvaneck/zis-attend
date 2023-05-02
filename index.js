let students = [];
let currentStudentNumber = -1;
let grade = null;

const phase1El = document.getElementById("phase1");
const phase2El = document.getElementById("phase2");
const phase3El = document.getElementById("phase3");
const phase4El = document.getElementById("phase4");
const nameEl = document.getElementById("name");
const birthdayEl = document.getElementById("birthday");

const today = new Date().toLocaleDateString();

const SCRIPT_ID =
  "AKfycbysgwpZKF1g9f8_wNG48KZ7zWX_n20voG4lIiwadNbAr_2RuNiZqte1iZ85qfCph3gs";
const SHEET_ID = "1UzlQscA4446nKpCquNBfxmXtwoKCd4juLqeTBpsDup4";
const SCRIPT_URL = `https://script.google.com/a/macros/zithuleleschool.org/s/${SCRIPT_ID}/exec`;

const getRawData = async (sheetName) => {
  const para = {
    spreadsheetId: SHEET_ID, // Please set your Google Spreadsheet ID.
    sheetName, // Please set the sheet name you want to retrieve the values.
  };
  const q = new URLSearchParams(para);
  const url = SCRIPT_URL + "?" + q;
  const response = await fetch(url);
  const json = await response.json();
  const values = await json.values;
  return values;
};

async function getData() {
  const values = await getRawData(grade);
  values.slice(1).forEach((row) => {
    let birthday;
    if (row[2]) {
      const ddmmyyyy = row[2].split("/");
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
}

async function postData() {
  let isSuccess = false;
  const body = {
    worksheetId: SHEET_ID,
    sheetName: grade,
    attendance: JSON.stringify(students.map((student) => student.isPresent)),
  };
  let formData = new FormData();
  Object.keys(body).map((key) => formData.append(key, body[key]));

  await fetch(SCRIPT_URL, { method: "POST", body: formData })
    .then((response) => {
      isSuccess = true;
      console.log("Success!", response);
    })
    .catch((error) => console.error("Error!", error.message));
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
    " " +
    students[currentStudentNumber].surname;
  birthdayEl.innerText = isBirthday(students[currentStudentNumber])
    ? `Today is ${students[currentStudentNumber].name}'s birthday!`
    : "";
}

function previousStudent() {
  if (currentStudentNumber > 0) {
    currentStudentNumber--;
    nameEl.innerText =
      students[currentStudentNumber].name +
      " " +
      students[currentStudentNumber].surname;
    birthdayEl.innerText = isBirthday(students[currentStudentNumber])
      ? `Today is ${students[currentStudentNumber].name}'s birthday!`
      : "";
  }
}

async function takeAttendance(isPresent) {
  students[currentStudentNumber].isPresent = isPresent;
  if (currentStudentNumber === students.length - 1) {
    phase2El.style.display = "none";
    phase3El.style.display = "flex";

    let htmlString = `<tr><th>Name</th><th>Present</th></tr>`;
    students.forEach((student) => {
      htmlString += `<tr><td>${student.name} ${student.surname}</td><td>${
        student.isPresent ? "Yes" : "No"
      }</td></tr>`;
    });
    document.querySelector("table").innerHTML = htmlString;
    // post data back to spreadsheet
  } else {
    nextStudent();
  }
}

function generateSelect() {
  const reasons = {
    1: "No Valid reason",
    2: "Access to Transport",
    3: "Act of nature",
    4: "Court Appointment",
    5: "Extra Mural",
    6: "Death Family member",
    7: "Drivers License",
    8: "Exceptional circumstances",
    9: "Family responsibilities",
    10: "Hospitalised",
    11: "Lack of funds",
    12: "Medical Appointment",
    13: "On holiday",
    14: "Physical/Psychological illness",
    15: "Pregnancy",
    16: "Religious/cultural observances",
    17: "School tour",
    18: "Sick",
    19: "Study Leave",
    20: "Suspension by SMT",
    21: "Suspension by SGB",
  };

  const select = document.querySelector('#select-reason')
  Object.keys(reasons).forEach((key) => {
    const option = document.createElement("option");
    option.innerHTML = key;
    option.value = reasons[key];
    select.appendChild(option);
  });
}

const buttons = document.querySelectorAll("button");
buttons.forEach(async function (button) {
  button.addEventListener("click", async function () {
    const clickedButton = this.innerText;
    switch (clickedButton) {
      case "Grade RR":
      case "Grade R":
      case "Grade 1":
      case "Grade 2":
      case "Grade 3":
      case "Grade 4":
      case "Grade 5":
      case "Grade 6":
      case "Grade 7":
        grade = clickedButton;
        await getData();
        nextStudent();
        phase1El.style.display = "none";
        phase2El.style.display = "flex";
        break;
      case "Previous":
        previousStudent();
        break;
      case "Absent":
        takeAttendance(false);
        break;
      case "Present":
        takeAttendance(true);
        break;
      case "Submit":
        const success = await postData();
        if (success) {
          phase3El.style.display = "none";
          phase4El.style.display = "flex";
        }
        break;
      case "New Attendance":
        location.reload();
        break;
        case "Use reason":

          break;
    }
  });
});
