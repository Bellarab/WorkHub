package com.helloIftekhar.springJwt.DTO;
import com.helloIftekhar.springJwt.model.ProjectStatus;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ProjectRequest {
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private ProjectStatus status;
}
