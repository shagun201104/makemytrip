package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.User;
import com.makemytrip.makemytrip.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;



@Service
public class UserServices {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email);

        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }

        return null;
    }

    public User signup(User user) {

        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("User with email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getRole() == null) {
            user.setRole("USER");
        }

        return userRepository.save(user);
    }

    public User updateProfile(String id, User updated) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updated.getFirstname() != null) {
            user.setFirstname(updated.getFirstname());
        }
        if (updated.getLastname() != null) {
            user.setLastname(updated.getLastname());
        }
        if (updated.getPhoneNumber() != null) {
            user.setPhoneNumber(updated.getPhoneNumber());
        }

        return userRepository.save(user);
    }
}