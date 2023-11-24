// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

contract SmartContractors {
    struct Task {
        string task;
        bool isDone;
    }

    mapping(address => Task[]) private Users;

    function addTask(string calldata _task) external {
        Users[msg.sender].push(Task({task: _task, isDone: false}));
    }

    function getAllTasks() external view returns (Task[] memory) {
        return Users[msg.sender];
    }

    function getTask(uint256 _taskIndex) external view returns (Task memory) {
        return Users[msg.sender][_taskIndex];
    }

    function updateStatus(uint256 _taskIndex, bool _status) external {
        Users[msg.sender][_taskIndex].isDone = _status;
    }

    function editTaskName(uint256 _taskIndex, string calldata _newName)
        external
    {
        Users[msg.sender][_taskIndex].task = _newName;
    }

    function deleteTask(uint256 _taskIndex) external {
        delete Users[msg.sender][_taskIndex];
    }

    function getTaskCount() external view returns (uint256) {
        return Users[msg.sender].length;
    }

    function overrideTasks(
        string[] calldata _falseTasks,
        string[] calldata _trueTasks
    ) external {
        uint256 userTaskCount = Users[msg.sender].length;
        for (uint256 i = 0; i < userTaskCount; i++) {
            delete Users[msg.sender][i];
        }
        delete Users[msg.sender];

        for (uint256 i = 0; i < _falseTasks.length; i++) {
            Users[msg.sender].push(Task({task: _falseTasks[i], isDone: false}));
        }

        for (uint256 i = 0; i < _trueTasks.length; i++) {
            Users[msg.sender].push(Task({task: _trueTasks[i], isDone: true}));
        }
    }
}
