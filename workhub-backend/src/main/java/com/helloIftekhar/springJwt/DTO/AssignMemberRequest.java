package com.helloIftekhar.springJwt.DTO;

import com.helloIftekhar.springJwt.model.ProjectRole;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AssignMemberRequest {
    private Long userId;
    private ProjectRole role;
}
