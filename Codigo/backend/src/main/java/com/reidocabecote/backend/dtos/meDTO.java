package com.reidocabecote.backend.dtos;

import java.util.UUID;

public record meDTO(UUID id, String nome, String email, String cargo) {  
}
