package com.reidocabecote.backend.dtos;

import java.util.Date;
import java.util.List;

public class ServicoOrcamentoDto {
    private String descricao;
    private String tipo;
    private String status;
    private Date dataCriacao;
    private Date dataPrevista;

    private String clienteNome;
    private String clienteTelefone;
    private String clienteCpf;

    private String veiculoPlaca;
    private String veiculoModelo;

    private List<PecaResumoDto> pecas;

    private Double precoPeca;
    private Double maoDeObra;
    private Double total;

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

    public List<PecaResumoDto> getPecas() { return pecas; }
    public void setPecas(List<PecaResumoDto> pecas) { this.pecas = pecas; }

    public Double getPrecoPeca() { return precoPeca; }
    public void setPrecoPeca(Double precoPeca) { this.precoPeca = precoPeca; }

    public Double getMaoDeObra() { return maoDeObra; }
    public void setMaoDeObra(Double maoDeObra) { this.maoDeObra = maoDeObra; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
}