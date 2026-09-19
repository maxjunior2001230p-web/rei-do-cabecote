package com.reidocabecote.backend.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioDto(
    @NotBlank(message = "O nome não pode estar em branco.")
    String nome,

    @NotBlank(message = "O email não pode estar em branco.")
    @Email(message = "O formato do email é inválido.")
    String email,

    @NotBlank(message = "A senha não pode estar em branco.")
    @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres.")
    String senha, 
    
    @NotBlank(message = "O cargo não pode estar em branco.")
    String cargo
) {
}