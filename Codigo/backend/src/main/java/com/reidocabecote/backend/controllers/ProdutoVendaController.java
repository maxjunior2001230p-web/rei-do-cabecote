package com.reidocabecote.backend.controllers;

import com.reidocabecote.backend.dtos.ProdutoVendaDto;
import com.reidocabecote.backend.models.ProdutoVendaModel;
import com.reidocabecote.backend.repositories.ProdutoVendaRepository;
import com.reidocabecote.backend.services.FileStorageService;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/produtosvenda") // Definindo a rota base
public class ProdutoVendaController {

    @Autowired
    ProdutoVendaRepository produtoVendaRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("")
    public ResponseEntity<ProdutoVendaModel> cadastrarProdutoVenda(@RequestBody @Valid ProdutoVendaDto produtoVendaDto) {
        var produtoVendaModel = new ProdutoVendaModel();
        BeanUtils.copyProperties(produtoVendaDto, produtoVendaModel);
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoVendaRepository.save(produtoVendaModel));
    }

    @GetMapping("")
    public ResponseEntity<List<ProdutoVendaModel>> listarProdutosVenda() {
        return ResponseEntity.status(HttpStatus.OK).body(produtoVendaRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> buscarProdutoVenda(@PathVariable(value = "id") UUID id) {
        Optional<ProdutoVendaModel> produto = produtoVendaRepository.findById(id);
        if (produto.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produto não encontrado.");
        }

        return ResponseEntity.status(HttpStatus.OK).body(produto.get());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> alterarProdutoVenda(@PathVariable(value = "id") UUID id,
                                                      @RequestBody @Valid ProdutoVendaDto produtoVendaDto) {
        Optional<ProdutoVendaModel> produto = produtoVendaRepository.findById(id);
        if (produto.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produto não encontrado.");
        }
        var produtoVendaModel = produto.get();
        BeanUtils.copyProperties(produtoVendaDto, produtoVendaModel);
        return ResponseEntity.status(HttpStatus.OK).body(produtoVendaRepository.save(produtoVendaModel));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deletarProdutoVenda(@PathVariable(value = "id") UUID id) {
        Optional<ProdutoVendaModel> produto = produtoVendaRepository.findById(id);
        if (produto.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produto não encontrado.");
        }
        produtoVendaRepository.delete(produto.get());
        return ResponseEntity.status(HttpStatus.OK).body("Produto deletado com sucesso.");
    }

    @PutMapping("/{id}/imagem")
    public ResponseEntity<?> uploadImagemProduto(
            @PathVariable(value = "id") UUID id,
            @RequestParam("imagem") MultipartFile file) { // Recebe um arquivo

        try {
            // 1. Busca o produto no banco
            ProdutoVendaModel produto = produtoVendaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado com id: " + id));

            // 2. Salva o arquivo usando o serviço
            String nomeArquivo = fileStorageService.salvarArquivo(file);

            // 3. Atualiza o campo 'nomeArquivoImagem' no modelo
            produto.setNomeArquivoImagem(nomeArquivo);

            // 4. Salva a atualização no banco de dados
            produtoVendaRepository.save(produto);

            return ResponseEntity.ok("Imagem do produto atualizada com sucesso.");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}