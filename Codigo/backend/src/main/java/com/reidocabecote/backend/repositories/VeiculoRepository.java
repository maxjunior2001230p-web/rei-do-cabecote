package com.reidocabecote.backend.repositories;

import com.reidocabecote.backend.models.VeiculoModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VeiculoRepository extends JpaRepository<VeiculoModel, UUID> {
}
