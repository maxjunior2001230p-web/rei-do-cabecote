package com.reidocabecote.backend.dtos;

import com.reidocabecote.backend.models.StatusVenda;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record ProdutoVendaDto(
        @NotBlank(message = "O nome não pode estar em branco.")
        String nome,

        String descricao,

        @NotNull(message = "A quantidade não pode ser nula.")
        @PositiveOrZero(message = "A quantidade deve ser 0 or maior.")
        Integer quantidade,

        @NotNull(message = "O preço de venda não pode ser nulo.")
        @PositiveOrZero(message = "O preço de venda deve ser 0 ou maior.")
        Double precoVenda,

        String categoria,

        @NotNull(message = "O status da venda não pode ser nulo.")
        StatusVenda statusVenda,

        String nomeArquivoImagem
) {
}