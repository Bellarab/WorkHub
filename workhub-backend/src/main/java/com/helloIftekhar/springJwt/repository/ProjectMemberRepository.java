package com.helloIftekhar.springJwt.repository;

import com.helloIftekhar.springJwt.model.ProjectMember;
import com.helloIftekhar.springJwt.model.ProjectMemberId;
import com.helloIftekhar.springJwt.model.ProjectRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, ProjectMemberId> {
    List<ProjectMember> findByProjectId(Long projectId);
    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Integer userId);
    boolean existsById(ProjectMemberId id);
    long countByProjectIdAndRole(Long projectId, ProjectRole role);
}
