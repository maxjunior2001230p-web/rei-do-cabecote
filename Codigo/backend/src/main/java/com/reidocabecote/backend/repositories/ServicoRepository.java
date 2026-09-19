package com.reidocabecote.backend.repositories;

import com.reidocabecote.backend.models.ServicoModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ServicoRepository extends JpaRepository<ServicoModel, UUID> {
}