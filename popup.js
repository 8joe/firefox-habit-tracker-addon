let currentDate = new Date();
let habitData = {};
let habits = [];

document
  .getElementById("prev-day")
  .addEventListener("click", () => changeDay(-1));
document
  .getElementById("next-day")
  .addEventListener("click", () => changeDay(1));

function changeDay(delta) {
  currentDate.setDate(currentDate.getDate() + delta);
  updateUI();
}

function updateUI() {
  const dayString = currentDate.toISOString().split("T")[0];
  document.getElementById("current-day").innerText = dayString;
  loadHabits(dayString);
  updateStreaks();
}

function loadHabits(day) {
  const habitsForDay = habitData[day] || [];
  document.querySelectorAll(".habit-item input").forEach((input, index) => {
    input.checked = habitsForDay.includes(index);
  });
}

function saveHabits() {
  const dayString = currentDate.toISOString().split("T")[0];
  const habitsForDay = Array.from(
    document.querySelectorAll(".habit-item input")
  )
    .map((input, index) => (input.checked ? index : null))
    .filter((index) => index !== null);
  habitData[dayString] = habitsForDay;
  saveData();
  updateStreaks();
}

function saveData() {
  browser.storage.local.set({ habitData });
}

function loadData() {
  browser.storage.local
    .get(["habitData", "habits", "darkMode"])
    .then((result) => {
      if (result.habitData) {
        habitData = result.habitData;
      }
      if (result.habits) {
        habits = result.habits;
        loadHabitsUI();
      }
      if (result.darkMode) {
        document.body.classList.add("dark-mode");
      }
      updateUI();
    });
}

function loadHabitsUI() {
  const habitListContainer = document.getElementById("habit-list-container");
  habitListContainer.innerHTML = "";

  habits.forEach((habit, index) => {
    const div = document.createElement("div");
    div.className = "habit-item";
    div.innerHTML = `
      <label>
        <input type="checkbox" />
        ${habit}
      </label>
      <span id="current-streak${index + 1}">0</span>
    `;
    habitListContainer.appendChild(div);
  });

  document.querySelectorAll(".habit-item input").forEach((input) => {
    input.addEventListener("change", saveHabits);
  });

  if (habits.length === 0) {
    const message = document.createElement("p");
    message.id = "no-habits-message";
    message.innerHTML =
      "Pin extension to toolbar<br>" + "Add habits in preferences";
    habitListContainer.appendChild(message);
  }
}

function updateStreaks() {
  const dayString = currentDate.toISOString().split("T")[0];
  document.querySelectorAll(".habit-item input").forEach((input, index) => {
    const streakCount = calculateStreak(dayString, index);
    document.getElementById(`current-streak${index + 1}`).innerText =
      streakCount;
  });
}

function calculateStreak(day, habitIndex) {
  let streak = 0;
  let date = new Date(day);

  if (habitData[day] && habitData[day].includes(habitIndex)) {
    streak = 1;
  }

  while (true) {
    date.setDate(date.getDate() - 1);
    const previousDayString = date.toISOString().split("T")[0];
    if (
      habitData[previousDayString] &&
      habitData[previousDayString].includes(habitIndex)
    ) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function handleMessage(request) {
  if (request.type === "updateHabits") {
    loadData();
  }
}

browser.runtime.onMessage.addListener(handleMessage);

loadData();
