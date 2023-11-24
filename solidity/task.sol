// SPDX-License-Identifier: GPL-3.0 
pragma solidity >=0.8.0 <0.9.0; 

contract SmartContractors {
    struct Task {
        string task;
        bool isDone;
        int priority;
    }

    mapping (address => Task[]) private Users;
    int public currentPriority = 0;
        
    function addTask(string calldata _task) external {
        currentPriority++;
        Users[msg.sender].push(Task({
            task: _task,
            isDone: false,
            priority: currentPriority
        }));
    }

	function editTaskName(uint256 _taskIndex, string calldata _newName) external {
        Users[msg.sender][_taskIndex].task = _newName;
    }

    function getTask(uint _taskIndex) external view returns (Task memory) {
        Task storage task = Users[msg.sender][_taskIndex];
        return task;
    }

    function updateStatus(uint256 _taskIndex, bool _status) external {
        if (_status) {
            Users[msg.sender][_taskIndex].priority *= -1;
        } else {
            Users[msg.sender][_taskIndex].priority = ++currentPriority;
        }
    }

    function deleteTask(uint256 _taskIndex) external {
        delete Users[msg.sender][_taskIndex];
    }

    function getTaskCount() external view returns (uint256) {
        return Users[msg.sender].length;
    }

    function getTasks() external view returns (Task[] memory) {
        Task[] storage userTasks = Users[msg.sender];
        Task[] memory sortedTasks = new Task[](userTasks.length);
        uint index;
        for (uint i = 0; i < userTasks.length; i++) {
            if (userTasks[i].isDone) {
                sortedTasks[index++] = userTasks[i];
            }
        }
        for (uint i = 0; i < userTasks.length; i++) {
            if (!userTasks[i].isDone) {
                sortedTasks[index++] = userTasks[i];
            }
        }
        return sortedTasks;
    }
}
