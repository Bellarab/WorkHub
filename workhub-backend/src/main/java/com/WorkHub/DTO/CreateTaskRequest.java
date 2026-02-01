package com.WorkHub.DTO;

import com.WorkHub.model.TaskStatus;
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

}

