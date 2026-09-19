package com.reidocabecote.backend.dtos;

import com.reidocabecote.backend.models.TipoCambio;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record VeiculoDto(

        @NotNull(message = "O cliente é obrigatório.")
        UUID clienteId,

        @NotBlank(message = "A placa não pode estar em branco.")
        String placa,

        @NotBlank(message = "O modelo do veiculo não pode estar em branco.")
        String modelo,

        @NotBlank(message = "A montadora veiculo não pode estar em branco.")
        String montadora,

        @NotBlank(message = "O ano/modelo do veiculo não pode estar em branco.")
        String ano_modelo,

        @NotBlank(message = "O ano de fabricacao do veiculo não pode estar em branco.")
        String ano_fabricacao,

        String cor,

        @NotNull(message = "O cambio do veiculo não pode estar em branco.")
        TipoCambio cambio
) {
}
