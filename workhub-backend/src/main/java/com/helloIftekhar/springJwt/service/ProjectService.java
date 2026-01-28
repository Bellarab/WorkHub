package com.helloIftekhar.springJwt.service;



import com.helloIftekhar.springJwt.DTO.*;
import com.helloIftekhar.springJwt.model.*;
import com.helloIftekhar.springJwt.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;
    private final TaskRepository taskRepo;
    private final ProjectMemberRepository projectMemberRepo;

    // Create project
    @Transactional
    public Project createProject(ProjectRequest req, Integer userId) {
        Project p = new Project();
        p.setTitle(req.getTitle());
        p.setDescription(req.getDescription());
        p.setStartDate(req.getStartDate());
        p.setEndDate(req.getEndDate());
        p.setStatus(req.getStatus() == null ? ProjectStatus.PLANNED : req.getStatus());
        p = projectRepo.save(p);
        
        // Automatically assign creator as OWNER
        User creator = userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        
        ProjectMemberId memberId = new ProjectMemberId(p.getId(), creator.getId());
        ProjectMember ownerMember = new ProjectMember();
        ownerMember.setId(memberId);
        ownerMember.setProject(p);
        ownerMember.setUser(creator);
        ownerMember.setRole(ProjectRole.OWNER);
        projectMemberRepo.save(ownerMember);
        
        return p;
    }

    // Get all projects
    public List<Project> getAllProjects() {
        return projectRepo.findAll();
    }

    // Get projects assigned to a user
    public List<Project> getProjectsByUserId(Integer userId) {
        return projectRepo.findProjectsByUserId(userId);
    }

    // Get project by ID
    public Project getProjectById(Long id) {
        return projectRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
    }

    // Update project
    public Project updateProject(Long id, ProjectRequest req) {
        Project p = projectRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Project not found"));
        if (req.getTitle() != null) p.setTitle(req.getTitle());
        if (req.getDescription() != null) p.setDescription(req.getDescription());
        if (req.getStartDate() != null) p.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) p.setEndDate(req.getEndDate());
        if (req.getStatus() != null) p.setStatus(req.getStatus());
        return projectRepo.save(p);
    }

    // Change status (e.g. PLANNED -> ACTIVE)
    public Project changeStatus(Long id, ProjectStatus status) {
        Project p = projectRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Project not found"));
        p.setStatus(status);
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

        ProjectMember pm = new ProjectMember();
        pm.setId(id);
        pm.setProject(project);
        pm.setUser(user);
        pm.setRole(req.getRole());
        projectMemberRepo.save(pm);
    }

    // Change role
    @Transactional
    public void changeMemberRole(Long projectId, ChangeMemberRoleRequest req) {
        ProjectMember pm = projectMemberRepo.findByProjectIdAndUserId(projectId, req.getUserId().intValue())
                .orElseThrow(() -> new EntityNotFoundException("Membership not found"));
        pm.setRole(req.getRole());
        projectMemberRepo.save(pm);
    }

    // Remove member
    @Transactional
    public void removeMember(Long projectId, Long userId) {
        ProjectMember pm = projectMemberRepo.findByProjectIdAndUserId(projectId, userId.intValue())
                .orElseThrow(() -> new EntityNotFoundException("Membership not found"));
        projectMemberRepo.delete(pm);
    }

    // List members
    public List<MemberDto> listMembers(Long projectId) {
        List<ProjectMember> members = projectMemberRepo.findByProjectId(projectId);
        return members.stream().map(pm -> new MemberDto(
                Long.valueOf(pm.getUser().getId()),
                pm.getUser().getFirstName(),
                pm.getUser().getLastName(),
                pm.getUser().getEmail(),
                pm.getRole()
        )).collect(Collectors.toList());
    }

    // User Dashboard
    public UserDashboardResponse getUserDashboard(Integer userId) {
        // Get all projects assigned to user
        List<Project> userProjects = projectRepo.findProjectsByUserId(userId);
        long totalProjects = userProjects.size();
        
        System.out.println("=== Dashboard Debug for userId: " + userId + " ===");
        System.out.println("Total projects found: " + totalProjects);
        
        // Count projects by status - force load status
        long completedProjects = 0;
        long ongoingProjects = 0;
        long onHoldProjects = 0;
        long plannedProjects = 0;
        
        for (Project p : userProjects) {
            ProjectStatus status = p.getStatus();
            System.out.println("Project ID: " + p.getId() + ", Title: " + p.getTitle() + ", Status: " + status);
            
            if (status == ProjectStatus.COMPLETED) {
                completedProjects++;
            } else if (status == ProjectStatus.ACTIVE) {
                ongoingProjects++;
            } else if (status == ProjectStatus.ON_HOLD) {
                onHoldProjects++;
            } else if (status == ProjectStatus.PLANNED) {
                plannedProjects++;
            }
        }
        
        System.out.println("Completed: " + completedProjects);
        System.out.println("Ongoing (ACTIVE): " + ongoingProjects);
        System.out.println("On Hold: " + onHoldProjects);
        System.out.println("Planned: " + plannedProjects);
        
        // Get all tasks assigned to user
        List<Task> userTasks = taskRepo.findByAssignedToUserId(userId);
        long totalTasks = userTasks.size();
        
        // Count completed tasks
        long completedTasks = userTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
                .count();
        
        // Count in-progress tasks
        long inProgressTasks = userTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS)
                .count();
        
        // Count overdue tasks
        long overdueTasks = userTasks.stream()
                .filter(Task::isOverdue)
                .count();
        
        // Calculate weekly task completion (tasks completed in the last 7 days)
        java.time.LocalDate oneWeekAgo = java.time.LocalDate.now().minusDays(7);
        long weeklyTaskCompletion = userTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
                .count(); // Note: You would need a completedDate field to properly track this
        
        UserDashboardResponse response = new UserDashboardResponse();
        response.setTotalProjects(totalProjects);
        response.setCompletedProjects(completedProjects);
        response.setOngoingProjects(ongoingProjects);
        response.setOnHoldProjects(onHoldProjects);
        response.setPlannedProjects(plannedProjects);
        response.setTotalTasks(totalTasks);
        response.setCompletedTasks(completedTasks);
        response.setInProgressTasks(inProgressTasks);
        response.setOverdueTasks(overdueTasks);
        response.setWeeklyTaskCompletion(weeklyTaskCompletion);
        
        return response;
    }
}
