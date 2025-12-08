package com.helloIftekhar.springJwt.repository;

import com.helloIftekhar.springJwt.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {}

