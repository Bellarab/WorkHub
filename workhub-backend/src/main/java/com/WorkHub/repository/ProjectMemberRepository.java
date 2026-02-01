package com.WorkHub.repository;

import com.WorkHub.model.ProjectMember;
import com.WorkHub.model.ProjectMemberId;
import com.WorkHub.model.ProjectRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, ProjectMemberId> {
    List<ProjectMember> findByProjectId(Long projectId);
    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Integer userId);
    boolean existsById(ProjectMemberId id);
    long countByProjectIdAndRole(Long projectId, ProjectRole role);
}
