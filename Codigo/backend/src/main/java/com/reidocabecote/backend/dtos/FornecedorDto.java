package com.reidocabecote.backend.dtos;

import jakarta.validation.constraints.NotBlank;

public record FornecedorDto(

        @NotBlank(message = "O nome do fornecedor não pode estar em branco.")
        String nome,

        @NotBlank(message = "O CNPJ do fornecedor não pode estar em branco.")
        String cnpj,

        @NotBlank(message = "O endereço do fornecedor não pode estar em branco.")
        String endereco,

        String complemento,

        @NotBlank(message = "O contato do fornecedor não pode estar em branco.")
        String contato,

        @NotBlank(message = "A categoria do fornecedor não pode estar em branco.")
        String categoria
) {
}
