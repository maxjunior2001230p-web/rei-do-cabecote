package com.reidocabecote.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.reidocabecote.backend.configs.TokenService;
import com.reidocabecote.backend.dtos.AuthenticationDTO;
import com.reidocabecote.backend.dtos.UsuarioDto;
import com.reidocabecote.backend.dtos.meDTO;
import com.reidocabecote.backend.models.UsuarioModel;
import com.reidocabecote.backend.repositories.UsuarioRepository;
import com.reidocabecote.backend.services.AuthorizationServices;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {
    
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private AuthorizationServices authorizationServices;

    @Autowired  
    private UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody @Valid AuthenticationDTO data) {
        
        UserDetails user = this.usuarioRepository.findByEmail(data.email());
        if(user != null){
            
            var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.password());
            var auth = this.authenticationManager.authenticate(usernamePassword);
            var token = this.tokenService.generateToken((UsuarioModel) auth.getPrincipal());

            return ResponseEntity.ok(token);
            
        }
        return ResponseEntity.badRequest().body("Usuário ou senha inválidos");
    }

    @PostMapping("/register")
    public ResponseEntity register(@RequestBody @Valid UsuarioDto data) {
        if(this.usuarioRepository.findByEmail(data.email()) != null){
            return ResponseEntity.badRequest().body("Email já cadastrado");
        }
        String encryptedPassword = new BCryptPasswordEncoder().encode(data.senha());
        UsuarioModel novoUsuario = new UsuarioModel(data.nome(), data.email(), encryptedPassword, data.cargo());

        this.usuarioRepository.save(novoUsuario);
        return ResponseEntity.ok("Usuário cadastrado com sucesso");
    }

    @GetMapping("/me")
    public ResponseEntity getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        UserDetails user = authorizationServices.getUserFromToken(token);
        UsuarioModel usuario = (UsuarioModel) user;
        if (user != null) {
            return ResponseEntity.ok(new meDTO(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getCargo()));
        } else {
            return ResponseEntity.status(401).body("Token inválido ou expirado");
        }
    }
}
