package com.reidocabecote.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "Veiculo")
public class VeiculoModel {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    private String placa;
    private String modelo;
    private String montadora;
    private String ano_modelo;
    private String ano_fabricacao;
    private String cor;
    @Enumerated(EnumType.STRING)
    private TipoCambio cambio;
    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private ClienteModel cliente;

    public VeiculoModel(String placa, String modelo, String montadora, String ano_modelo, String ano_fabricacao, String cor, TipoCambio cambio) {
        this.placa = placa;
        this.modelo = modelo;
        this.montadora = montadora;
        this.ano_modelo = ano_modelo;
        this.ano_fabricacao = ano_fabricacao;
        this.cor = cor;
        this.cambio = cambio;
    }

    public VeiculoModel() {
    }

    public static long getSerialversionuid() {return serialVersionUID;}
    public UUID getId() {return id;}
    public void setId(UUID id) {this.id = id;}

    public String getPlaca() {return placa;}
    public void setPlaca(String placa) {this.placa = placa;}
    public String getModelo() {return modelo;}
    public void setModelo(String modelo) {this.modelo = modelo;}
    public String getMontadora() {return montadora;}
    public void setMontadora(String montadora) {this.montadora = montadora;}
    public String getAno_modelo() {return ano_modelo;}
    public void setAno_modelo(String ano_modelo) {this.ano_modelo = ano_modelo;}
    public String getAno_fabricacao() {return ano_fabricacao;}
    public void setAno_fabricacao(String ano_fabricacao) {this.ano_fabricacao = ano_fabricacao;}
    public String getCor() {return cor;}
    public void setCor(String cor) {this.cor = cor;}
    public TipoCambio getCambio() {return cambio;}
    public void setCambio(TipoCambio cambio) {this.cambio = cambio;}
    public ClienteModel getCliente() {return cliente;}
    public void setCliente(ClienteModel cliente) {this.cliente = cliente;}
}
