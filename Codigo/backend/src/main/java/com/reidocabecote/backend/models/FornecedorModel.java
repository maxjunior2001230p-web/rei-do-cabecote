package com.reidocabecote.backend.models;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "Fornecedor")
public class FornecedorModel {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    private String nome;
    private String cnpj;
    private String endereco;
    private String complemento;
    private String contato;
    private String categoria;

    public FornecedorModel(String nome, String cnpj, String endereco, String complemento, String contato, String categoria) {
        this.nome = nome;
        this.cnpj = cnpj;
        this.endereco = endereco;
        this.complemento = complemento;
        this.contato = contato;
        this.categoria = categoria;
    }

    public FornecedorModel() {
    }

    public static long getSerialversionuid() {return serialVersionUID;}
    public UUID getId() {return id;}
    public void setId(UUID id) {this.id = id;}
    public String getNome() {return nome;}
    public void setNome(String nome) {this.nome = nome;}
    public String getCnpj() {return cnpj;}
    public void setCnpj(String cnpj) {this.cnpj = cnpj;}
    public String getEndereco() {return endereco;}
    public void setEndereco(String endereco) {this.endereco = endereco;}
    public String getComplemento() {return complemento;}
    public void setComplemento(String complemento) {this.complemento = complemento;}
    public String getContato() {return contato;}
    public void setContato(String contato) {this.contato = contato;}
    public String getCategoria() {return categoria;}
    public void setCategoria(String categoria) {this.categoria = categoria;}
}

