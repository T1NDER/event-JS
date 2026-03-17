import './styles.css';

class Task {
  constructor(id, title, pinned = false) {
    this.id = id;
    this.title = title;
    this.pinned = pinned;
  }

  togglePin() {
    this.pinned = !this.pinned;
  }
}

class TaskStore {
  constructor() {
    this.tasks = [];
    this.nextId = 1;
  }

  addTask(title) {
    const task = new Task(this.nextId++, title);
    this.tasks.push(task);
    return task;
  }

  getTasks() {
    return this.tasks;
  }

  getPinnedTasks() {
    return this.tasks.filter(task => task.pinned);
  }

  getUnpinnedTasks() {
    return this.tasks.filter(task => !task.pinned);
  }

  filterTasks(query) {
    if (!query) {
      return this.getUnpinnedTasks();
    }
    const lowerQuery = query.toLowerCase();
    return this.getUnpinnedTasks().filter(task => 
      task.title.toLowerCase().startsWith(lowerQuery)
    );
  }

  findTaskById(id) {
    return this.tasks.find(task => task.id === id);
  }
}

class TaskView {
  constructor() {
    this.pinnedList = document.getElementById('pinnedList');
    this.allTasksList = document.getElementById('allTasksList');
    this.taskInput = document.getElementById('taskInput');
    this.errorMessage = document.getElementById('errorMessage');
  }

  hideError() {
    this.errorMessage.style.display = 'none';
    this.taskInput.classList.remove('error');
  }

  showError() {
    this.errorMessage.style.display = 'block';
    this.taskInput.classList.add('error');
  }

  clearInput() {
    this.taskInput.value = '';
  }

  getInputValue() {
    return this.taskInput.value.trim();
  }

  renderPinnedTasks(tasks) {
    this.pinnedList.innerHTML = '';
    
    if (tasks.length === 0) {
      this.pinnedList.innerHTML = '<div class="empty-message">No pinned tasks</div>';
      return;
    }

    tasks.forEach(task => {
      const taskElement = this.createTaskElement(task, true);
      this.pinnedList.appendChild(taskElement);
    });
  }

  renderAllTasks(tasks, filterQuery = '') {
    this.allTasksList.innerHTML = '';

    if (tasks.length === 0) {
      if (filterQuery) {
        this.allTasksList.innerHTML = '<div class="empty-message">No tasks found</div>';
      } else {
        this.allTasksList.innerHTML = '<div class="empty-message">No tasks</div>';
      }
      return;
    }

    tasks.forEach(task => {
      const taskElement = this.createTaskElement(task, false);
      this.allTasksList.appendChild(taskElement);
    });
  }

  createTaskElement(task, isPinned) {
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('task-item');
    if (isPinned) {
      taskDiv.classList.add('pinned');
    }

    const titleSpan = document.createElement('span');
    titleSpan.classList.add('task-title');
    titleSpan.textContent = task.title;

    const pinToggle = document.createElement('button');
    pinToggle.classList.add('pin-toggle');
    pinToggle.dataset.taskId = task.id;
    pinToggle.innerHTML = isPinned ? '📌' : '○';
    pinToggle.title = isPinned ? 'Открепить' : 'Закрепить';

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.dataset.taskId = task.id;
    deleteBtn.innerHTML = '×';
    deleteBtn.title = 'Удалить';

    taskDiv.appendChild(titleSpan);
    taskDiv.appendChild(pinToggle);
    taskDiv.appendChild(deleteBtn);

    return taskDiv;
  }

  setFilterInputHandler(handler) {
    this.taskInput.addEventListener('input', handler);
  }

  setAddTaskHandler(handler) {
    this.taskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handler();
      }
    });
  }

  setPinToggleHandler(handler) {
    this.allTasksList.addEventListener('click', (e) => {
      if (e.target.classList.contains('pin-toggle')) {
        handler(parseInt(e.target.dataset.taskId));
      }
      if (e.target.classList.contains('delete-btn')) {
        handler(parseInt(e.target.dataset.taskId), true);
      }
    });

    this.pinnedList.addEventListener('click', (e) => {
      if (e.target.classList.contains('pin-toggle')) {
        handler(parseInt(e.target.dataset.taskId));
      }
      if (e.target.classList.contains('delete-btn')) {
        handler(parseInt(e.target.dataset.taskId), true);
      }
    });
  }
}

class TaskController {
  constructor() {
    this.store = new TaskStore();
    this.view = new TaskView();
    this.currentFilter = '';
    
    this.init();
  }

  init() {
    this.view.setAddTaskHandler(() => this.addTask());
    this.view.setFilterInputHandler((e) => this.filterTasks(e.target.value));
    this.view.setPinToggleHandler((taskId, isDelete) => {
      if (isDelete) {
        this.deleteTask(taskId);
      } else {
        this.togglePin(taskId);
      }
    });
    
    this.render();
  }

  addTask() {
    const title = this.view.getInputValue();
    
    if (!title) {
      this.view.showError();
      return;
    }

    this.view.hideError();
    this.store.addTask(title);
    this.view.clearInput();
    this.render();
  }

  togglePin(taskId) {
    const task = this.store.findTaskById(taskId);
    if (task) {
      task.togglePin();
      this.render();
    }
  }

  deleteTask(taskId) {
    this.store.tasks = this.store.tasks.filter(task => task.id !== taskId);
    this.render();
  }

  filterTasks(query) {
    this.currentFilter = query;
    this.render();
  }

  render() {
    const pinnedTasks = this.store.getPinnedTasks();
    const filteredTasks = this.store.filterTasks(this.currentFilter);

    this.view.renderPinnedTasks(pinnedTasks);
    this.view.renderAllTasks(filteredTasks, this.currentFilter);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TaskController();
});
