package com.WorkHub.mapper;

import com.WorkHub.DTO.ProjectRequest;
import com.WorkHub.model.Project;
import com.WorkHub.model.ProjectStatus;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

    public Project toEntity(ProjectRequest request) {
        if (request == null) {
            return null;
        }
        
        Project project = new Project();
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setStatus(request.getStatus() == null ? ProjectStatus.PLANNED : request.getStatus());
        return project;
    }

    public void updateEntityFromRequest(ProjectRequest request, Project project) {
        if (request == null || project == null) {
            return;
        }
        
        if (request.getTitle() != null) {
            project.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getStartDate() != null) {
            project.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            project.setEndDate(request.getEndDate());
        }
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
    }
}
