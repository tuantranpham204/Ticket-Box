package com.example.ticketboxcoreservice.configurations;

import com.example.ticketboxcoreservice.enumf.Constants;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(httpSecurityCorsConfigurer -> corsFilter())
                .authorizeHttpRequests(
                        config -> config

                                .requestMatchers("/api/auth/**").permitAll()
                                .requestMatchers("/swagger-ui/index.html/**", "/v3/api-docs/**", "/swagger-ui/**")
                                .permitAll()
                                .requestMatchers(HttpMethod.GET, String.format("/api/events/category/%s", Constants.EVENT_STATUS_UPCOMING)).permitAll()
                                .requestMatchers(HttpMethod.GET, String.format("/api/events/category/%s", Constants.EVENT_STATUS_RUNNING)).permitAll()
                                .requestMatchers(HttpMethod.GET, String.format("/api/events/%s", Constants.EVENT_STATUS_UPCOMING)).permitAll()
                                .requestMatchers(HttpMethod.GET, String.format("/api/events/%s", Constants.EVENT_STATUS_UPCOMING)).permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/events/ticket/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/events/event/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/tickets/event/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/events/search/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/events/events").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/tickets/lowest-price/**").permitAll()

                                // USER endpoints
                                .requestMatchers(HttpMethod.GET, String.format("/api/events/category/**")).hasAnyRole("USER", "ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.GET, "/api/users/{userId}/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.POST, "/api/orders/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.GET, "/api/orders/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.PUT, "/api/orders/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.DELETE, "/api/orders/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")

                                .requestMatchers(HttpMethod.POST, "/api/tickets/create/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.PUT, "/api/tickets/cancel/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.POST, "/api/events/create/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.PUT, "/api/events/cancel/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")

                                .requestMatchers(HttpMethod.GET, "/api/order-tickets/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.PUT, "/api/order-tickets/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.POST, "/api/order-tickets/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.DELETE, "/api/order-tickets/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")

                                .requestMatchers(HttpMethod.GET, "/api/events/creator/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.PUT, "/api/users/{userId}/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.GET, "/api/events/{status}").permitAll()

                                // .requestMatchers(HttpMethod.POST, "api/images/**").hasAnyRole("USER",
                                // "ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.GET, "/api/events/event/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.GET, "/api/events/category/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.GET, "/api/events/ticket/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.PUT, "/api/events/upload/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.GET, "/api/tickets/event/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.PUT, "/api/users/avatar/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.PUT, "/api/users/change-password/**")
                                .hasAnyRole("USER", "ADMIN", "APPROVER")

                                // APPROVER endpoints
                                .requestMatchers(HttpMethod.PUT, "/api/tickets/decline/**")
                                .hasAnyRole("ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.PUT, "/api/tickets/approve/**")
                                .hasAnyRole("ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.PUT, "/api/events/decline/**")
                                .hasAnyRole("ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.PUT, "/api/events/approve/**")
                                .hasAnyRole("ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.GET, "/api/events/approver/**")
                                .hasAnyRole("ADMIN", "APPROVER")
                                .requestMatchers(HttpMethod.GET, "/api/events/contract/**")
                                .hasAnyRole("ADMIN", "APPROVER")

                                // Admin endpoints
                                .requestMatchers(HttpMethod.POST, "/api/categories/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.GET, "/api/users/**").hasRole("ADMIN")

                                // .requestMatchers(HttpMethod.POST, "/api/images/**").hasRole("ADMIN")
                                // .requestMatchers(HttpMethod.PUT, "/api/images/**").hasRole("ADMIN")
                                // .requestMatchers(HttpMethod.DELETE, "/api/images/**").hasRole("ADMIN")

                                // Default policy
                                .anyRequest().denyAll())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.addAllowedOrigin("*");
        corsConfiguration.addAllowedMethod("*");
        corsConfiguration.addAllowedHeader("*");
        UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
        urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration);

        return new CorsFilter(urlBasedCorsConfigurationSource);
    }

}
