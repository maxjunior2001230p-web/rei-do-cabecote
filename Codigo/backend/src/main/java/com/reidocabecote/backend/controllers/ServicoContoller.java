package com.reidocabecote.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;

import java.util.Optional;
import java.util.UUID;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.HashSet;

import com.reidocabecote.backend.repositories.ServicoRepository;
import com.reidocabecote.backend.repositories.PecaRepository;
import com.reidocabecote.backend.repositories.VeiculoRepository;
import com.reidocabecote.backend.repositories.ClienteRepository;
import com.reidocabecote.backend.models.ServicoModel;
import com.reidocabecote.backend.models.PecaModel;
import com.reidocabecote.backend.models.VeiculoModel;
import com.reidocabecote.backend.dtos.ServicoDto;
import com.reidocabecote.backend.dtos.ServicoOrcamentoDto;
import com.reidocabecote.backend.services.ServicoServices;
import com.reidocabecote.backend.services.TwilioService;

@RestController
public class ServicoContoller {
    @Autowired
    ServicoRepository servicoRepository;

    @Autowired
    PecaRepository pecaRepository;

    @Autowired
    VeiculoRepository veiculoRepository;

    @Autowired
    ClienteRepository clienteRepository;

    @Autowired
    ServicoServices servicoServices;

    @PostMapping("/servicos")
    public ResponseEntity<Object> cadastrarServico(@RequestBody @Valid ServicoDto servicoDto) {
        List<UUID> pecasIds = servicoDto.idPecas();
        List<PecaModel> pecas = pecaRepository.findAllById(pecasIds);

        if (pecas.size() != pecasIds.size()) {
            Set<UUID> encontrados = pecas.stream().map(PecaModel::getId).collect(Collectors.toSet());
            Set<UUID> faltantes = new HashSet<>(pecasIds);
            faltantes.removeAll(encontrados);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Peças não encontradas: " + faltantes);
        }

        Optional<VeiculoModel> veiculoOpt = veiculoRepository.findById(servicoDto.idVeiculo());
        if (veiculoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Veículo não encontrado");
        }

        VeiculoModel veiculo = veiculoOpt.get();

        ServicoModel servico = new ServicoModel(
            servicoDto.descricao(),
            servicoDto.tipo(),
            servicoDto.status(),
            pecas,
            veiculo,
            servicoDto.dataPrevista(),
            servicoDto.maoDeObra(),
            servicoDto.tipoPagamento(),
            servicoDto.garantia()
        );

        servico.setCliente(veiculo.getCliente());

        ServicoModel salvo = servicoRepository.save(servico);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @GetMapping("/servicos")
    public ResponseEntity<Object> listarServicos() {
        return ResponseEntity.status(HttpStatus.OK).body(servicoRepository.findAll());
    }

    @GetMapping("/servicos/{id}")
    public ResponseEntity<Object> buscarServico(@PathVariable(value = "id") UUID id) {
        Optional<ServicoModel> servico = servicoRepository.findById(id);
        if (servico.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Serviço não encontrado.");
        }

        return ResponseEntity.status(HttpStatus.OK).body(servico.get());
    }

    @PutMapping("/servicos/{id}")
    public ResponseEntity<Object> alterarServico(
            @PathVariable(value = "id") UUID id,
            @RequestBody @Valid ServicoDto servicoDto) {

        Optional<ServicoModel> servicoOptional = servicoRepository.findById(id);
        if (servicoOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Serviço não encontrado.");
        }

        ServicoModel servicoModel = servicoOptional.get();
        String statusAnterior = servicoModel.getStatus();

        Optional<VeiculoModel> veiculoOpt = veiculoRepository.findById(servicoDto.idVeiculo());
        if (veiculoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Veículo não encontrado");
        }
        VeiculoModel veiculo = veiculoOpt.get();

        List<UUID> pecasIds = servicoDto.idPecas();
        List<PecaModel> pecas = pecaRepository.findAllById(pecasIds);
        if (pecas.size() != pecasIds.size()) {
            Set<UUID> encontrados = pecas.stream().map(PecaModel::getId).collect(Collectors.toSet());
            Set<UUID> faltantes = new HashSet<>(pecasIds);
            faltantes.removeAll(encontrados);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Peças não encontradas: " + faltantes);
        }

        servicoModel.setDescricao(servicoDto.descricao());
        servicoModel.setTipo(servicoDto.tipo());
        servicoModel.setStatus(servicoDto.status());
        servicoModel.setMaoDeObra(servicoDto.maoDeObra());
        servicoModel.setDataPrevista(servicoDto.dataPrevista());
        servicoModel.setGarantia(servicoDto.garantia());
        servicoModel.setTipoPagamento(servicoDto.tipoPagamento());
        servicoModel.setVeiculo(veiculo);
        servicoModel.setCliente(veiculo.getCliente());
        servicoModel.setPecas(pecas);

        double somaPecas = pecas.stream()
                .mapToDouble(p -> p.getPreco() != null ? p.getPreco() : 0.0)
                .sum();
        servicoModel.setPreco(somaPecas + (servicoDto.maoDeObra() != null ? servicoDto.maoDeObra() : 0.0));

        ServicoModel servicoAtualizado = servicoRepository.save(servicoModel);

        if (!statusAnterior.equalsIgnoreCase(servicoDto.status())) {
            try {
                String numeroDestino = "+5531998881262";
                String mensagem = "O status do serviço '" + servicoAtualizado.getDescricao() +
                        "' foi atualizado para: " + servicoAtualizado.getStatus();

                TwilioService.enviarMensagem(numeroDestino, mensagem);
            } catch (Exception e) {
                System.err.println("Erro ao enviar SMS via Twilio: " + e.getMessage());
            }
        }

        return ResponseEntity.status(HttpStatus.OK).body(servicoAtualizado);
    }

    @DeleteMapping("/servicos/{id}")
    public ResponseEntity<Object> deletarServico(@PathVariable(value = "id") UUID id) {
        Optional<ServicoModel> servico = servicoRepository.findById(id);
        if (servico.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Serviço não encontrado.");
        }
        servicoRepository.delete(servico.get());
        return ResponseEntity.status(HttpStatus.OK).body("Serviço deletado com sucesso.");
    }

    @GetMapping("/servicos/orcamento/{id}")
    public ResponseEntity<Object> gerarOrcamento(@PathVariable(value = "id") UUID id) {
        Optional<ServicoModel> servicoOpt = servicoRepository.findById(id);
        if (servicoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Serviço não encontrado.");
        }

        ServicoModel servico = servicoOpt.get();
        ServicoOrcamentoDto orcamento = ServicoServices.gerarOrcamento(servico);

        return ResponseEntity.status(HttpStatus.OK).body(orcamento);
    }

    @GetMapping("/servicos/relatorios/tipos-servicos-mais-realizados")
    public ResponseEntity<Object> getTiposServicosMaisRealizados() {
        Map<String, Long> resultado = servicoServices.getTiposServicosMaisRealizados();
        return ResponseEntity.status(HttpStatus.OK).body(resultado);
    }

    @GetMapping("/servicos/relatorios/pecas-mais-utilizadas")
    public ResponseEntity<Object> getPecasMaisUtilizadas() {
        Map<String, Long> resultado = servicoServices.getPecasMaisUtilizadas();
        return ResponseEntity.status(HttpStatus.OK).body(resultado);
    }

    @GetMapping("/servicos/relatorios/carros-mais-frequentes")
    public ResponseEntity<Object> getCarrosMaisFrequentes() {
        Map<String, Long> resultado = servicoServices.getCarrosMaisFrequentes();
        return ResponseEntity.status(HttpStatus.OK).body(resultado);
    }

    @GetMapping("/servicos/relatorios/produtos-mais-vendidos")
    public ResponseEntity<Object> getProdutosMaisVendidos() {
        Map<String, Integer> resultado = servicoServices.getProdutosMaisVendidos();
        return ResponseEntity.status(HttpStatus.OK).body(resultado);
    }
}