package com.WorkHub.DTO;

import com.WorkHub.model.ProjectRole;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AssignMemberRequest {
    private Long userId;
    private ProjectRole role;
}
