package com.aegisx.agent.database;

import com.aegisx.agent.models.AgentConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AgentConfigRepository extends JpaRepository<AgentConfig, String> {
}
