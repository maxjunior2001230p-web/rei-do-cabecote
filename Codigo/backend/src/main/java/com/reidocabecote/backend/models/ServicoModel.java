package com.reidocabecote.backend.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.JoinTable;
import jakarta.persistence.FetchType;
import jakarta.persistence.CascadeType;

import java.util.UUID;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "servico")
public class ServicoModel implements java.io.Serializable{
    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    private String descricao;
    private String tipo;
    private String status;
    private Double preco;
    private Date dataCriacao;
    private Date dataPrevista;
    private Double maoDeObra;
    private TipoPagamento tipoPagamento;
    private Date garantia;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "servico_peca",
        joinColumns = @JoinColumn(name = "servico_id"),
        inverseJoinColumns = @JoinColumn(name = "peca_id")
    )
    private List<PecaModel> pecas = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "veiculo_id")
    private VeiculoModel veiculo;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private ClienteModel cliente;

    public ServicoModel() {
    }

    public ServicoModel(String descricao, String tipo, String status, List<PecaModel> pecas, 
                        VeiculoModel veiculo, Date dataPrevista, Double maoDeObra, TipoPagamento tipoPagamento, Date garantia) {
        this.descricao = descricao;
        this.tipo = tipo;
        this.status = status;
        this.pecas = pecas != null ? pecas : new ArrayList<>();
        double somaPecas = 0.0;
        for (PecaModel p : this.pecas) {
            if (p != null && p.getPreco() != null) somaPecas += p.getPreco();
        }
        double mao = maoDeObra != null ? maoDeObra : 0.0;
        this.preco = somaPecas + mao;
        this.veiculo = veiculo;
        this.dataCriacao = Date.from(java.time.Instant.now());
        this.dataPrevista = dataPrevista;
        this.maoDeObra = maoDeObra;
        this.tipoPagamento = tipoPagamento;
        this.cliente = (veiculo != null) ? veiculo.getCliente() : null;
        this.garantia = garantia;
    }

    public static long getSerialversionuid() {
        return serialVersionUID;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }   

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getPreco() {
        return preco;
    }

    public void setPreco(Double preco) {
        this.preco = preco;
    }

    public Date getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(Date dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public Date getDataPrevista() {
        return dataPrevista;
    }

    public void setDataPrevista(Date dataPrevista) {
        this.dataPrevista = dataPrevista;
    }

    public Double getMaoDeObra() {
        return maoDeObra;
    }

    public void setMaoDeObra(Double maoDeObra) {
        this.maoDeObra = maoDeObra;
    }

    public List<PecaModel> getPecas() {
        return pecas;
    }

    public void setPecas(List<PecaModel> pecas) {
        this.pecas = pecas != null ? pecas : new ArrayList<>();
        double somaPecas = 0.0;
        for (PecaModel p : this.pecas) {
            if (p != null && p.getPreco() != null) somaPecas += p.getPreco();
        }
        double mao = this.maoDeObra != null ? this.maoDeObra : 0.0;
        this.preco = somaPecas + mao;
    }

    public void addPeca(PecaModel peca) {
        if (peca == null) return;
        this.pecas.add(peca);
        double precoPeca = peca.getPreco() != null ? peca.getPreco() : 0.0;
        this.preco = (this.preco != null ? this.preco : 0.0) + precoPeca;
    }

    public void removePeca(PecaModel peca) {
        if (peca == null) return;
        if (this.pecas.remove(peca)) {
            double precoPeca = peca.getPreco() != null ? peca.getPreco() : 0.0;
            this.preco = (this.preco != null ? this.preco : 0.0) - precoPeca;
        }
    }

    public VeiculoModel getVeiculo() {
        return veiculo;
    }

    public void setVeiculo(VeiculoModel veiculo) {
        this.veiculo = veiculo;
    }

    public ClienteModel getCliente() {
        return cliente;
    }

    public void setCliente(ClienteModel cliente) {
        this.cliente = cliente;
    }

    public TipoPagamento getTipoPagamento() {
        return tipoPagamento;
    }

    public void setTipoPagamento(TipoPagamento tipoPagamento) {
        this.tipoPagamento = tipoPagamento;
    }

    public Date getGarantia() {
        return garantia;
    }

    public void setGarantia(Date garantia) {
        this.garantia = garantia;
    }
}