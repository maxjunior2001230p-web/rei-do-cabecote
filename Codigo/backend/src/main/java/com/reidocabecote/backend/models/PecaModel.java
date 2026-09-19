package com.reidocabecote.backend.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import java.util.UUID;

@Entity
@Table(name = "Peca")
public class PecaModel implements java.io.Serializable{
    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    private String nome;
    private String descricao;
    private Double preco;
    private String fornecedor;
    private String situacao;

    public PecaModel() {
    }

    public PecaModel(String nome, String descricao, Double preco, String fornecedor, String situacao) {
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
        this.fornecedor = fornecedor;
        this.situacao = situacao;
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

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Double getPreco() {
        return preco;
    }

    public void setPreco(Double preco) {
        this.preco = preco;
    }

    public String getFornecedor() {
        return fornecedor;
    }

    public void setFornecedor(String fornecedor) {
        this.fornecedor = fornecedor;
    }

    public String getSituacao() {
        return situacao;
    }

    public void setSituacao(String situacao) {
        this.situacao = situacao;
    }

}
