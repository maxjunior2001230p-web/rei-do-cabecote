package com.reidocabecote.backend.dtos;

import jakarta.validation.constraints.NotBlank;

public record PecaDto(
    @NotBlank(message = "O nome não pode estar em branco.")
    String nome, 
    String descricao, 
    Double preco, 
    String fornecedor, 
    String situacao) {
}