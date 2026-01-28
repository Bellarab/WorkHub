package com.helloIftekhar.springJwt.model;

import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "project")
@Getter
@Setter @NoArgsConstructor @AllArgsConstructor
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)//EnumType.STRING :Store the enum as TEXT in the database
    private ProjectStatus status = ProjectStatus.PLANNED;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks = new ArrayList<>();

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectMember> members = new ArrayList<>();
}
