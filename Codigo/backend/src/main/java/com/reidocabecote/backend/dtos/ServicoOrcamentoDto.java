package com.reidocabecote.backend.dtos;

import java.util.Date;
import java.util.List;
import java.util.UUID;

public class ServicoOrcamentoDto {
    private UUID id;
    private String descricao;
    private String tipo;
    private String status;
    private Date dataCriacao;
    private Date dataPrevista;
    private Date garantia;
    private String tipoPagamento;
    private String observacoes;

    private String clienteNome;
    private String clienteTelefone;
    private String clienteCpf;

    private String veiculoPlaca;
    private String veiculoModelo;
    private String veiculoMontadora;
    private String veiculoAnoModelo;

    private List<PecaResumoDto> pecas;

    private Double precoPeca;
    private Double maoDeObra;
    private Double total;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Date getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(Date dataCriacao) { this.dataCriacao = dataCriacao; }

    public Date getDataPrevista() { return dataPrevista; }
    public void setDataPrevista(Date dataPrevista) { this.dataPrevista = dataPrevista; }

    public Date getGarantia() { return garantia; }
    public void setGarantia(Date garantia) { this.garantia = garantia; }

    public String getTipoPagamento() { return tipoPagamento; }
    public void setTipoPagamento(String tipoPagamento) { this.tipoPagamento = tipoPagamento; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public String getClienteNome() { return clienteNome; }
    public void setClienteNome(String clienteNome) { this.clienteNome = clienteNome; }

    public String getClienteTelefone() { return clienteTelefone; }
    public void setClienteTelefone(String clienteTelefone) { this.clienteTelefone = clienteTelefone; }

    public String getClienteCpf() { return clienteCpf; }
    public void setClienteCpf(String clienteCpf) { this.clienteCpf = clienteCpf; }

    public String getVeiculoPlaca() { return veiculoPlaca; }
    public void setVeiculoPlaca(String veiculoPlaca) { this.veiculoPlaca = veiculoPlaca; }

    public String getVeiculoModelo() { return veiculoModelo; }
    public void setVeiculoModelo(String veiculoModelo) { this.veiculoModelo = veiculoModelo; }

    public String getVeiculoMontadora() { return veiculoMontadora; }
    public void setVeiculoMontadora(String veiculoMontadora) { this.veiculoMontadora = veiculoMontadora; }

    public String getVeiculoAnoModelo() { return veiculoAnoModelo; }
    public void setVeiculoAnoModelo(String veiculoAnoModelo) { this.veiculoAnoModelo = veiculoAnoModelo; }

    public List<PecaResumoDto> getPecas() { return pecas; }
    public void setPecas(List<PecaResumoDto> pecas) { this.pecas = pecas; }

    public Double getPrecoPeca() { return precoPeca; }
    public void setPrecoPeca(Double precoPeca) { this.precoPeca = precoPeca; }

    public Double getMaoDeObra() { return maoDeObra; }
    public void setMaoDeObra(Double maoDeObra) { this.maoDeObra = maoDeObra; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
}