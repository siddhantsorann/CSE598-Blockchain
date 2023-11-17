document.addEventListener('DOMContentLoaded', function () {
    loadTaskList();
});

const web3Provider = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

async function fetchContractInstance() {
    let accounts = await web3Provider.eth.getAccounts();
    web3Provider.eth.defaultAccount = accounts[0];
    return new web3Provider.eth.Contract(contractABI, contractAddress);
}

async function loadTaskList() {
    const contractInstance = await fetchContractInstance();
    let taskCount = await contractInstance.methods.getTaskCount().call({ from: web3Provider.eth.defaultAccount });

    if (taskCount !== 0) {
        let index = 0;
        while (index < taskCount) {
            let task = await contractInstance.methods.getTask(index).call({ from: web3Provider.eth.defaultAccount });
            if (task[0] !== '') {
                appendTaskToList(index, task[0], task[1]);
            }
            index++;
        }
        updateTaskCount();
    }
}

function appendTaskToList(id, name, status) {
    let taskList = document.getElementById('taskList');
    let listItem = document.createElement('li');
    listItem.classList.add('task-item');
    listItem.id = 'task-' + id;
    let taskName = document.createTextNode(name);
    let taskCheckbox = document.createElement('input');
    taskCheckbox.setAttribute('type', 'checkbox');
    taskCheckbox.setAttribute('id', 'task-' + id + '-checkbox');
    taskCheckbox.checked = status;

    if (status) {
        listItem.classList.add('completed-task');
    }

    taskList.appendChild(listItem);
    listItem.ondblclick = function () {
        eraseTask(listItem.id);
    }
    listItem.appendChild(taskName);
    listItem.appendChild(taskCheckbox);
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

async function modifyTaskStatus(id, taskIndex) {
    let checkbox = document.getElementById(id);
    let taskId = id.replace('-checkbox', '');
    let task = document.getElementById(taskId);
    const contractInstance = await fetchContractInstance();
    await contractInstance.methods.updateStatus(taskIndex, checkbox.checked).send({ from: web3Provider.eth.defaultAccount });
    if (checkbox.checked) {
        task.classList.add('completed-task');
    } else {
        task.classList.remove('completed-task');
    }
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
    const contractInstance = await fetchContractInstance();
    let taskCount = await contractInstance.methods.getTaskCount().call({ from: web3Provider.eth.defaultAccount });
    appendTaskToList(taskCount, taskName, false);
    updateTaskCount();
    await contractInstance.methods.addTask(taskName).send({ from: web3Provider.eth.defaultAccount });
}
