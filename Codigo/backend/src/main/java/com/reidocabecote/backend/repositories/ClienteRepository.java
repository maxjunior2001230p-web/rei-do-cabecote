package com.reidocabecote.backend.repositories;

import com.reidocabecote.backend.models.ClienteModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ClienteRepository extends JpaRepository<ClienteModel, UUID> {
}
