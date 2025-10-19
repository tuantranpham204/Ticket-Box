package com.example.ticketboxcoreservice.model.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse {
    private int code;
    private String message;
    Object data;

    public static ApiResponse succeed(Object data){
        return new ApiResponse(200, null ,data);
    }

    public static ApiResponse error(int code, String message){
        return new ApiResponse(code, message,null);
    }

}
