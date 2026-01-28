package com.helloIftekhar.springJwt.service;

import com.helloIftekhar.springJwt.DTO.UserDto;
import com.helloIftekhar.springJwt.DTO.UserUpdateRequest;
import com.helloIftekhar.springJwt.model.User;
import com.helloIftekhar.springJwt.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // Get all users
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Get user by ID
    public UserDto getUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        return convertToDto(user);
    }

    // Search users
    public List<UserDto> searchUsers(String query) {
        List<User> users = userRepository.searchUsers(query);
        return users.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Update user
    public UserDto updateUser(Integer id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getUsername() != null) {
            user.setUsername(request.getUsername());
        }
        
        user = userRepository.save(user);
        return convertToDto(user);
    }

    // Delete user
    public void deleteUser(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new EntityNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    // Helper method to convert User to UserDto
    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        return dto;
    }
}
