package com.example.ticketboxcoreservice.service;

import com.google.zxing.*;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.common.HybridBinarizer;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class QrCodeService {
    public String decodeQrCode(MultipartFile qrCodeImage) {
        String resultStr = null;
        try {
            // Read the image from the MultipartFile
            BufferedImage bufferedImage = ImageIO.read(qrCodeImage.getInputStream());
            // Create a luminance source from the image
            LuminanceSource source = new BufferedImageLuminanceSource(bufferedImage);
            // Create a binary bitmap from the luminance source
            BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));
            // Use a MultiFormatReader to decode the QR code
            Result result = new MultiFormatReader().decode(bitmap);
            // Return the decoded text
            resultStr = result.getText();
        } catch (IOException | NotFoundException e) {
            throw new RuntimeException(e);
        }
        return resultStr;
    }

    public byte[] encodeQrCode(String text, int width, int height) {
        byte[] result = null;
        try {
            // Create a QRCodeWriter instance
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            // Encode the text into a BitMatrix
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
            // Create a stream to hold the PNG image bytes
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            // Write the BitMatrix to the stream as a PNG image
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            // Return the image data as a byte array
            result = pngOutputStream.toByteArray();
        } catch (IOException | WriterException e) {
            throw new RuntimeException(e);
        }
        return result;
    }
}
