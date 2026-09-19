package com.reidocabecote.backend.services;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

public class TwilioService {

    private static final String ACCOUNT_SID = requiredEnv("TWILIO_ACCOUNT_SID");
    private static final String AUTH_TOKEN = requiredEnv("TWILIO_AUTH_TOKEN");
    private static final String TWILIO_PHONE_NUMBER = requiredEnv("TWILIO_PHONE_NUMBER");

    private static String requiredEnv(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Variável de ambiente obrigatória ausente: " + name);
        }
        return value;
    }

    public static void enviarMensagem(String destino, String mensagemTexto) {
        Twilio.init(ACCOUNT_SID, AUTH_TOKEN);

        Message message = Message.creator(
                new PhoneNumber(destino),     
                new PhoneNumber(TWILIO_PHONE_NUMBER), 
                mensagemTexto                    
        ).create();

        System.out.println("SMS enviado com sucesso! SID: " + message.getSid());
    }
}
