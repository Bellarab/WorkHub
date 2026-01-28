package com.helloIftekhar.springJwt.repository;


import com.helloIftekhar.springJwt.model.Task;
import com.helloIftekhar.springJwt.model.ProjectMemberId;
import com.helloIftekhar.springJwt.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    long countByProjectId(Long projectId);
    long countByProjectIdAndStatus(Long projectId, TaskStatus status);
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssignedToId(ProjectMemberId assignedToId);
    
    @Query("SELECT t FROM Task t WHERE t.assignedTo.user.id = :userId")
    List<Task> findByAssignedToUserId(@Param("userId") Integer userId);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedTo.user.id = :userId")
    long countByAssignedToUserId(@Param("userId") Integer userId);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedTo.user.id = :userId AND t.status = :status")
    long countByAssignedToUserIdAndStatus(@Param("userId") Integer userId, @Param("status") TaskStatus status);
}
