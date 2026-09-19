package com.reidocabecote.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/fipe")
public class FipeController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String FIPE_API_URL = "https://parallelum.com.br/fipe/api/v1/carros/marcas";

    @GetMapping("/marcas")
    public ResponseEntity<String> getMarcas() {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(FIPE_API_URL, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro ao buscar marcas: " + e.getMessage());
        }
    }

    @GetMapping("/marcas/{marcaId}/modelos")
    public ResponseEntity<String> getModelos(@PathVariable String marcaId) {
        try {
            String url = FIPE_API_URL + "/" + marcaId + "/modelos";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro ao buscar modelos: " + e.getMessage());
        }
    }
}
