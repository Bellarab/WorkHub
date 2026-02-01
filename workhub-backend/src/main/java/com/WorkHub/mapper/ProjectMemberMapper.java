package com.WorkHub.mapper;

import com.WorkHub.model.ProjectRole;
import com.WorkHub.DTO.AssignMemberRequest;
import com.WorkHub.model.Project;
import com.WorkHub.model.ProjectMember;
import com.WorkHub.model.ProjectMemberId;
import com.WorkHub.model.User;
import org.springframework.stereotype.Component;

@Component
public class ProjectMemberMapper {

    public ProjectMember toEntity(AssignMemberRequest request, Project project, User user) {
        if (request == null || project == null || user == null) {
            return null;
        }
        
        ProjectMemberId id = new ProjectMemberId(project.getId(), user.getId());
        ProjectMember member = new ProjectMember();
        member.setId(id);
        member.setProject(project);
        member.setUser(user);
        member.setRole(request.getRole());
        return member;
    }

    public ProjectMember createOwner(Project project, User user) {
        ProjectMemberId id = new ProjectMemberId(project.getId(), user.getId());
        ProjectMember member = new ProjectMember();
        member.setId(id);
        member.setProject(project);
        member.setUser(user);
        member.setRole(ProjectRole.OWNER);
        return member;
    }
}
