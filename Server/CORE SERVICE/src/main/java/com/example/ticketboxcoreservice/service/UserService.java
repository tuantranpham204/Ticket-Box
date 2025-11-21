package com.example.ticketboxcoreservice.service;

import com.example.ticketboxcoreservice.enumf.Constants;
import com.example.ticketboxcoreservice.enumf.ErrorCode;
import com.example.ticketboxcoreservice.exception.AppException;
import com.example.ticketboxcoreservice.exception.ResourceNotFoundException;
import com.example.ticketboxcoreservice.model.dto.request.ImageRequest;
import com.example.ticketboxcoreservice.model.dto.request.UserRequest;
import com.example.ticketboxcoreservice.model.dto.response.CustomPage;
import com.example.ticketboxcoreservice.model.dto.response.MessageResponse;
import com.example.ticketboxcoreservice.model.dto.response.UserResponse;
import com.example.ticketboxcoreservice.model.entity.Image;
import com.example.ticketboxcoreservice.model.entity.Role;
import com.example.ticketboxcoreservice.model.entity.User;
import com.example.ticketboxcoreservice.repository.RoleRepository;
import com.example.ticketboxcoreservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final ImageService imageService;
    
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return  modelMapper.map(user, UserResponse.class);
    }
    public CustomPage<UserResponse> getAllUser(Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);
        return CustomPage.<UserResponse>builder()
                .pageNo(page.getNumber() + 1)
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .pageContent(page.getContent().stream().map(user->modelMapper.map(user, UserResponse.class)).toList())
                .build();

    }
    public UserResponse updateUser(Long userId, UserRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        if (!request.getUsername().equals(user.getUsername())){
            throw new AppException(ErrorCode.USERNAME_CAN_NOT_BE_CHANGED);
        }
        modelMapper.map(request,user);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        return modelMapper.map(userRepository.save(user),UserResponse.class);
    }
    public UserResponse updateAvatarByUserId(Long id, ImageRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        Long avatarImgId = user.getAvatar().getId();
        Image updatedAvatar = new Image();
        try {
            if (avatarImgId == Constants.DEFAULT_AVATAR_IMG_ID) {
                updatedAvatar = modelMapper.map(imageService.uploadImage(request), Image.class);
            } else  updatedAvatar = modelMapper.map(imageService.updateImageByImageId(avatarImgId, request), Image.class);
        } catch (IOException e) {
            throw new IllegalArgumentException(e.getMessage());
        }
        user.setAvatar(updatedAvatar);
        return modelMapper.map(userRepository.save(user), UserResponse.class);
    }
    public MessageResponse updatePasswordByUserId(Long id, String updatedPassword) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setPassword(passwordEncoder.encode(updatedPassword));
        userRepository.save(user);
        return new MessageResponse("User with the username + " + user.getUsername() + " + has his/her password updated successfully!");
    }
    public MessageResponse updateUserToApprover(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        for (Role role : user.getRoles()) {
            if (role.getName() == "ROLE_APPROVER") {
                throw new AppException(ErrorCode.USER_IS_ALREADY_APPROVER);
            } else if (role.getName() == "ROLE_ADMIN") {
                throw new AppException(ErrorCode.ADMIN_CANNOT_REGISTER_APPROVER);
            }
        }
        Role role = roleRepository.findByName("ROLE_APPROVER").orElseThrow(
                () -> new ResourceNotFoundException("Role", "role name", "ROLE_APPROVER")
        );

        Set<Role> roles = user.getRoles();
        roles.add(role);
        user.setRoles(roles);
        userRepository.save(user);

        return new MessageResponse("User {id: " + userId + "} has registered as an APPROVER!");
    }

    public boolean isApproverByUser(User user) {
        Role ApproverRole = roleRepository.findByName("ROLE_APPROVER").orElseThrow(
                () -> new ResourceNotFoundException("role", "role name", "ROLE_APPROVER")
        );
        return user.getRoles().contains(ApproverRole);
    }
}
