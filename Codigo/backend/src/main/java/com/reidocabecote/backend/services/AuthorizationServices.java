package com.reidocabecote.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.reidocabecote.backend.configs.TokenService;

import com.reidocabecote.backend.repositories.UsuarioRepository;

@Service
public class AuthorizationServices implements UserDetailsService {

    @Autowired
    UsuarioRepository usuarioRepository;   

    @Autowired
    TokenService tokenService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(username);
    }
    
    public UserDetails getUserFromToken(String token) {
        String email = tokenService.validateToken(token);
        if(!email.isEmpty()){
            return usuarioRepository.findByEmail(email);
        }
        return null;
    }
}
