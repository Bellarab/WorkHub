package com.WorkHub.controller;



import com.WorkHub.DTO.AssignMemberRequest;
import com.WorkHub.DTO.ProjectRequest;
import com.WorkHub.DTO.*;
import com.WorkHub.model.Project;
import com.WorkHub.model.User;
import com.WorkHub.service.ProjectService;
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

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok("Project deleted successfully");
    }








    //assign a user to a project
    @PostMapping("/{projectId}/members")
    public ResponseEntity<?> assignMember(@PathVariable Long projectId, @RequestBody AssignMemberRequest req) {
        projectService.assignMember(projectId, req);
        return ResponseEntity.ok("Member assigned");
    }


}

