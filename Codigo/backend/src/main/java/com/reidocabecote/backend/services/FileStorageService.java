package com.reidocabecote.backend.services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    // Define o diretório onde os arquivos serão salvos (ex: na raiz do projeto)
    private final Path uploadDir = Paths.get("uploads");

    public FileStorageService() {
        try {
            // Cria o diretório se ele não existir
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível criar o diretório de uploads!", e);
        }
    }

    public String salvarArquivo(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Falha ao armazenar arquivo vazio.");
        }

        // 1. Gera um nome de arquivo único para evitar conflitos
        String originalFilename = file.getOriginalFilename();
        String extensao = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extensao = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String nomeArquivoUnico = UUID.randomUUID().toString() + extensao;

        try {
            // 2. Resolve o caminho completo do arquivo (dentro da pasta 'uploads')
            Path destino = this.uploadDir.resolve(nomeArquivoUnico);

            // 3. Copia o arquivo para o destino
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destino, StandardCopyOption.REPLACE_EXISTING);
            }

            // 4. Retorna o nome único para ser salvo no banco
            return nomeArquivoUnico;

        } catch (IOException e) {
            throw new RuntimeException("Falha ao armazenar o arquivo.", e);
        }
    }
}