package com.reidocabecote.backend.controllers;

import com.reidocabecote.backend.dtos.FornecedorDto;
import com.reidocabecote.backend.models.FornecedorModel;
import com.reidocabecote.backend.repositories.FornecedorRepository;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/fornecedores")
public class FornecedorController {

    @Autowired
    FornecedorRepository fornecedorRepository;

    @PostMapping("")
    public ResponseEntity<FornecedorModel> cadastrarFornecedor(@RequestBody @Valid FornecedorDto fornecedorDto) {
        var fornecedorModel = new FornecedorModel();
        BeanUtils.copyProperties(fornecedorDto, fornecedorModel);
        return ResponseEntity.status(HttpStatus.CREATED).body(fornecedorRepository.save(fornecedorModel));
    }

    @GetMapping("")
    public ResponseEntity<List<FornecedorModel>> listarFornecedores() {
        return ResponseEntity.status(HttpStatus.OK).body(fornecedorRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> buscarFornecedor(@PathVariable(value = "id") UUID id) {
        Optional<FornecedorModel> fornecedor = fornecedorRepository.findById(id);
        if (fornecedor.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Fornecedor não encontrado.");
        }
        return ResponseEntity.status(HttpStatus.OK).body(fornecedor.get());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> alterarVeiculo(@PathVariable(value = "id") UUID id,
                                                 @RequestBody @Valid FornecedorDto fornecedorDto) {
        Optional<FornecedorModel> fornecedor = fornecedorRepository.findById(id);
        if (fornecedor.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Fornecedor não encontrado.");
        }
        var veiculoModel = fornecedor.get();
        BeanUtils.copyProperties(fornecedorDto, veiculoModel);
        return ResponseEntity.status(HttpStatus.OK).body(fornecedorRepository.save(veiculoModel));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deletarVeiculo(@PathVariable(value = "id") UUID id) {
        Optional<FornecedorModel> fornecedor = fornecedorRepository.findById(id);
        if (fornecedor.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Fornecedor não encontrado.");
        }
        fornecedorRepository.delete(fornecedor.get());
        return ResponseEntity.status(HttpStatus.OK).body("Fornecedor deletado com sucesso.");
    }
}
