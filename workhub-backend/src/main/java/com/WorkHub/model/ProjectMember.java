package com.WorkHub.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "project_members")
@Getter @Setter @NoArgsConstructor
public class ProjectMember {
    @EmbeddedId
    private ProjectMemberId id = new ProjectMemberId();

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("projectId") //Take the ID from project.getId() and automatically fill id.projectId
    @JoinColumn(name = "project_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "tokens", "password", "authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled"})
    private User user;

    @Enumerated(EnumType.STRING)
    private ProjectRole role;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "assignedTo")
    private List<Task> assignedTasks = new ArrayList<>();

    public ProjectMember(Project project, User user, ProjectRole role) {
        this.project = project;
        this.user = user;
        this.role = role;
        this.id = new ProjectMemberId(project.getId(), user.getId());
    }
}
