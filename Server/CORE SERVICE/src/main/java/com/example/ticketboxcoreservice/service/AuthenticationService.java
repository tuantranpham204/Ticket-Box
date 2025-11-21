package com.example.ticketboxcoreservice.service;

import com.example.ticketboxcoreservice.enumf.Constants;
import com.example.ticketboxcoreservice.enumf.ErrorCode;
import com.example.ticketboxcoreservice.exception.AppException;
import com.example.ticketboxcoreservice.exception.ResourceNotFoundException;
import com.example.ticketboxcoreservice.model.dto.request.LoginRequest;
import com.example.ticketboxcoreservice.model.dto.request.RegisterRequest;
import com.example.ticketboxcoreservice.model.dto.response.JwtAuthResponse;
import com.example.ticketboxcoreservice.model.dto.response.UserResponse;
import com.example.ticketboxcoreservice.model.entity.Image;
import com.example.ticketboxcoreservice.model.entity.Order;
import com.example.ticketboxcoreservice.model.entity.Role;
import com.example.ticketboxcoreservice.model.entity.User;
import com.example.ticketboxcoreservice.repository.ImageRepository;
import com.example.ticketboxcoreservice.repository.OrderRepository;
import com.example.ticketboxcoreservice.repository.RoleRepository;
import com.example.ticketboxcoreservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.Banner;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final ImageRepository imageRepository;
    private final OrderRepository orderRepository;
    private final ModelMapper mapper;

    public JwtAuthResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow(() -> new ResourceNotFoundException("User", "username", loginRequest.getUsername()));
        if (user == null) {
            throw new AppException(ErrorCode.USER_UNAUTHENTICATED);
        }
        try {

            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(), loginRequest.getPassword()
            ));
        } catch (Exception exception) {
            throw new AppException(ErrorCode.USER_UNAUTHENTICATED);
        }

        String jwtToken = jwtService.generateToken(user, jwtService.getExpirationTime()*24);
        String refreshToken = jwtService.generateToken(user,jwtService.getExpirationTime()*24*2);
        UserResponse userResponse = modelMapper.map(user, UserResponse.class);

        return JwtAuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .user(userResponse)
                .expiredTime(new Timestamp(System.currentTimeMillis() +jwtService.getExpirationTime()))
                .build();
    }
    public JwtAuthResponse refreshToken(String refreshToken) {
        if (jwtService.isTokenExpired(refreshToken)) {
            throw new AppException(ErrorCode.TOKEN_EXPIRED);
        }
        String username = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        String accessToken = jwtService.generateToken(user, jwtService.getExpirationTime()*24) ;
        refreshToken = jwtService.generateToken(user, jwtService.getExpirationTime()*24*2);

        UserResponse userResponse = modelMapper.map(user, UserResponse.class);

        return JwtAuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userResponse)
                .expiredTime(new Timestamp(System.currentTimeMillis() +jwtService.getExpirationTime()))
                .build();
    }
    public UserResponse register(RegisterRequest registerRequest){
        if (userRepository.existsByUsername(registerRequest.getUsername())){
            throw new AppException(ErrorCode.USER_ALREADY_EXISTS);
        }
        User user = modelMapper.map(registerRequest, User.class);
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        Set<Role> roles = new HashSet<>();
        Role role = roleRepository.findByName("ROLE_USER").orElseThrow(
                ()->new ResourceNotFoundException("role", "role's name","ROLE_USER"));
        roles.add(role);
        user.setRoles(roles);

        //set default avatar
        Image defaultAvatar = imageRepository.findById(Constants.DEFAULT_AVATAR_IMG_ID).orElseThrow(
                () -> new ResourceNotFoundException("image", "image id", 1));
        Image avatar = new Image();
        avatar.setUrl(defaultAvatar.getUrl());
        imageRepository.save(avatar);
        user.setAvatar(avatar);

        //set default cart for new user
        Order order = new Order();
        order.setBuyer(user);
        order.setUpdateDate(LocalDateTime.now());
        orderRepository.save(order);

        return modelMapper.map(userRepository.save(user), UserResponse.class);
    }


}
