package com.aegisx.backend.service;

import com.aegisx.backend.dto.AuthRequest;
import com.aegisx.backend.dto.AuthResponse;
import com.aegisx.backend.entity.Role;
import com.aegisx.backend.entity.User;
import com.aegisx.backend.dto.UserDto;
import com.aegisx.backend.repository.UserRepository;
import com.aegisx.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(AuthRequest request) {
        // Mocking user creation for initial dev Phase if they don't exist
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isEmpty()) {
            User newUser = User.builder()
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .name("Admin User")
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(newUser);
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        return AuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .user(UserDto.builder()
                        .id(user.getId().toString())
                        .email(user.getEmail())
                        .name(user.getName())
                        .role(user.getRole())
                        .createdAt(user.getCreatedAt())
                        .updatedAt(user.getUpdatedAt())
                        .build())
                .build();
    }
}
