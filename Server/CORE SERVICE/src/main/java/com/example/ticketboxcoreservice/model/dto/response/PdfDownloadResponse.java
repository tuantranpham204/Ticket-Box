package com.example.ticketboxcoreservice.model.dto.response;

import lombok.*;
import org.springframework.http.HttpHeaders;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PdfDownloadResponse {
    HttpHeaders httpHeaders;
}
