package com.astra.agent.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "agent_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgentConfig {

    @Id
    private String configKey;
    
    private String configValue;
}
