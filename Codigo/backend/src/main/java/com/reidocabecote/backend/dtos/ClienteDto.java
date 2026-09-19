package com.reidocabecote.backend.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.util.List;


public record ClienteDto(

        @NotBlank(message = "O nome do cliente não pode estar em branco.")
        String nome,

        @NotBlank(message = "O CPF do cliente não pode estar em branco.")
        @Pattern(
                regexp = "\\d{11}",
                message = "O CPF deve conter exatamente 11 dígitos numéricos."
        )
        String cpf,

        @NotBlank(message = "O endereço do cliente não pode estar em branco.")
        String endereco,

        @Pattern(
                regexp = "\\(?\\d{2}\\)?\\s?9?\\d{4}-?\\d{4}",
                message = "O telefone deve estar no formato válido, por exemplo: (31)99999-8888."
        )
        @NotBlank(message = "O telefone do cliente não pode estar em branco.")
        String telefone,

        @Valid
        List<VeiculoDto>veiculos
) { }
