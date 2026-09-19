package com.reidocabecote.backend.configs;

import com.reidocabecote.backend.configs.SecurityFilter;

import jakarta.servlet.FilterRegistration;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.couchbase.CouchbaseProperties.Authentication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class SecurityConfigurations {
    
    @Autowired
    SecurityFilter securityFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity HttpSecurity) throws Exception {
        return HttpSecurity
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() 
                
                .requestMatchers(HttpMethod.POST,"/usuario/**").permitAll()
                .requestMatchers(HttpMethod.GET,"/usuario/**").permitAll()
                .requestMatchers(HttpMethod.PATCH,"/usuario/**").permitAll()
                .requestMatchers(HttpMethod.DELETE,"/usuario/**").permitAll()
                .requestMatchers(HttpMethod.POST,"/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET,"/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST,"/peca/**").permitAll()
                .requestMatchers(HttpMethod.GET,"/peca/**").permitAll()
                .requestMatchers(HttpMethod.PATCH,"/peca/**").permitAll()
                .requestMatchers(HttpMethod.DELETE,"/peca/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/cliente/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/cliente/**").permitAll()
                .requestMatchers(HttpMethod.PATCH, "/cliente/**").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/cliente/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/servicos/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/servicos/**").permitAll()
                .requestMatchers(HttpMethod.PATCH, "/servicos/**").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/servicos/**").permitAll()
                .requestMatchers(HttpMethod.PUT, "/servicos/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/produtosvenda/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/produtosvenda/**").permitAll()
                .requestMatchers(HttpMethod.PATCH, "/produtosvenda/**").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/produtosvenda/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/imagens/**").permitAll()
                .requestMatchers(HttpMethod.DELETE,"/veiculos/**").permitAll()
                .requestMatchers(HttpMethod.POST,"/veiculos/**").permitAll()
                .requestMatchers(HttpMethod.GET,"/veiculos/**").permitAll()
                .requestMatchers(HttpMethod.PATCH,"/veiculos/**").permitAll()
                .requestMatchers(HttpMethod.PUT,"/veiculos/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        String corsOrigins = System.getenv().getOrDefault(
            "CORS_ALLOWED_ORIGINS",
            "http://localhost:5173,https://heartfelt-sparkle-production-3dee.up.railway.app"
        );
        List<String> origins = Arrays.stream(corsOrigins.split(","))
            .map(String::trim)
            .map(origin -> origin.replaceAll("/+$", ""))
            .filter(origin -> !origin.isEmpty())
            .toList();

        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOriginPatterns(origins);
        corsConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")); // Adicione OPTIONS e PATCH se necessário
        corsConfig.setAllowCredentials(true);
        corsConfig.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        return source;
    }

    @Bean AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    FilterRegistrationBean<CorsFilter> corsFilter() {
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(
                new CorsFilter(corsConfigurationSource()));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
}
