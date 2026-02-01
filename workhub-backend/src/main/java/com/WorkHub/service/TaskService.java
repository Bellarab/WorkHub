package com.WorkHub.service;

import com.WorkHub.DTO.CreateTaskRequest;
import com.WorkHub.mapper.TaskMapper;
import com.WorkHub.model.*;
import com.WorkHub.model.*;
import com.WorkHub.repository.ProjectMemberRepository;
import com.WorkHub.repository.ProjectRepository;
import com.WorkHub.repository.TaskRepository;
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
    private final TaskMapper taskMapper;

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

        // Get assignee if specified
        ProjectMember assignee = null;
        if (assigneeUserId != null) {
            ProjectMemberId assigneeId = new ProjectMemberId(projectId, assigneeUserId);
            assignee = projectMemberRepository.findById(assigneeId)
                    .orElseThrow(() -> new RuntimeException("Assignee is not a member of this project"));
        }

        // Create task using mapper
        CreateTaskRequest request = new CreateTaskRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setDueDate(dueDate);
        
        Task task = taskMapper.toEntity(request, project, assignee);
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

        // Get assignee if specified
        ProjectMember assignee = null;
        if (assigneeUserId != null) {
            ProjectMemberId assigneeId = new ProjectMemberId(task.getProject().getId(), assigneeUserId);
            assignee = projectMemberRepository.findById(assigneeId)
                    .orElseThrow(() -> new RuntimeException("Assignee is not a member of this project"));
        }

        // Update task using mapper
        CreateTaskRequest request = new CreateTaskRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setStatus(status);
        request.setDueDate(dueDate);
        
        taskMapper.updateEntityFromRequest(request, task, assignee);
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
