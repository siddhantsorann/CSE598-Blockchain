let selected = null;

document.addEventListener('DOMContentLoaded', function () {
    loadTaskList();
});

const web3Provider = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

async function fetchContractInstance() {
    let accounts = await web3Provider.eth.getAccounts();
    web3Provider.eth.defaultAccount = accounts[0];
    return new web3Provider.eth.Contract(contractABI, contractAddress);
}

async function loadTaskList() {
    const contractInstance = await fetchContractInstance();
    let taskCount = await contractInstance.methods.getTaskCount().call({ from: web3Provider.eth.defaultAccount });

    let tasks = await contractInstance.methods.getAllTasks().call({ from: web3Provider.eth.defaultAccount });
    console.log("tasks", tasks);
    tasks.forEach((task, index) => {
        if(task[0] !== '') {
            appendTaskToList(index, task[0], task[1]);
        }
    });

    updateTaskCount();
}

function appendTaskToList(id, name, status) {
    
    let taskList = !status ? document.getElementById('taskList') : document.getElementById('taskList-completed');
    let listItem = document.createElement('li');
    listItem.classList.add('task-item');
    listItem.id = 'task-' + id;
    let taskName = document.createTextNode(name);
    let taskCheckbox = document.createElement('input');
    taskCheckbox.setAttribute('type', 'checkbox');
    taskCheckbox.setAttribute('id', 'task-' + id + '-checkbox');
    taskCheckbox.checked = status;
    let taskEditButton = document.createElement('button');
    taskEditButton.innerHTML = "Edit";
    taskEditButton.setAttribute('id', 'task-' + id + '-edit-button');
    let taskDeleteButton = document.createElement('button');
    taskDeleteButton.innerHTML = "Delete";
    taskDeleteButton.setAttribute('id', 'task-' + id + '-delete-button');

    if (status) {
        listItem.classList.add('completed-task');
    }

    taskList.appendChild(listItem);
    taskDeleteButton.onclick = function () {
        eraseTask(listItem.id);
    }
    taskEditButton.onclick = () => {
        let inputBox = document.createElement('input');
        inputBox.type = 'text';

        inputBox.value = taskName.nodeValue;

        let confirmButton = document.createElement('button');
        confirmButton.innerHTML = 'Confirm';

        let cancelButton = document.createElement('button');
        cancelButton.innerHTML = 'Cancel';

        listItem.innerHTML = '';
        listItem.appendChild(inputBox);
        listItem.appendChild(confirmButton);
        listItem.appendChild(cancelButton);

        confirmButton.onclick = () => {
            taskName.nodeValue = inputBox.value;
            listItem.innerHTML = '';
            listItem.appendChild(taskName);
            listItem.appendChild(taskCheckbox);
            listItem.appendChild(taskEditButton);
            listItem.appendChild(taskDeleteButton);

            editTask(listItem.id, inputBox.value);
        }

        cancelButton.onclick = () => {
            listItem.innerHTML = '';
            listItem.appendChild(taskName);
            listItem.appendChild(taskCheckbox);
            listItem.appendChild(taskEditButton);
            listItem.appendChild(taskDeleteButton);
        }

        inputBox.focus();
    }
    listItem.appendChild(taskName);
    listItem.appendChild(taskCheckbox);
    listItem.appendChild(taskEditButton);
    listItem.appendChild(taskDeleteButton);
    taskCheckbox.onclick = function () { modifyTaskStatus(taskCheckbox.id, id); };
}

async function eraseTask(taskIndex) {
    let taskSelector = '#' + taskIndex;
    taskIndex = taskIndex.replace('task-', '');
    const contractInstance = await fetchContractInstance();
    await contractInstance.methods.deleteTask(taskIndex).send({ from: web3Provider.eth.defaultAccount });
    document.querySelector(taskSelector).remove();
    updateTaskCount();
}

async function editTask(taskIndex, editedTaskName) {
    taskIndex = taskIndex.replace('task-', '');
    const contractInstance = await fetchContractInstance();
    await contractInstance.methods.editTaskName(taskIndex, editedTaskName).send({ from: web3Provider.eth.defaultAccount });
}

async function modifyTaskStatus(id, taskIndex) {
    let checkbox = document.getElementById(id);
    let taskId = id.replace('-checkbox', '');
    let task = document.getElementById(taskId);
    const contractInstance = await fetchContractInstance();
    await contractInstance.methods.updateStatus(taskIndex, checkbox.checked).send({ from: web3Provider.eth.defaultAccount });

    task.remove();

    if (checkbox.checked) {
        task.classList.add('completed-task');
        document.getElementById('taskList-completed').appendChild(task);
    } else {
        task.classList.remove('completed-task');
        document.getElementById('taskList').appendChild(task);
    }

    updateTaskCount();
}

function updateTaskCount() {
    let taskList = document.getElementById('taskList');
    let totalTasks = taskList.childElementCount;
    let tasksCounter = document.getElementById('tasksCounter');
    tasksCounter.innerText = totalTasks + " Tasks";
}

async function addNewTask() {
    let taskName = document.getElementById('newTaskInput').value;
	document.getElementById('newTaskInput').value = '';
    if(taskName.length == 0) {
        return;
    }
    const contractInstance = await fetchContractInstance();
    let taskCount = await contractInstance.methods.getTaskCount().call({ from: web3Provider.eth.defaultAccount });
    appendTaskToList(taskCount, taskName, false);
    updateTaskCount();
    await contractInstance.methods.addTask(taskName).send({ from: web3Provider.eth.defaultAccount });
}
