document.addEventListener("DOMContentLoaded", () => {
  loadPreferences();

  document.getElementById("add-habit").addEventListener("click", addHabit);
  document.getElementById("new-habit").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      addHabit();
    }
  });

  document.getElementById("habit-list").addEventListener("input", (event) => {
    if (event.target.classList.contains("habit-name")) {
      updateHabitName(event.target.dataset.index, event.target.value);
    }
  });

  document.getElementById("habit-list").addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-habit")) {
      removeHabit(event.target.dataset.index);
    }
  });
});

function loadPreferences() {
  browser.storage.local.get(["habits", "darkMode"]).then((result) => {
    const { habits = [], darkMode = false } = result;
    document.getElementById("dark-mode").checked = darkMode;
    document.getElementById("dark-mode").disabled = true;

    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    const habitList = document.getElementById("habit-list");
    habitList.innerHTML = "";

    habits.forEach((habit, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
          <input type="text" class="habit-name" data-index="${index}" value="${habit}">
          <button class="remove-habit" data-index="${index}">&times;</button>
        `;
      habitList.appendChild(li);
    });
  });
}

function addHabit() {
  const newHabit = document.getElementById("new-habit").value.trim();
  if (newHabit) {
    browser.storage.local.get("habits").then((result) => {
      const habits = result.habits || [];
      habits.push(newHabit);
      browser.storage.local.set({ habits }).then(() => {
        document.getElementById("new-habit").value = "";
        loadPreferences();
        sendMessageToPopup({ type: "updateHabits" });
      });
    });
  }
}

function removeHabit(index) {
  browser.storage.local.get("habits").then((result) => {
    const habits = result.habits || [];
    habits.splice(index, 1);
    browser.storage.local.set({ habits }).then(() => {
      loadPreferences();
      sendMessageToPopup({ type: "updateHabits" });
    });
  });
}

function updateHabitName(index, newName) {
  browser.storage.local.get("habits").then((result) => {
    const habits = result.habits || [];
    habits[index] = newName;
    browser.storage.local.set({ habits }).then(() => {
      sendMessageToPopup({ type: "updateHabits" });
    });
  });
}

function sendMessageToPopup(message) {
  browser.runtime.sendMessage(message);
}
