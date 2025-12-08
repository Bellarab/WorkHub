package com.helloIftekhar.springJwt.DTO;
import com.helloIftekhar.springJwt.model.ProjectRole;
import lombok.*;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class MemberDto {
    private Long userId;
    private String firstName;
    private String LastName;
    private String email;
    private ProjectRole role;
}
