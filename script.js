let nav = 0;

const calendar = document.getElementById('calendar');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthDisplay = document.getElementById('month-display');

const sheetId = '1C6HH_l-1NznSc364RidqnYrI5oz7IOj5bD-Tp3SPrbM';
const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
const sheetName = 'Ops';
const query = encodeURIComponent('Select *');
const url = `${base}&sheet=${sheetName}&tq=${query}`;
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

async function events() {
    const response = await fetch(url).then(response => response.text());
    const data = await JSON.parse(response.substring(47).slice(0, -2));
    const eventArray = [];

    const dataCol = data.table.cols;
    const dataRow = data.table.rows;
    console.log(dataCol);
    console.log(dataRow);
    
    for (let i = 0; i < dataCol.length; i++) {
        for (let j = 0; j < dataRow.length; j++) {
            if (dataRow[j].c[i] !== null && typeof dataRow[j].c[i].v !== 'object') {
                const dateData = dataRow[j].c[i].f;
                const dateArray = dateData.split(' ');
                const day = dateArray[0];
                const month = months.indexOf(dateArray[1]);
                const year = dateArray[2];
                const date = `${month + 1}/${day}/${year}`;
                let event = `{"date":"${date}","title":"${dataCol[i].label}"}`;
                event = JSON.parse(event);
                eventArray.push(event);
            }
        }
    }

    buttons(eventArray);
    setTimeout(load(eventArray), 5000);
}

function load(eventArray) {
    const date = new Date();

    if (nav !== 0) {
        date.setMonth(new Date().getMonth() + nav);
    }

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dateString = firstDayOfMonth.toLocaleDateString('en-SG', {
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    })
    const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

    monthDisplay.innerText = `${date.toLocaleDateString('en-SG', {month: 'long'})} ${year}`;

    calendar.innerHTML = '';

    for (let i = 1; i <= paddingDays + daysInMonth; i++) {
        const daySquare = document.createElement('div');
        daySquare.classList.add('day');

        const dayString = `${month + 1}/${i - paddingDays}/${year}`;

        if (i > paddingDays) {
            daySquare.innerText = i - paddingDays;

            for (let i = 0; i < eventArray.length; i++) {
                if (eventArray[i].date == dayString) {
                    const event = document.createElement('div');
                    event.classList.add('event');
                    event.innerText = eventArray[i].title;
                    if (eventArray[i].title == 'Public Holiday') {
                        event.style.backgroundColor = '#743f3f';
                    } else if (eventArray[i].title == 'Patching Day') {
                        event.style.backgroundColor = '#72743f'
                    }
                    daySquare.appendChild(event);
                }
            }
            
            if (i - paddingDays === day && nav === 0) {
                daySquare.setAttribute('id', 'current-day');
            }
        } else {
            daySquare.classList.add('padding');
        }

        calendar.appendChild(daySquare);
    }
}

function buttons(eventArray) {
    const nextButton = document.getElementById('next-button');
    nextButton.addEventListener('click', () => {
        nav++;
        load(eventArray);
    });
    const backButton = document.getElementById('back-button');
    backButton.addEventListener('click', () => {
        nav--;
        load(eventArray);
    });
}

events();
