package com.reidocabecote.backend.models;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "ProdutoVenda")
public class ProdutoVendaModel implements java.io.Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    private String nome;
    private String descricao;
    private int quantidade;
    private double precoVenda;
    private String categoria;
    private StatusVenda statusVenda;
    private String nomeArquivoImagem;

    public ProdutoVendaModel(String nome, String descricao, int quantidade, double precoVenda, String categoria, StatusVenda statusVenda, String nomeArquivoImagem) {
        this.nome = nome;
        this.descricao = descricao;
        this.quantidade = quantidade;
        this.precoVenda = precoVenda;
        this.categoria = categoria;
        this.statusVenda = statusVenda;
        this.nomeArquivoImagem = nomeArquivoImagem;
    }

    public ProdutoVendaModel() {
    }

    public static long getSerialversionuid() {return serialVersionUID;}
    public UUID getId() {return id;}
    public void setId(UUID id) {this.id = id;}
    public String getNome() {return nome;}
    public void setNome(String nome) {this.nome = nome;}
    public String getDescricao() {return descricao;}
    public void setDescricao(String descricao) {this.descricao = descricao;}
    public int getQuantidade() {return quantidade;}
    public void setQuantidade(int quantidade) {this.quantidade = quantidade;}
    public double getPrecoVenda() {return precoVenda;}
    public void setPrecoVenda(double precoVenda) {this.precoVenda = precoVenda;}
    public String getCategoria() {return categoria;}
    public void setCategoria(String categoria) {this.categoria = categoria;}
    public StatusVenda getStatusVenda() {return statusVenda;}
    public void setStatusVenda(StatusVenda statusVenda) {this.statusVenda = statusVenda;}
    public String getNomeArquivoImagem() {return nomeArquivoImagem;}
    public void setNomeArquivoImagem(String nomeArquivoImagem) {this.nomeArquivoImagem = nomeArquivoImagem;}

}
