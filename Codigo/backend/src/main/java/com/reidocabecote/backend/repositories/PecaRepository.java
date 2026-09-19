package com.reidocabecote.backend.repositories;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.reidocabecote.backend.models.PecaModel;

@Repository
public interface PecaRepository extends JpaRepository<PecaModel, UUID>{   
} 
