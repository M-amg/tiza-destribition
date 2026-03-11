package com.tizadestribution.app.catalog.service;

import com.tizadestribution.app.catalog.dto.UploadedImageResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class AdminProductImageStorageService {

    private static final int MAX_FILES_PER_UPLOAD = 12;
    private final Path productImagesDirectory;
    private final Path categoryImagesDirectory;

    public AdminProductImageStorageService(@Value("${app.media.upload-dir:uploads}") String uploadDirectory) {
        Path baseDirectory = Paths.get(uploadDirectory).toAbsolutePath().normalize();
        this.productImagesDirectory = baseDirectory.resolve("products").normalize();
        this.categoryImagesDirectory = baseDirectory.resolve("categories").normalize();

        try {
            Files.createDirectories(productImagesDirectory);
            Files.createDirectories(categoryImagesDirectory);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to initialize product image storage", ex);
        }
    }

    public List<UploadedImageResponse> storeProductImages(List<MultipartFile> files, String baseUrl) {
        if (files == null || files.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No image files uploaded");
        }
        if (files.size() > MAX_FILES_PER_UPLOAD) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can upload up to " + MAX_FILES_PER_UPLOAD + " images at once");
        }

        List<UploadedImageResponse> uploadedImages = new ArrayList<>(files.size());
        for (MultipartFile file : files) {
            uploadedImages.add(storeSingleFile(file, baseUrl, productImagesDirectory, "products"));
        }

        return uploadedImages;
    }

    public UploadedImageResponse storeCategoryImage(MultipartFile file, String baseUrl) {
        return storeSingleFile(file, baseUrl, categoryImagesDirectory, "categories");
    }

    private UploadedImageResponse storeSingleFile(
            MultipartFile file,
            String baseUrl,
            Path targetDirectory,
            String publicFolder
    ) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Empty files are not allowed");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files are allowed");
        }

        String extension = resolveExtension(file.getOriginalFilename());
        String storedFileName = UUID.randomUUID() + extension;
        Path destination = targetDirectory.resolve(storedFileName).normalize();
        if (!destination.startsWith(targetDirectory)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store image");
        }

        String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String url = normalizedBaseUrl + "/uploads/" + publicFolder + "/" + storedFileName;
        return new UploadedImageResponse(url, storedFileName, file.getSize(), contentType);
    }

    private String resolveExtension(String originalFilename) {
        if (!StringUtils.hasText(originalFilename)) {
            return ".jpg";
        }

        String sanitizedName = StringUtils.cleanPath(originalFilename);
        int dotIndex = sanitizedName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == sanitizedName.length() - 1) {
            return ".jpg";
        }

        String rawExtension = sanitizedName.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
        if (!rawExtension.matches("[a-z0-9]{1,5}")) {
            return ".jpg";
        }

        return "." + rawExtension;
    }
}
