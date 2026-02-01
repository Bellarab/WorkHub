package com.WorkHub.service;



import com.WorkHub.DTO.AssignMemberRequest;
import com.WorkHub.DTO.ProjectRequest;
import com.WorkHub.model.Project;
import com.WorkHub.model.ProjectMember;
import com.WorkHub.model.ProjectMemberId;
import com.WorkHub.model.User;
import com.WorkHub.repository.ProjectMemberRepository;
import com.WorkHub.repository.ProjectRepository;
import com.WorkHub.repository.TaskRepository;
import com.WorkHub.repository.UserRepository;
import com.WorkHub.DTO.*;
import com.WorkHub.mapper.ProjectMapper;
import com.WorkHub.mapper.ProjectMemberMapper;
import com.WorkHub.model.*;
import com.WorkHub.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;
    private final TaskRepository taskRepo;
    private final ProjectMemberRepository projectMemberRepo;
    private final ProjectMapper projectMapper;
    private final ProjectMemberMapper projectMemberMapper;

    // Create project
    @Transactional
    public Project createProject(ProjectRequest req, Integer userId) {
        Project p = projectMapper.toEntity(req);
        p = projectRepo.save(p);
        
        // Automatically assign creator as OWNER
        User creator = userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        
        ProjectMember ownerMember = projectMemberMapper.createOwner(p, creator);
        projectMemberRepo.save(ownerMember);
        
        return p;
    }

    // Get all projects
    public List<Project> getAllProjects() {
        return projectRepo.findAll();
    }

    // Get project by ID
    public Project getProjectById(Long id) {
        return projectRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
    }

    // Update project
    public Project updateProject(Long id, ProjectRequest req) {
        Project p = projectRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Project not found"));
        projectMapper.updateEntityFromRequest(req, p);
        return projectRepo.save(p);
    }



    // Delete project
    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
        projectRepo.delete(project);
    }

    // Assign member with role
    @Transactional
    public void assignMember(Long projectId, AssignMemberRequest req) {
        Project project = projectRepo.findById(projectId).orElseThrow(() -> new EntityNotFoundException("Project not found"));
        User user = userRepo.findById(req.getUserId().intValue()).orElseThrow(() -> new EntityNotFoundException("User not found"));

        ProjectMemberId id = new ProjectMemberId(project.getId(), user.getId());
        if (projectMemberRepo.existsById(id)) {
            throw new IllegalStateException("User already assigned");
        }

        ProjectMember pm = projectMemberMapper.toEntity(req, project, user);
        projectMemberRepo.save(pm);
    }
}
