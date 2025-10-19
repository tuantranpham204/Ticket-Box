package com.example.ticketboxcoreservice.model.dto.request;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QrCodeRequest {
    private MultipartFile QrCodeImage;
}
