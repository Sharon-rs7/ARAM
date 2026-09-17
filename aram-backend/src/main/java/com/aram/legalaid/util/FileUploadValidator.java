package com.aram.legalaid.util;

import com.aram.legalaid.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Component
public class FileUploadValidator {

    @Value("${app.upload.max-size-mb:10}")
    private long maxDocSizeMb;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private static final Set<String> ALLOWED_IMAGE_EXT = Set.of("png", "jpg", "jpeg", "webp");
    private static final Set<String> ALLOWED_DOC_EXT = Set.of("pdf");
    private static final Set<String> ALLOWED_AUDIO_EXT = Set.of("wav", "webm", "mp3", "ogg");

    public String validateAndGenerateSafeName(MultipartFile file, UploadCategory category) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File must not be empty.");
        }

        // 1. Size Validation
        long sizeLimitBytes;
        if (category == UploadCategory.IMAGE) {
            sizeLimitBytes = 2L * 1024L * 1024L; // 2MB
        } else if (category == UploadCategory.AUDIO) {
            sizeLimitBytes = 25L * 1024L * 1024L; // 25MB
        } else {
            sizeLimitBytes = maxDocSizeMb * 1024L * 1024L; // Injected maxDocSizeMb (10MB)
        }

        if (file.getSize() > sizeLimitBytes) {
            throw new BadRequestException("File size exceeds the limit of " + (sizeLimitBytes / (1024 * 1024)) + "MB.");
        }

        // 2. Extension Check
        String origName = file.getOriginalFilename();
        if (origName == null || origName.trim().isEmpty()) {
            throw new BadRequestException("Filename is missing.");
        }

        // Strict Path Traversal / Injection check on filename structure
        if (origName.contains("..") || origName.contains("/") || origName.contains("\\") || origName.contains("\0")) {
            throw new BadRequestException("Invalid filename structure.");
        }

        String cleanName = origName.toLowerCase();
        
        // Double extension / dangerous extensions check
        List<String> blacklisted = Arrays.asList(".jsp", ".exe", ".sh", ".bat", ".cmd", ".html", ".js");
        for (String bl : blacklisted) {
            if (cleanName.contains(bl)) {
                throw new BadRequestException("Forbidden file extension format.");
            }
        }

        // Count extensions to prevent double extensions (e.g. file.png.jsp)
        int dotCount = 0;
        for (int i = 0; i < cleanName.length(); i++) {
            if (cleanName.charAt(i) == '.') dotCount++;
        }
        if (dotCount > 1) {
            throw new BadRequestException("Double file extensions are not allowed.");
        }

        String ext = "";
        int lastDot = cleanName.lastIndexOf(".");
        if (lastDot != -1) {
            ext = cleanName.substring(lastDot + 1);
        }

        if (category == UploadCategory.IMAGE && !ALLOWED_IMAGE_EXT.contains(ext)) {
            throw new BadRequestException("Allowed image formats: PNG, JPG, JPEG, WEBP.");
        } else if (category == UploadCategory.DOCUMENT && !ALLOWED_DOC_EXT.contains(ext)) {
            throw new BadRequestException("Allowed document formats: PDF.");
        } else if (category == UploadCategory.AUDIO && !ALLOWED_AUDIO_EXT.contains(ext)) {
            throw new BadRequestException("Allowed audio formats: WAV, WEBM, MP3, OGG.");
        }

        // 3. Magic Bytes / content signature validation
        validateMagicBytes(file, ext);

        // 4. Safe random filename generation
        return UUID.randomUUID().toString() + "." + ext;
    }

    private void validateMagicBytes(MultipartFile file, String ext) {
        byte[] header = new byte[12];
        try (InputStream is = file.getInputStream()) {
            int read = is.read(header);
            if (read < 4) {
                throw new BadRequestException("File is too small to determine format.");
            }
        } catch (Exception e) {
            throw new BadRequestException("Unable to read file signature.");
        }

        // Scan signatures
        boolean match = false;
        
        if ("pdf".equals(ext)) {
            // PDF starts with: 25 50 44 46 (%PDF)
            match = (header[0] == 0x25 && header[1] == 0x50 && header[2] == 0x44 && header[3] == 0x46);
        } else if ("png".equals(ext)) {
            // PNG starts with: 89 50 4E 47
            match = (header[0] == (byte) 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47);
        } else if ("jpg".equals(ext) || "jpeg".equals(ext)) {
            // JPEG starts with: FF D8 FF
            match = (header[0] == (byte) 0xFF && header[1] == (byte) 0xD8 && header[2] == (byte) 0xFF);
        } else if ("webp".equals(ext)) {
            // WEBP starts with RIFF (0-3) and WEBP (8-11)
            boolean isRiff = (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46); // RIFF
            boolean isWebp = (header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50); // WEBP
            match = isRiff && isWebp;
        } else if ("wav".equals(ext)) {
            // WAV starts with RIFF (0-3) and WAVE (8-11)
            boolean isRiff = (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46); // RIFF
            boolean isWave = (header[8] == 0x57 && header[9] == 0x41 && header[10] == 0x56 && header[11] == 0x45); // WAVE
            match = isRiff && isWave;
        } else if ("webm".equals(ext)) {
            // WEBM starts with EBML: 1A 45 DF A3
            match = (header[0] == 0x1A && header[1] == 0x45 && header[2] == (byte) 0xDF && header[3] == (byte) 0xA3);
        } else if ("mp3".equals(ext)) {
            // MP3 can start with ID3 (49 44 33) or sync frame (FF FB / FF F3)
            boolean isId3 = (header[0] == 0x49 && header[1] == 0x44 && header[2] == 0x33);
            boolean isSync = (header[0] == (byte) 0xFF && (header[1] == (byte) 0xFB || header[1] == (byte) 0xF3));
            match = isId3 || isSync;
        } else if ("ogg".equals(ext)) {
            // OggS starts with: 4F 67 67 53
            match = (header[0] == 0x4F && header[1] == 0x67 && header[2] == 0x67 && header[3] == 0x53);
        }

        if (!match) {
            throw new BadRequestException("File content signature does not match file extension.");
        }
    }

    public Path getSafeUploadPath(String safeName, String subFolder) {
        Path base = Path.of(uploadDir).toAbsolutePath().normalize();
        Path targetFolder = subFolder == null ? base : base.resolve(subFolder).normalize();
        
        Path targetFile = targetFolder.resolve(safeName).normalize();
        
        // Verify that path resolution did not escape the base upload directory (Path Traversal Protection)
        if (!targetFile.startsWith(base)) {
            throw new BadRequestException("Invalid upload path directory reference.");
        }
        return targetFile;
    }
}
