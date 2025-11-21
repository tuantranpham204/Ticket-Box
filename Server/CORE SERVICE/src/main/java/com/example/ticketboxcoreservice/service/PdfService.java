package com.example.ticketboxcoreservice.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import com.example.ticketboxcoreservice.enumf.ErrorCode;
import com.example.ticketboxcoreservice.exception.AppException;
import com.example.ticketboxcoreservice.exception.ResourceNotFoundException;
import com.example.ticketboxcoreservice.model.dto.request.PdfRequest;
import com.example.ticketboxcoreservice.model.dto.response.MessageResponse;
import com.example.ticketboxcoreservice.model.dto.response.PdfDownloadResponse;
import com.example.ticketboxcoreservice.model.dto.response.PdfResponse;
import com.example.ticketboxcoreservice.model.entity.Pdf;
import com.example.ticketboxcoreservice.repository.PdfRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.modelmapper.ModelMapper;
import org.modelmapper.internal.Pair;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PdfService {
    private final PdfRepository pdfRepository;
    private final Cloudinary cloudinary;
    private final ModelMapper modelMapper;

    public Pdf uploadPdf(PdfRequest request) {
        MultipartFile file = request.getFile();
        if (!"application/pdf".equals(file.getContentType())) {
            throw new AppException(ErrorCode.ONLY_PDF_ALLOWED);
        }
        pdfRepository.save(generatePdf(file));
        return pdfRepository.save(generatePdf(file));
    }
    public Pdf replacePdf(Pdf pdf, MultipartFile file) throws IOException {
        if (!"application/pdf".equals(file.getContentType())) {
            throw new AppException(ErrorCode.ONLY_PDF_ALLOWED);
        }
        Pdf newPdf = generatePdf(file);
        newPdf.setId(pdf.getId());
        return pdfRepository.save(newPdf);
    }

    public PdfResponse getPdf(Pdf pdf) {
        return PdfResponse.builder()
                .url(pdf.getUrl())
                .build();
    }

    public PdfDownloadResponse getPdfDownloadable(Pdf pdf) {
        String downloadUrl = cloudinary.url( ).transformation(
                new Transformation().flags("attachment")
        ).generate(pdf.getPublicId());

        // We use an HTTP 302 Redirect to send them to the Cloudinary download link.
        // This is much faster than streaming the file through our Java server.
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(downloadUrl));
        return PdfDownloadResponse.builder()
                .httpHeaders(headers)
                .build();
    }

    public Pdf generatePdf(MultipartFile file) {
        assert file.getOriginalFilename() != null;
        String publicValue = generatePublicValue(file.getOriginalFilename());
        String extension = "jpeg";
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be null or empty");
        }
        String originalName = file.getOriginalFilename();
        if (originalName == null) {
            throw new IllegalArgumentException("Original filename must not be null");
        }
        if (cloudinary.config.apiKey == null || cloudinary.config.apiKey.isEmpty()) {
            throw new IllegalArgumentException("Must supply api_key"); // This line is the culprit
        }
        File fileUpload = null;
        try {
            fileUpload = convert(file);
            cloudinary.uploader().upload(fileUpload, ObjectUtils.asMap("public_id", publicValue));
            cleanDisk(fileUpload);
        } catch (IOException e) {
            throw new IllegalArgumentException(e.getMessage());
        }
        String url = cloudinary.url().generate(StringUtils.join(publicValue,".",extension));
        return new Pdf(null,  originalName, publicValue, url);
    }
    private File convert(MultipartFile file) throws IOException {
        assert file.getOriginalFilename() != null;
        File convFile = new File(StringUtils.join(generatePublicValue(file.getOriginalFilename()), getFileName(file.getOriginalFilename())[1]));
        try (InputStream is = file.getInputStream()) {
            Files.copy(is, convFile.toPath());
        }
        return convFile;
    }
    private String generatePublicValue(String originalName) {
        String fileName = getFileName(originalName)[0];
        return StringUtils.join(UUID.randomUUID().toString(),"-",fileName);
    }
    private String[] getFileName(String originalName) {
        return originalName.split("\\.");
    }
    private void cleanDisk(File file) {
        try {
            Path filePath = file.toPath();
            Files.delete(filePath);
        } catch (IOException e) {
            System.err.print("Error");
        }
    }
}
