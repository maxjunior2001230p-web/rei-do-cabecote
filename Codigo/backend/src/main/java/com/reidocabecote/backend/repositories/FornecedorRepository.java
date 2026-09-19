package com.reidocabecote.backend.repositories;

import com.reidocabecote.backend.models.FornecedorModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FornecedorRepository extends JpaRepository<FornecedorModel, UUID> {
}
