package com.reidocabecote.backend.controllers;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

import com.reidocabecote.backend.dtos.PecaDto;
import com.reidocabecote.backend.models.PecaModel;
import com.reidocabecote.backend.repositories.PecaRepository;

import jakarta.validation.Valid;

@RestController
public class PecaController {
    
    @Autowired
    PecaRepository pecaRepository;
    
    @PostMapping("/pecas")
    public ResponseEntity<PecaModel> cadastrarPeca(@RequestBody @Valid PecaDto pecaDto) {
        var pecaModel = new PecaModel();
         BeanUtils.copyProperties(pecaDto, pecaModel);
        return ResponseEntity.status(HttpStatus.CREATED).body(pecaRepository.save(pecaModel));
    }

    @GetMapping("/pecas")
    public ResponseEntity<java.util.List<PecaModel>> listarPecas() {
        return ResponseEntity.status(HttpStatus.OK).body(pecaRepository.findAll());
    }

    @GetMapping("/pecas/{id}")
    public ResponseEntity<Object> buscarPeca(@org.springframework.web.bind.annotation.PathVariable(value = "id") java.util.UUID id) {
        java.util.Optional<PecaModel> peca = pecaRepository.findById(id);
        if (peca.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Peça não encontrada.");
        }

        return ResponseEntity.status(HttpStatus.OK).body(peca.get());
    }

    @PutMapping("/pecas/{id}")
    public ResponseEntity<Object> alterarPeca(@org.springframework.web.bind.annotation.PathVariable(value = "id") java.util.UUID id,
                                                @RequestBody @Valid PecaDto pecaDto) {
        java.util.Optional<PecaModel> peca = pecaRepository.findById(id);
        if (peca.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Peça não encontrada.");
        }
        var pecaModel = peca.get();
        BeanUtils.copyProperties(pecaDto, pecaModel);
        return ResponseEntity.status(HttpStatus.OK).body(pecaRepository.save(pecaModel));
    }

    @DeleteMapping("/pecas/{id}")
    public ResponseEntity<Object> deletarPeca(@org.springframework.web.bind.annotation.PathVariable(value = "id") java.util.UUID id) {
        java.util.Optional<PecaModel> peca = pecaRepository.findById(id);
        if (peca.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Peça não encontrada.");
        }
        pecaRepository.delete(peca.get());
        return ResponseEntity.status(HttpStatus.OK).body("Peça deletada com sucesso.");
    }
}
