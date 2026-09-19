package com.reidocabecote.backend.services;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import com.reidocabecote.backend.models.ServicoModel;
import com.reidocabecote.backend.models.PecaModel;
import com.reidocabecote.backend.models.VeiculoModel;
import com.reidocabecote.backend.models.ClienteModel;
import com.reidocabecote.backend.models.ProdutoVendaModel;
import com.reidocabecote.backend.dtos.ServicoOrcamentoDto;
import com.reidocabecote.backend.dtos.PecaResumoDto;
import com.reidocabecote.backend.repositories.ServicoRepository;
import com.reidocabecote.backend.repositories.ProdutoVendaRepository;

import java.util.List;
import java.util.ArrayList;
import java.util.Objects;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class ServicoServices {
    
    @Autowired
    private ServicoRepository servicoRepository;

    @Autowired
    private ProdutoVendaRepository produtoVendaRepository;

    public static ServicoOrcamentoDto gerarOrcamento(ServicoModel servico) {
        if (servico == null) return null;

        List<PecaModel> pecas = servico.getPecas();
        VeiculoModel veiculo = servico.getVeiculo();
        ClienteModel cliente = servico.getCliente();

        double precoPeca = 0.0;

        // lista de peças detalhadas para o DTO
        List<PecaResumoDto> pecasResumo = new ArrayList<>();
        if (pecas != null && !pecas.isEmpty()) {
            precoPeca = pecas.stream()
                    .filter(Objects::nonNull)
                    .mapToDouble(p -> p.getPreco() != null ? p.getPreco() : 0.0)
                    .sum();

            pecasResumo = pecas.stream()
                    .filter(Objects::nonNull)
                    .map(p -> new PecaResumoDto(
                            p.getNome(),
                            p.getDescricao(),
                            p.getPreco()
                    ))
                    .collect(Collectors.toList());
        }

        double maoDeObra = (servico.getMaoDeObra() != null) ? servico.getMaoDeObra() : 0.0;
        double total = precoPeca + maoDeObra;

        ServicoOrcamentoDto dto = new ServicoOrcamentoDto();
        dto.setDescricao(servico.getDescricao());
        dto.setTipo(servico.getTipo());
        dto.setStatus(servico.getStatus());
        dto.setDataCriacao(servico.getDataCriacao());
        dto.setDataPrevista(servico.getDataPrevista());

        if (cliente != null) {
            dto.setClienteNome(cliente.getNome());
            dto.setClienteTelefone(cliente.getTelefone());
            dto.setClienteCpf(cliente.getCpf());
        }

        if (veiculo != null) {
            dto.setVeiculoPlaca(veiculo.getPlaca());
            dto.setVeiculoModelo(veiculo.getModelo());
        }

        dto.setPecas(pecasResumo);
        dto.setPrecoPeca(precoPeca);
        dto.setMaoDeObra(maoDeObra);
        dto.setTotal(total);

        return dto;
    }

    public Map<String, Long> getTiposServicosMaisRealizados() {
        List<ServicoModel> servicos = servicoRepository.findAll();
        return servicos.stream()
                .filter(s -> s.getTipo() != null)
                .collect(Collectors.groupingBy(
                        ServicoModel::getTipo,
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        HashMap::new
                ));
    }

    public Map<String, Long> getPecasMaisUtilizadas() {
        List<ServicoModel> servicos = servicoRepository.findAll();
        return servicos.stream()
                .flatMap(s -> s.getPecas() != null ? s.getPecas().stream() : new ArrayList<PecaModel>().stream())
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(
                        PecaModel::getNome,
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        HashMap::new
                ));
    }

    public Map<String, Long> getCarrosMaisFrequentes() {
        List<ServicoModel> servicos = servicoRepository.findAll();
        return servicos.stream()
                .filter(s -> s.getVeiculo() != null && s.getVeiculo().getPlaca() != null)
                .collect(Collectors.groupingBy(
                        s -> s.getVeiculo().getPlaca() + " - " + s.getVeiculo().getModelo(),
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        HashMap::new
                ));
    }

    public Map<String, Integer> getProdutosMaisVendidos() {
        List<ProdutoVendaModel> produtos = produtoVendaRepository.findAll();
        return produtos.stream()
                .filter(p -> p.getNome() != null && p.getQuantidade() > 0)
                .collect(Collectors.groupingBy(
                        ProdutoVendaModel::getNome,
                        Collectors.summingInt(ProdutoVendaModel::getQuantidade)
                ))
                .entrySet()
                .stream()
                .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        HashMap::new
                ));
    }
}