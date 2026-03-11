package com.tizadestribution.app.user.repository;

import com.tizadestribution.app.user.entity.AppUser;
import com.tizadestribution.app.user.model.RoleName;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {
    Optional<AppUser> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @EntityGraph(attributePaths = "roles")
    List<AppUser> findDistinctByRoles_NameIn(Set<RoleName> roleNames);

    @EntityGraph(attributePaths = "roles")
    Optional<AppUser> findById(UUID id);
}
