package com.reidocabecote.backend.configs;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Mapeia a URL /imagens/** para o diretório físico file:./uploads/
        // Ex: Se um arquivo se chama "foto.png" em "uploads/"
        // Ele será acessível em "http://localhost:8080/imagens/foto.png"
        registry.addResourceHandler("/imagens/**")
                .addResourceLocations("file:./uploads/");
    }
}