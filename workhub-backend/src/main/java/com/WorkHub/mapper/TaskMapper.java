package com.WorkHub.mapper;

import com.WorkHub.DTO.CreateTaskRequest;
import com.WorkHub.model.Project;
import com.WorkHub.model.ProjectMember;
import com.WorkHub.model.Task;
import com.WorkHub.model.TaskStatus;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    public Task toEntity(CreateTaskRequest request, Project project, ProjectMember assignee) {
        if (request == null) {
            return null;
        }
        
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        task.setProject(project);
        task.setStatus(TaskStatus.TODO);
        task.setAssignedTo(assignee);
        return task;
    }

    public void updateEntityFromRequest(CreateTaskRequest request, Task task, ProjectMember assignee) {
        if (request == null || task == null) {
            return;
        }
        
        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (assignee != null) {
            task.setAssignedTo(assignee);
        }
    }
}
