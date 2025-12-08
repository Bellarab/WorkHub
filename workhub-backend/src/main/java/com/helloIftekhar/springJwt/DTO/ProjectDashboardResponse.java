package com.helloIftekhar.springJwt.DTO;
import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ProjectDashboardResponse {
    private long totalTasks;
    private long completedTasks;
    private int progressPercentage;
    private int assignedMembers;
    private long totalManagers;
    private MemberDto owner;
    private List<MemberDto> members;
}
