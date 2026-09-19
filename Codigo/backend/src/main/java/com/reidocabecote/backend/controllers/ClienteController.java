package com.reidocabecote.backend.controllers;

import com.reidocabecote.backend.dtos.ClienteDto;
import com.reidocabecote.backend.models.ClienteModel;
import com.reidocabecote.backend.repositories.ClienteRepository;
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
@RequestMapping("/clientes")
public class ClienteController {

    @Autowired
    ClienteRepository clienteRepository;

    @PostMapping("")
    public ResponseEntity<ClienteModel> cadastrarCliente(@RequestBody @Valid ClienteDto clienteDto) {
        var clienteModel = new ClienteModel();
        BeanUtils.copyProperties(clienteDto, clienteModel);
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteRepository.save(clienteModel));
    }

    @GetMapping("")
    public ResponseEntity<List<ClienteModel>> listarClientes() {
        return ResponseEntity.status(HttpStatus.OK).body(clienteRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> buscarCliente(@PathVariable(value = "id") UUID id) {
        Optional<ClienteModel> cliente = clienteRepository.findById(id);
        if (cliente.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado.");
        }
        return ResponseEntity.status(HttpStatus.OK).body(cliente.get());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> alterarCliente(@PathVariable(value = "id") UUID id,
                                                 @RequestBody @Valid ClienteDto clienteDto) {
        Optional<ClienteModel> cliente = clienteRepository.findById(id);
        if (cliente.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado.");
        }
        var clienteModel = cliente.get();
        BeanUtils.copyProperties(clienteDto, clienteModel);
        return ResponseEntity.status(HttpStatus.OK).body(clienteRepository.save(clienteModel));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deletarCliente(@PathVariable(value = "id") UUID id) {
        Optional<ClienteModel> cliente = clienteRepository.findById(id);
        if (cliente.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado.");
        }
        clienteRepository.delete(cliente.get());
        return ResponseEntity.status(HttpStatus.OK).body("Cliente deletado com sucesso.");
    }
}
