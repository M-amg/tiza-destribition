package com.tizadestribution.app.user.repository;

import com.tizadestribution.app.user.entity.Role;
import com.tizadestribution.app.user.model.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}
