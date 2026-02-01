package com.WorkHub.controller;

import com.WorkHub.DTO.CreateTaskRequest;
import com.WorkHub.model.Task;
import com.WorkHub.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // Create task (RequestBody)
    @PostMapping
    public ResponseEntity<Task> createTask(
            @RequestBody CreateTaskRequest request,
            Authentication authentication
    ) {
        Task task = taskService.createTask(
                request.getProjectId(),
                request.getTitle(),
                request.getDescription(),
                request.getDueDate(),
                request.getAssigneeUserId(),
                authentication
        );
        return ResponseEntity.ok(task);
    }

    // Get tasks by project
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getTasksByProject(
            @PathVariable Long projectId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId, authentication));
    }

    //Update task (RequestBody)
    @PutMapping("/{taskId}")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long taskId,
            @RequestBody CreateTaskRequest request,
            Authentication authentication
    ) {
        Task task = taskService.updateTask(
                taskId,
                request.getTitle(),
                request.getDescription(),
                request.getStatus(),
                request.getDueDate(),
                request.getAssigneeUserId(),
                authentication
        );
        return ResponseEntity.ok(task);
    }

    // Delete task
    @DeleteMapping("/{taskId}")
    public ResponseEntity<String> deleteTask(
            @PathVariable Long taskId,
            Authentication authentication
    ) {
        taskService.deleteTask(taskId, authentication);
        return ResponseEntity.ok("Task deleted successfully");
    }

}
