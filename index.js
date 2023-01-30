// Import stylesheets
import './style.css';

let students = []



const buttons = document.querySelectorAll('button');
buttons.forEach(function (button) {
  button.addEventListener('click', function () {
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
        alert("Grade Button Clicked")
        break;
      case 'Previous':
        alert("Previous Button Clicked")
        break;
      case 'Absent':
        alert("Absent Button Clicked")
        break;
      case 'Present':
        alert("Present Button Clicked")
        break;
    }
  });
});
