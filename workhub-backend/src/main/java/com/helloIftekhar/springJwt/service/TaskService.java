package com.helloIftekhar.springJwt.service;

import com.helloIftekhar.springJwt.model.*;
import com.helloIftekhar.springJwt.repository.ProjectMemberRepository;
import com.helloIftekhar.springJwt.repository.ProjectRepository;
import com.helloIftekhar.springJwt.repository.TaskRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Transactional
    public Task createTask(Long projectId, String title, String description, java.time.LocalDate dueDate, Integer assigneeUserId, Authentication authentication) {
        // Get authenticated user
        User currentUser = (User) authentication.getPrincipal();
        
        // Find the project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Verify current user is a member of the project
        ProjectMemberId currentMemberId = new ProjectMemberId(projectId, currentUser.getId());
        ProjectMember currentMember = projectMemberRepository.findById(currentMemberId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this project"));

        // Create task
        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setProject(project);
        task.setStatus(TaskStatus.TODO);
        task.setDueDate(dueDate);

        // Assign to project member if specified
        if (assigneeUserId != null) {
            ProjectMemberId assigneeId = new ProjectMemberId(projectId, assigneeUserId);
            ProjectMember assignee = projectMemberRepository.findById(assigneeId)
                    .orElseThrow(() -> new RuntimeException("Assignee is not a member of this project"));
            task.setAssignedTo(assignee);
        }

        return taskRepository.save(task);
    }

    public List<Task> getTasksByProject(Long projectId, Authentication authentication) {
        // Get authenticated user
        User currentUser = (User) authentication.getPrincipal();
        
        // Verify current user is a member of the project
        ProjectMemberId memberId = new ProjectMemberId(projectId, currentUser.getId());
        projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this project"));

        return taskRepository.findByProjectId(projectId);
    }

    public List<Task> getTasksAssignedToMember(Long projectId, Integer userId, Authentication authentication) {
        // Get authenticated user
        User currentUser = (User) authentication.getPrincipal();
        
        // Verify current user is a member of the project
        ProjectMemberId memberId = new ProjectMemberId(projectId, currentUser.getId());
        projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this project"));

        // Get tasks assigned to the specified member
        ProjectMemberId assignedToId = new ProjectMemberId(projectId, userId);
        return taskRepository.findByAssignedToId(assignedToId);
    }

    @Transactional
    public Task updateTask(Long taskId, String title, String description, TaskStatus status, java.time.LocalDate dueDate, Integer assigneeUserId, Authentication authentication) {
        // Get authenticated user
        User currentUser = (User) authentication.getPrincipal();
        
        // Find the task
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Verify current user is a member of the project
        ProjectMemberId memberId = new ProjectMemberId(task.getProject().getId(), currentUser.getId());
        projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this project"));

        // Update fields
        if (title != null && !title.isBlank()) {
            task.setTitle(title);
        }
        
        if (description != null) {
            task.setDescription(description);
        }
        
        if (status != null) {
            task.setStatus(status);
        }
        
        if (dueDate != null) {
            task.setDueDate(dueDate);
        }

        // Update assignee
        if (assigneeUserId != null) {
            ProjectMemberId assigneeId = new ProjectMemberId(task.getProject().getId(), assigneeUserId);
            ProjectMember assignee = projectMemberRepository.findById(assigneeId)
                    .orElseThrow(() -> new RuntimeException("Assignee is not a member of this project"));
            task.setAssignedTo(assignee);
        }

        return taskRepository.save(task);
    }

    @Transactional
    public void deleteTask(Long taskId, Authentication authentication) {
        // Get authenticated user
        User currentUser = (User) authentication.getPrincipal();
        
        // Find the task
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Verify current user is a member of the project
        ProjectMemberId memberId = new ProjectMemberId(task.getProject().getId(), currentUser.getId());
        ProjectMember member = projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this project"));

        // Only OWNER or ADMIN can delete tasks
        if (member.getRole() != ProjectRole.OWNER && member.getRole() != ProjectRole.MANAGER) {
            throw new RuntimeException("Only project owners and admins can delete tasks");
        }

        taskRepository.delete(task);
    }
}
