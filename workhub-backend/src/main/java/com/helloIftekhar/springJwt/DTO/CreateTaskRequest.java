package com.helloIftekhar.springJwt.DTO;

import com.helloIftekhar.springJwt.model.TaskStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
@Getter
@Setter
public class CreateTaskRequest {
    private Long projectId;        // used on CREATE
    private String title;
    private String description;
    private LocalDate dueDate;
    private Integer assigneeUserId;
    private TaskStatus status; // used on UPDATE

    // getters & setters
}

