package com.helloIftekhar.springJwt.controller;



import com.helloIftekhar.springJwt.DTO.*;
import com.helloIftekhar.springJwt.model.Project;
import com.helloIftekhar.springJwt.model.ProjectStatus;
import com.helloIftekhar.springJwt.model.User;
import com.helloIftekhar.springJwt.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@CrossOrigin
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Project>> getProjectsByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(projectService.getProjectsByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PostMapping
    public ResponseEntity<Project> create(@RequestBody ProjectRequest req, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(projectService.createProject(req, user.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> update(@PathVariable Long id, @RequestBody ProjectRequest req) {
        return ResponseEntity.ok(projectService.updateProject(id, req));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Project> changeStatus(@PathVariable Long id, @RequestParam ProjectStatus status) {
        return ResponseEntity.ok(projectService.changeStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok("Project deleted successfully");
    }

    @PostMapping("/{projectId}/members")
    public ResponseEntity<?> assignMember(@PathVariable Long projectId, @RequestBody AssignMemberRequest req) {
        projectService.assignMember(projectId, req);
        return ResponseEntity.ok("Member assigned");
    }

    @PutMapping("/{projectId}/members/role")
    public ResponseEntity<?> changeMemberRole(@PathVariable Long projectId, @RequestBody ChangeMemberRoleRequest req) {
        projectService.changeMemberRole(projectId, req);
        return ResponseEntity.ok("Role changed");
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    public ResponseEntity<?> removeMember(@PathVariable Long projectId, @PathVariable Long userId) {
        projectService.removeMember(projectId, userId);
        return ResponseEntity.ok("Member removed");
    }

    @GetMapping("/{projectId}/members")
    public ResponseEntity<List<MemberDto>> listMembers(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.listMembers(projectId));
    }

    @GetMapping("/dashboard/user/{userId}")
    public ResponseEntity<UserDashboardResponse> getUserDashboard(@PathVariable Integer userId) {
        return ResponseEntity.ok(projectService.getUserDashboard(userId));
    }
}

