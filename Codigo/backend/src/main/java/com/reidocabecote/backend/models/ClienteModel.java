package com.reidocabecote.backend.models;

import jakarta.persistence.*;
import java.util.List;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Cliente")
public class ClienteModel implements java.io.Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String nome;
    private String cpf;
    private String endereco;
    private String telefone;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VeiculoModel> veiculos;

    public ClienteModel() {}

    public UUID getId() {return id;}
    public void setId(UUID id) {this.id = id;}
    public String getNome() {return nome;}
    public void setNome(String nome) {this.nome = nome;}
    public String getCpf() {return cpf;}
    public void setCpf(String cpf) {this.cpf = cpf;}
    public String getEndereco() {return endereco;}
    public void setEndereco(String endereco) {this.endereco = endereco;}
    public String getTelefone() {return telefone;}
    public void setTelefone(String telefone) {this.telefone = telefone;}
    @JsonIgnore
    public List<VeiculoModel> getVeiculos() {return veiculos;}
    public void setVeiculos(List<VeiculoModel> veiculos) {this.veiculos = veiculos;}
}
