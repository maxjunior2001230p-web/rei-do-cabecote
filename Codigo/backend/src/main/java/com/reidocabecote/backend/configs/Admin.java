package com.reidocabecote.backend.configs;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.reidocabecote.backend.models.UsuarioModel;
import com.reidocabecote.backend.repositories.UsuarioRepository;

@Configuration
public class Admin {
    
    @Bean
    public CommandLineRunner createAdminUser(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String email = "admin@admin.com";
            String senha = "admin123";

            if (!usuarioRepository.existsByEmail(email)) {
                UsuarioModel admin = new UsuarioModel(
                        "Administrador",
                        email,
                        passwordEncoder.encode(senha),
                        "Administrador"
                );
                usuarioRepository.save(admin);
                System.out.println("Usuário administrador criado com sucesso.");
            } else {
                System.out.println("Usuário administrador já existe.");
            }
        };
    }
}
