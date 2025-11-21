package com.example.ticketboxcoreservice.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.ticketboxcoreservice.exception.ResourceNotFoundException;
import com.example.ticketboxcoreservice.model.dto.request.ImageRequest;
import com.example.ticketboxcoreservice.model.dto.response.ImageResponse;
import com.example.ticketboxcoreservice.model.dto.response.MessageResponse;
import com.example.ticketboxcoreservice.model.entity.Image;
import com.example.ticketboxcoreservice.repository.ImageRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageService {
    private final ImageRepository imageRepository;
    private final ModelMapper modelMapper;
    private final Cloudinary cloudinary;

    public ImageResponse uploadImage(ImageRequest request) throws IOException {
        Image image = new Image();
        image.setUrl(generateMediaLink(request.getImage()));
        return modelMapper.map(imageRepository.save(image), ImageResponse.class);
    }
    public ImageResponse replaceImage(Image image, MultipartFile file) throws IOException {
        image.setUrl(generateMediaLink(file));
        return modelMapper.map(imageRepository.save(image), ImageResponse.class);
    }

    public ImageResponse getImageByImageId(Long id) {
        Image image = imageRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("image", "image id", id)
        );

        return modelMapper.map(image, ImageResponse.class);
    }
    public ImageResponse updateImageByImageId(Long id, ImageRequest request) throws IOException {
        Image image = imageRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("image", "image id", id)
        );
        image.setUrl(generateMediaLink(request.getImage()));

        return modelMapper.map(imageRepository.save(image), ImageResponse.class);
    }
    public MessageResponse deleteImageByImageId(Long id) {
        if (!imageRepository.existsById(id)) throw new ResourceNotFoundException("image", "image id", id);
        imageRepository.deleteById(id);
        return new MessageResponse("Image with the id " + " deleted successfully!");
    }
    // generate media link functions
    public String generateMediaLink(MultipartFile file) throws IOException {
        assert file.getOriginalFilename() != null;
        String publicValue = generatePublicValue(file.getOriginalFilename());
        String extension = getFileName(file.getOriginalFilename())[1];
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be null or empty");
        }
        String originalName = file.getOriginalFilename();
        if (originalName == null) {
            throw new IllegalArgumentException("Original filename must not be null");
        }
        // Possible new validation
        if (cloudinary.config.apiKey == null || cloudinary.config.apiKey.isEmpty()) {
            throw new IllegalArgumentException("Must supply api_key"); // This line is the culprit
        }
        File fileUpload = convert(file);
        cloudinary.uploader().upload(fileUpload, ObjectUtils.asMap("public_id", publicValue));
        cleanDisk(fileUpload);
        return cloudinary.url().generate(StringUtils.join(publicValue,".",extension));
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
