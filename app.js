let form = document.querySelector("form");
let taskInput = document.querySelector("#task__title");
let categoryInput = document.querySelector("#category");
let taskList = document.querySelector(".task__list");
let emptyStateMsg = document.querySelector(".empty__state--msg");

// buttons
let clearAllBtn = document.querySelector(".btn__remove-all");
let addTaskBtn = document.querySelector(".btn__addtask");
let clearCompleted = document.querySelector(".clear__completed");

// task counts
let allCount = document.querySelector(".tasks__count");
let pendingCount = document.querySelector(".pending__tasks__count");
let completedCount = document.querySelector(".completed__tasks__count");
let countAllTasks = 0;
let countPendingTasks = 0;
let countCompletedTasks = 0;

// progress bar
let percentage = document.querySelector(".percentage");
let progressBar = document.querySelector(".progress__bar");

// filter
let filters = document.querySelector(".filter__controls");
let filterByCategory = document.querySelector("#filter__category");
let searchBar = document.querySelector("#searchBar");
let currentFilter = "all";
let currentCategory = "all";
let currentQuery = "";

// edit mode
let isEditMode = false;
let itemToEditID = null;

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
 syncUI();
// form on submit, creating and editing tasks
form.addEventListener("submit", (e) => {
  e.preventDefault();

  let taskTitle = taskInput.value.trim();

  if (!taskTitle) return;

  if (isEditMode) {
    let itemToEdit = tasks.find((ele) => {
      return ele.id === itemToEditID;
    });

    if (itemToEdit) {
      itemToEdit.taskName = taskTitle;
      itemToEdit.category = categoryInput.value;
    }

    isEditMode = false;
    itemToEditID = null;
    addTaskBtn.textContent = "Add Task";
  } else {
    let task = {
      id: Date.now(),
      taskName: taskTitle,
      isCompleted: false,
      category: categoryInput.value,
    };

    tasks.push(task);
  }

  saveToLocalStorage(tasks);
   syncUI();
  form.reset();
});

// render
function render(tasks) {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    emptyStateMsg.classList.add("show");
    if (currentFilter === "all") {
      emptyStateMsg.textContent = "No tasks";
    } else if (currentFilter === "pending") {
      emptyStateMsg.textContent = "No pending tasks";
    } else if (currentFilter === "completed") {
      emptyStateMsg.textContent = "No tasks completed";
    }
    return;
  } else {
    emptyStateMsg.classList.remove("show");
  }

  tasks.forEach((ele) => {
    let li = document.createElement("li");
    li.classList.add("task__item");
    li.dataset.id = ele.id;

    let taskLeft = document.createElement("div");
    taskLeft.classList.add("task__left");

    let taskStatus = document.createElement("p");
    taskStatus.classList.add("task__status");

    if (ele.isCompleted) {
      li.classList.add("completed");
      taskStatus.textContent = "Completed";
    } else {
      taskStatus.textContent = "Pending";
    }

    let taskName = document.createElement("p");
    taskName.classList.add("task__name");
    taskName.textContent = ele.taskName;

    let taskCategory = document.createElement("p");
    taskCategory.textContent = ele.category;
    taskCategory.classList.add("category__badge");

    li.classList.add(ele.category.toLowerCase());
    taskLeft.append(taskStatus, taskName, taskCategory);

    let taskAction = document.createElement("div");
    taskAction.classList.add("task__actions");

    let editBtn = document.createElement("button");
    editBtn.classList.add("btn", "btn__edit");
    editBtn.textContent = "Edit";

    let removeBtn = document.createElement("button");
    removeBtn.classList.add("btn", "btn__remove");
    removeBtn.textContent = "Remove";

    let taskRight = document.createElement("div");
    taskRight.classList.add("task__right");

    taskAction.append(editBtn, removeBtn);
    taskRight.append(taskAction);

    li.append(taskLeft, taskRight);

    taskList.append(li);
  });
}

