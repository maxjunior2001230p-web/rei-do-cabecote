package com.reidocabecote.backend.dtos;

import jakarta.validation.constraints.NotNull;

public record AuthenticationDTO(@NotNull String email, @NotNull String password) {
}
