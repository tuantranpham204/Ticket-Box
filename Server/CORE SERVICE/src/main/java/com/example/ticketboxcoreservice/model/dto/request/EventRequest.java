package com.example.ticketboxcoreservice.model.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRequest {
    private ImageRequest img;
    private ImageRequest banner;
    private String name;
    private Boolean online;
    private String address;
    private String info;
    private CategoryRequest category;
    private String orgName;
    private String orgInfo;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