// event delegation to handle actions
taskList.addEventListener("click", (e) => {
  let target = e.target;
  let closestTaskItem = target.closest(".task__item");
  if (!closestTaskItem) return;
  // change status

  let closestTaskItemID = Number(closestTaskItem.dataset.id);
  if (target.classList.contains("task__status")) {
    tasks.forEach((ele) => {
      if (ele.id === closestTaskItemID) {
        ele.isCompleted = !ele.isCompleted;
      }
    });

    saveToLocalStorage(tasks);
    syncUI();
  }

  // remove
  if (target.classList.contains("btn__remove")) {
    tasks = tasks.filter((ele) => {
      return ele.id !== closestTaskItemID;
    });

    saveToLocalStorage(tasks);
     syncUI();
  }

  // edit

  if (target.classList.contains("btn__edit")) {
    isEditMode = true;
    itemToEditID = closestTaskItemID;

    let itemToEdit = tasks.find((ele) => {
      return ele.id === closestTaskItemID;
    });

    if (!itemToEdit) return;

    addTaskBtn.textContent = "Update Task";
    taskInput.value = itemToEdit.taskName;
    categoryInput.value = itemToEdit.category;
  }
});

// clear all task
clearAllBtn.addEventListener("click", clearAll);
function clearAll() {
  isEditMode = false;
  itemToEditID = null;
  tasks = [];
  saveToLocalStorage(tasks);
   syncUI();
}

// save data to local storage
function saveToLocalStorage(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// filters
filters.addEventListener("click", function (e) {
  let target = e.target;
  let filterBtn = target.closest(".filters");
  if (!filterBtn) return;


  let allFilters = filters.querySelectorAll(".filters");


  if (
    !filterBtn.classList.contains("filter__all") &&
    !filterBtn.classList.contains("filter__pending") &&
    !filterBtn.classList.contains("filter__completed")
  )
    return;


    allFilters.forEach((f)=>{
      f.classList.remove("active");
    })

    filterBtn.classList.add("active")
  if (filterBtn.classList.contains("filter__all")) {
    currentFilter = "all";
  }

  if (filterBtn.classList.contains("filter__pending")) {
    currentFilter = "pending";
  }

  if (filterBtn.classList.contains("filter__completed")) {
    currentFilter = "completed";
  }

  applyFilter();
});

filterByCategory.addEventListener("change", function (e) {
  currentCategory = e.target.value;
  applyFilter();
});

// search logic
searchBar.addEventListener("input", function (e) {
  currentQuery = searchBar.value.trim().toLowerCase();
  applyFilter();
});

// filtering logic
function applyFilter() {
  let filteredArr = tasks.filter((task) => {
    let statusMatch =
      currentFilter === "all" ||
      (currentFilter === "pending" && !task.isCompleted) ||
      (currentFilter === "completed" && task.isCompleted);

    let categoryMatch =
      currentCategory === "all" ||
      task.category.toLowerCase() === currentCategory;

    let searchMatch = task.taskName.toLowerCase().includes(currentQuery);

    return statusMatch && categoryMatch && searchMatch;
  });

  render(filteredArr);
}

// tasks stats
function updateTaskStats() {
  countAllTasks = tasks.length;
  countPendingTasks = tasks.filter((el) => !el.isCompleted).length;
  countCompletedTasks = tasks.filter((el) => el.isCompleted).length;

  allCount.textContent = `Total Tasks : ${countAllTasks}`;
  pendingCount.textContent = `Pending Tasks : ${countPendingTasks}`;
  completedCount.textContent = `Completed Tasks : ${countCompletedTasks}`;
}

// update progress bar
function updateProgressBar() {
  if (tasks.length === 0) {
    percentage.textContent = `0%`;
    progressBar.style.width = `0%`;
    return;
  }

  let totalLength = tasks.length;
  let completed = tasks.filter((e) => e.isCompleted);
  let completedTask = completed.length;

  let percent = Math.floor((completedTask / totalLength) * 100);

  percentage.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
}

clearCompleted.addEventListener("click", function(e){
  tasks = tasks.filter((el)=> {
    return !el.isCompleted;
  })

  saveToLocalStorage(tasks);
 syncUI();
})


function syncUI(){
 applyFilter();
  updateTaskStats();
  updateProgressBar();
}