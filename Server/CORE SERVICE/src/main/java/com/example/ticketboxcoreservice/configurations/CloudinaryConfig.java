package com.example.ticketboxcoreservice.configurations;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {
    @Bean
    public Cloudinary configKey() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "fixedamateur");
        config.put("api_key", "951175863684589");
        config.put("api_secret", "knG6OGdu9iRqlMlf2Fe18w99m1Y");

        return new Cloudinary(config);
    }
}
