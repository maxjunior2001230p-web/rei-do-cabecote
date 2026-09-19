package com.reidocabecote.backend.dtos;

public class PecaResumoDto {
    private String nome;
    private String descricao;
    private Double preco;

    public PecaResumoDto() {}

    public PecaResumoDto(String nome, String descricao, Double preco) {
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
    }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public Double getPreco() { return preco; }
    public void setPreco(Double preco) { this.preco = preco; }
}
