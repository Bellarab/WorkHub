package com.helloIftekhar.springJwt.repository;

import com.helloIftekhar.springJwt.model.Project;
import com.helloIftekhar.springJwt.model.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    @Query("SELECT DISTINCT p FROM Project p JOIN FETCH p.members m WHERE m.user.id = :userId")
    List<Project> findProjectsByUserId(@Param("userId") Integer userId);
    
    @Query("SELECT COUNT(DISTINCT p) FROM Project p JOIN p.members m WHERE m.user.id = :userId AND p.status = :status")
    long countByUserIdAndStatus(@Param("userId") Integer userId, @Param("status") ProjectStatus status);
}

