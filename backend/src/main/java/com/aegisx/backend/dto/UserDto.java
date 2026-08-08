package com.aegisx.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.aegisx.backend.entity.Role;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    private String id;
    private String email;
    private String name;
    private Role role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
