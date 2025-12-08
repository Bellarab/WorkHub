package com.helloIftekhar.springJwt.repository;


import com.helloIftekhar.springJwt.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
    long countByProjectId(Long projectId);
    long countByProjectIdAndCompletedTrue(Long projectId);
}
