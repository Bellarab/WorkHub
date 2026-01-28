package com.helloIftekhar.springJwt.DTO;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDashboardResponse {
    private long totalProjects;
    private long completedProjects;
    private long ongoingProjects;
    private long onHoldProjects;
    private long plannedProjects;
    private long totalTasks;
    private long completedTasks;
    private long inProgressTasks;
    private long overdueTasks;
    private long weeklyTaskCompletion;
}
