package com.reidocabecote.backend.repositories;

import com.reidocabecote.backend.models.ProdutoVendaModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProdutoVendaRepository extends JpaRepository<ProdutoVendaModel, UUID> {
}