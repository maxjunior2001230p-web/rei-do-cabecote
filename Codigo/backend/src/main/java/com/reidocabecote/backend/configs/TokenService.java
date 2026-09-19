package com.reidocabecote.backend.configs;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.reidocabecote.backend.models.UsuarioModel;

@Service
public class TokenService {
    
    @Value("${api.security.token.secret}")
    private String secret;

    public String generateToken(UsuarioModel usuario) {
        try{
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                .withIssuer("auth-api")
                .withSubject(usuario.getEmail())
                .withExpiresAt(genExpirationDate())
                .sign(algorithm);
        } catch (JWTCreationException exception){
            throw new RuntimeException("Erro ao gerar token JWT", exception);
        }    
    }

    public String validateToken(String token) {
        try{
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                .withIssuer("auth-api")
                .build()
                .verify(token)
                .getSubject();
        } catch (JWTVerificationException exception){
            throw new RuntimeException("Token JWT inválido ou expirado", exception);
        }
    }

    private Instant genExpirationDate() {
        return LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00"));
    }
}
