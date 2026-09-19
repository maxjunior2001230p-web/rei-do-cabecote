package com.reidocabecote.backend.dtos;

import java.sql.Date;
import java.util.UUID;
import java.util.List;

import com.reidocabecote.backend.models.TipoPagamento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;

public record ServicoDto(
        String descricao,
        @NotBlank(message = "O tipo não pode estar em branco.")
        String tipo, 
        @NotBlank(message = "O status não pode estar em branco.")   
        String status,

        @NotNull(message = "A data prevista não pode estar em branco.")
        Date dataPrevista,  

        @NotNull(message = "A mão de obra não pode estar em branco.")
        Double maoDeObra,

        @NotNull(message = "O veiculo não pode estar em branco.")
        UUID idVeiculo,

        @NotNull(message = "As peças não podem estar em branco.")
        @NotEmpty(message = "Deve ser informada ao menos uma peça.")
        List<UUID> idPecas,

        @NotNull(message = "O tipo de pagamento não pode estar em branco.")
        TipoPagamento tipoPagamento,

        Date garantia
) { }