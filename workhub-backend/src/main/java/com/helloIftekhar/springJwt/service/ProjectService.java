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

    // Get project by ID
    public Project getProjectById(Long id) {
        return projectRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
    }

    // Update project
    public Project updateProject(Long id, ProjectRequest req) {
        Project p = projectRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Project not found"));
        p.setTitle(req.getTitle());
        p.setDescription(req.getDescription());
        p.setStartDate(req.getStartDate());
        p.setEndDate(req.getEndDate());
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

    // Dashboard
    public ProjectDashboardResponse getDashboard(Long projectId) {
        long total = taskRepo.countByProjectId(projectId);
        long completed = taskRepo.countByProjectIdAndCompletedTrue(projectId);
        int progress = total == 0 ? 0 : (int) ((completed * 100) / total);

        List<ProjectMember> members = projectMemberRepo.findByProjectId(projectId);

        long managers = members.stream().filter(m -> m.getRole() == ProjectRole.MANAGER).count();
        ProjectMember ownerPm = members.stream().filter(m -> m.getRole() == ProjectRole.OWNER).findFirst().orElse(null);
        MemberDto ownerDto = null;
        if (ownerPm != null) {
            ownerDto = new MemberDto(Long.valueOf(ownerPm.getUser().getId()), ownerPm.getUser().getFirstName(), ownerPm.getUser().getLastName(), ownerPm.getUser().getEmail(), ownerPm.getRole());
        }

        List<MemberDto> memberDtos = members.stream().map(m -> new MemberDto(
                Long.valueOf(m.getUser().getId()),
                m.getUser().getFirstName(),
                m.getUser().getLastName(),
                m.getUser().getEmail(),
                m.getRole()
        )).collect(Collectors.toList());

        ProjectDashboardResponse resp = new ProjectDashboardResponse();
        resp.setTotalTasks(total);
        resp.setCompletedTasks(completed);
        resp.setProgressPercentage(progress);
        resp.setAssignedMembers(memberDtos.size());
        resp.setTotalManagers(managers);
        resp.setOwner(ownerDto);
        resp.setMembers(memberDtos);

        return resp;
    }
}
