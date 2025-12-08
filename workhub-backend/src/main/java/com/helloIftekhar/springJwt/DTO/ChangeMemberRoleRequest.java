package com.helloIftekhar.springJwt.DTO;
import com.helloIftekhar.springJwt.model.ProjectRole;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ChangeMemberRoleRequest {
    private Long userId;
    private ProjectRole role;
}
