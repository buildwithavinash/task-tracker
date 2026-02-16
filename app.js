let form = document.querySelector("form");
let taskInput = document.querySelector("#task__title");
let categoryInput = document.querySelector("#category");
let taskList = document.querySelector(".task__list");
let emptyStateMsg = document.querySelector(".empty__state--msg");

// buttons
let clearAllBtn = document.querySelector(".btn__remove-all");
let addTaskBtn = document.querySelector(".btn__addtask");

// progress bar 
let percentage = document.querySelector(".percentage");
  let progressBar = document.querySelector(".progress__bar");

// filter
let filters = document.querySelector(".filter__controls");
let filterByCategory = document.querySelector("#filter__category")
let currentFilter = "all";

// edit mode
let isEditMode = false;
let itemToEditID = null;

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
render(tasks);
updateTaskStats();


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
  render(tasks);
  updateTaskStats();
  form.reset();
});

// render
function render(tasks) {


  taskList.innerHTML = "";

  if (tasks.length === 0) {
    emptyStateMsg.classList.add("show");
    if(currentFilter === "all"){
      emptyStateMsg.textContent = "No tasks"
    }else if(currentFilter === "pending"){
      emptyStateMsg.textContent = "No pending tasks"
    }else if(currentFilter === "completed"){
      emptyStateMsg.textContent = "No tasks completed"
    }
    return;
  } else {
    emptyStateMsg.classList.remove("show");
  }

  updateTaskStats();

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
      taskCategory.classList.add("category__badge")

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

  updateProgressBar();
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
    render(tasks);
  

  }

  // remove
  if (target.classList.contains("btn__remove")) {
    tasks = tasks.filter((ele) => {
      return ele.id !== closestTaskItemID;
    });

    saveToLocalStorage(tasks);
    render(tasks);
   
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
    updateTaskStats();
   
  }
});

// clear all task
clearAllBtn.addEventListener("click", clearAll);
function clearAll() {
  isEditMode = false;
  itemToEditID = null;
  tasks = [];
  saveToLocalStorage(tasks);
  render(tasks);
}


// save data to local storage
function saveToLocalStorage(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// filters
filters.addEventListener("click", function (e) {
  let target = e.target;

  if (
    !target.classList.contains("filter__all") &&
    !target.classList.contains("filter__pending") &&
    !target.classList.contains("filter__completed")
  )
    return;

  if (target.classList.contains("filter__all")) {
    currentFilter = "all";
    applyFilter();
  }

  if (target.classList.contains("filter__pending")) {
    currentFilter = "pending";
    applyFilter();
  }

  if (target.classList.contains("filter__completed")) {
    currentFilter = "completed";
    applyFilter();
  }
});

// filtering logic
function applyFilter() {
  let filteredArray;
  let categoryFilter = filterByCategory.value;
  if (currentFilter === "all") {
    filteredArray = tasks;
  } else if (currentFilter === "pending") {
    filteredArray = tasks.filter((el) => !el.isCompleted && el.category.toLowerCase() === categoryFilter);
  } else if (currentFilter === "completed") {
    filteredArray = tasks.filter((el) => el.isCompleted && el.category.toLowerCase() === categoryFilter);
  }

  if (filteredArray) {
    render(filteredArray);
  }
}

// tasks stats
function updateTaskStats(){

let allCount = document.querySelector(".tasks__count");
let pendingCount = document.querySelector(".pending__tasks__count");
let completedCount = document.querySelector(".completed__tasks__count");
let countAllTasks = 0;
let countPendingTasks = 0;
let countCompletedTasks = 0;

countAllTasks = tasks.length;
countPendingTasks = tasks.filter((el) => !el.isCompleted).length;
countCompletedTasks = tasks.filter((el) => el.isCompleted).length;

allCount.textContent = `Total Tasks : ${countAllTasks}`
pendingCount.textContent = `Pending Tasks : ${countPendingTasks}`
completedCount.textContent = `Completed Tasks : ${countCompletedTasks}`


}

// update progress bar
function updateProgressBar(){
   if(tasks.length === 0){
    return;
  }
  
  let totalLength = tasks.length;
  let completed = tasks.filter(e => e.isCompleted);
  let completedTask = completed.length

  let percent = Math.floor(completedTask/totalLength * 100);

  percentage.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
  
}