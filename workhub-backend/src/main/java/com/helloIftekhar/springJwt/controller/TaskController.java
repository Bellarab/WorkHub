package com.helloIftekhar.springJwt.controller;

import com.helloIftekhar.springJwt.model.Task;
import com.helloIftekhar.springJwt.model.TaskStatus;
import com.helloIftekhar.springJwt.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/task")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;

    @PostMapping("/create")
    public ResponseEntity<Task> createTask(
            @RequestParam Long projectId,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate,
            @RequestParam(required = false) Integer assigneeUserId,
            Authentication authentication) {
        Task task = taskService.createTask(projectId, title, description, dueDate, assigneeUserId, authentication);
        return ResponseEntity.ok(task);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getTasksByProject(
            @PathVariable Long projectId,
            Authentication authentication) {
        List<Task> tasks = taskService.getTasksByProject(projectId, authentication);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<Task>> getTasksAssignedToMember(
            @RequestParam Long projectId,
            @RequestParam Integer userId,
            Authentication authentication) {
        List<Task> tasks = taskService.getTasksAssignedToMember(projectId, userId, authentication);
        return ResponseEntity.ok(tasks);
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long taskId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate,
            @RequestParam(required = false) Integer assigneeUserId,
            Authentication authentication) {
        Task task = taskService.updateTask(taskId, title, description, status, dueDate, assigneeUserId, authentication);
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<String> deleteTask(
            @PathVariable Long taskId,
            Authentication authentication) {
        taskService.deleteTask(taskId, authentication);
        return ResponseEntity.ok("Task deleted successfully");
    }
}
