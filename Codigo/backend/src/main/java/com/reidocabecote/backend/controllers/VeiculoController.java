package com.reidocabecote.backend.controllers;

import com.reidocabecote.backend.dtos.VeiculoDto;
import com.reidocabecote.backend.models.VeiculoModel;
import com.reidocabecote.backend.repositories.VeiculoRepository;
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
@RequestMapping("/veiculos")
public class VeiculoController {

    @Autowired
    VeiculoRepository veiculoRepository;

    @Autowired
    ClienteRepository clienteRepository;

    @PostMapping("")
    public ResponseEntity<Object> cadastrarVeiculo(@RequestBody @Valid VeiculoDto veiculoDto) {
        Optional<ClienteModel> clienteOpt = clienteRepository.findById(veiculoDto.clienteId());
        if (clienteOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado.");
        }

        var veiculoModel = new VeiculoModel();
        BeanUtils.copyProperties(veiculoDto, veiculoModel);
        veiculoModel.setCliente(clienteOpt.get());

        return ResponseEntity.status(HttpStatus.CREATED).body(veiculoRepository.save(veiculoModel));
    }

    @GetMapping("")
    public ResponseEntity<List<VeiculoModel>> listarVeiculos() {
        return ResponseEntity.status(HttpStatus.OK).body(veiculoRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> buscarVeiculo(@PathVariable(value = "id") UUID id) {
        Optional<VeiculoModel> veiculo = veiculoRepository.findById(id);
        if (veiculo.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Veiculo não encontrado.");
        }

        return ResponseEntity.status(HttpStatus.OK).body(veiculo.get());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> alterarVeiculo(@PathVariable(value = "id") UUID id, @RequestBody @Valid VeiculoDto veiculoDto) {
        Optional<ClienteModel> clienteOpt = clienteRepository.findById(veiculoDto.clienteId());
        if (clienteOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado.");
        }

        Optional<VeiculoModel> veiculo = veiculoRepository.findById(id);
        if (veiculo.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Veiculo não encontrado.");
        }
        var veiculoModel = veiculo.get();
        BeanUtils.copyProperties(veiculoDto, veiculoModel);
        veiculoModel.setCliente(clienteOpt.get());

        return ResponseEntity.status(HttpStatus.OK).body(veiculoRepository.save(veiculoModel));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deletarVeiculo(@PathVariable(value = "id") UUID id) {
        Optional<VeiculoModel> veiculo = veiculoRepository.findById(id);
        if (veiculo.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Veiculo não encontrado.");
        }
        veiculoRepository.delete(veiculo.get());
        return ResponseEntity.status(HttpStatus.OK).body("Veiculo deletado com sucesso.");
    }
}
