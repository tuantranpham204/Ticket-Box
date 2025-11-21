package com.example.ticketboxcoreservice.model.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventResponse {
    private String id;
    private String name;
    private Boolean online;
    private String address;
    private String orgName;
    private String orgInfo;
    private Integer status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createDate;
    private LocalDateTime updateDate;
    private PdfResponse info;
    private ImageResponse img;
    private ImageResponse banner;
}
