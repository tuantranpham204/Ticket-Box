package com.example.ticketboxcoreservice.exception;

import com.example.ticketboxcoreservice.model.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Hidden;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.io.IOException;

@Slf4j
@Hidden
@RestControllerAdvice
public class GlobalExceptionHandler {

    // handle specific exception
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleResourceNotFoundException(ResourceNotFoundException exception, WebRequest webRequest)
    {
        ApiResponse apiResponse = ApiResponse.error(404, exception.getMessage());
        webRequest.getDescription(false);
        return new ResponseEntity<>(apiResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<ApiResponse> handleIOException(IOException exception,WebRequest webRequest){
        ApiResponse apiResponse = ApiResponse.error(400, exception.getMessage());
        webRequest.getDescription(false);
        return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse> handleAppException(AppException exception,WebRequest webRequest){
        ApiResponse apiResponse = ApiResponse.error(exception.getErrorCode().getCode(), exception.getErrorCode().getMessage());
        webRequest.getDescription(false);
        return new ResponseEntity<>(apiResponse,exception.getErrorCode().getStatus());

    }

    // global exception
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleGlobalException(Exception exception,WebRequest webRequest){
        ApiResponse apiResponse = ApiResponse.error(500, exception.getMessage());
        webRequest.getDescription(false);
        return new ResponseEntity<>(apiResponse,HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
