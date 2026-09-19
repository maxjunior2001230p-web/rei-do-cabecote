package com.reidocabecote.backend.controllers;

import java.util.List;
import java.util.UUID;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.reidocabecote.backend.dtos.UsuarioDto;
import com.reidocabecote.backend.models.UsuarioModel;
import com.reidocabecote.backend.repositories.UsuarioRepository;

import jakarta.validation.Valid;

@RestController
public class UsuarioController {
    
    @Autowired
    UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/usuarios")
    public ResponseEntity<Object> cadastrarUsuario(@RequestBody @Valid UsuarioDto usuarioDto) {
        if(usuarioRepository.findByEmail(usuarioDto.email()) != null){
            return ResponseEntity.badRequest().body("Email já cadastrado");
        }
        
        String encryptedPassword = passwordEncoder.encode(usuarioDto.senha());
        var usuarioModel = new UsuarioModel(usuarioDto.nome(), usuarioDto.email(), encryptedPassword, usuarioDto.cargo());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioRepository.save(usuarioModel));
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioModel>> listarUsuarios() {
        return ResponseEntity.status(HttpStatus.OK).body(usuarioRepository.findAll());
    }



    @GetMapping("/usuarios/{id}")
    public ResponseEntity<Object> buscarUsuario(@PathVariable(value = "id") UUID id) {
        Optional<UsuarioModel> usuario = usuarioRepository.findById(id);
        if (usuario.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado.");
        }

        return ResponseEntity.status(HttpStatus.OK).body(usuario.get());
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<Object> alterarUsuario(@PathVariable(value = "id") UUID id,
                                                @RequestBody @Valid UsuarioDto usuarioDto) {
        Optional<UsuarioModel> usuarioOptional = usuarioRepository.findById(id);
        if (usuarioOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado.");
        }
        var usuarioModel = usuarioOptional.get();

        usuarioModel.setNome(usuarioDto.nome());
        usuarioModel.setEmail(usuarioDto.email());
        usuarioModel.setCargo(usuarioDto.cargo());

        if (usuarioDto.senha() != null && !usuarioDto.senha().isEmpty()) {
            String encryptedPassword = passwordEncoder.encode(usuarioDto.senha());
            usuarioModel.setSenha(encryptedPassword);
        }

        return ResponseEntity.status(HttpStatus.OK).body(usuarioRepository.save(usuarioModel));    
    }    

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Object> deletarUsuario(@PathVariable(value = "id") UUID id) {
        Optional<UsuarioModel> usuario = usuarioRepository.findById(id);
        if (usuario.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado.");
        }
        usuarioRepository.delete(usuario.get());
        return ResponseEntity.status(HttpStatus.OK).body("Usuário deletado com sucesso.");
    }
}