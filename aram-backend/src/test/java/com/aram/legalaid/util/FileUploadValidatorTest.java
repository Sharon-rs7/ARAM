package com.aram.legalaid.util;

import com.aram.legalaid.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

public class FileUploadValidatorTest {

    private FileUploadValidator validator;

    @BeforeEach
    public void setUp() {
        validator = new FileUploadValidator();
        // Set reflection properties for testing
        ReflectionTestUtils.setField(validator, "maxDocSizeMb", 10);
        ReflectionTestUtils.setField(validator, "uploadDir", "uploads");
    }

    // --- VALID TESTS ---

    @Test
    public void testValidPdfUploadPasses() {
        byte[] pdfBytes = "%PDF-1.4\n%...\n%%EOF".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "complaint.pdf", "application/pdf", pdfBytes);
        String safeName = validator.validateAndGenerateSafeName(file, UploadCategory.DOCUMENT);
        assertNotNull(safeName);
        assertTrue(safeName.endsWith(".pdf"));
        assertNotEquals("complaint.pdf", safeName);
    }

    @Test
    public void testValidPngUploadPasses() {
        byte[] pngBytes = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
        MockMultipartFile file = new MockMultipartFile("file", "photo.png", "image/png", pngBytes);
        String safeName = validator.validateAndGenerateSafeName(file, UploadCategory.IMAGE);
        assertNotNull(safeName);
        assertTrue(safeName.endsWith(".png"));
    }

    @Test
    public void testValidJpegUploadPasses() {
        byte[] jpegBytes = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0};
        MockMultipartFile file = new MockMultipartFile("file", "avatar.jpg", "image/jpeg", jpegBytes);
        String safeName = validator.validateAndGenerateSafeName(file, UploadCategory.IMAGE);
        assertNotNull(safeName);
        assertTrue(safeName.endsWith(".jpg"));
    }

    @Test
    public void testValidWebpUploadPasses() {
        byte[] webpBytes = new byte[]{
                0x52, 0x49, 0x46, 0x46, // RIFF
                0x00, 0x00, 0x00, 0x00,
                0x57, 0x45, 0x42, 0x50  // WEBP
        };
        MockMultipartFile file = new MockMultipartFile("file", "image.webp", "image/webp", webpBytes);
        String safeName = validator.validateAndGenerateSafeName(file, UploadCategory.IMAGE);
        assertNotNull(safeName);
        assertTrue(safeName.endsWith(".webp"));
    }

    @Test
    public void testValidWavUploadPasses() {
        byte[] wavBytes = new byte[]{
                0x52, 0x49, 0x46, 0x46, // RIFF
                0x00, 0x00, 0x00, 0x00,
                0x57, 0x41, 0x56, 0x45  // WAVE
        };
        MockMultipartFile file = new MockMultipartFile("file", "audio.wav", "audio/wav", wavBytes);
        String safeName = validator.validateAndGenerateSafeName(file, UploadCategory.AUDIO);
        assertNotNull(safeName);
        assertTrue(safeName.endsWith(".wav"));
    }

    // --- SPOOFING TESTS ---

    @Test
    public void testTxtRenamedToPngFails() {
        byte[] txtBytes = "This is a plain text file, not a png.".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "malicious.png", "image/png", txtBytes);
        
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            validator.validateAndGenerateSafeName(file, UploadCategory.IMAGE);
        });
        assertTrue(ex.getMessage().contains("content signature"));
    }

    @Test
    public void testTxtRenamedToPdfFails() {
        byte[] txtBytes = "This is plain text, not pdf.".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "hack.pdf", "application/pdf", txtBytes);
        
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            validator.validateAndGenerateSafeName(file, UploadCategory.DOCUMENT);
        });
        assertTrue(ex.getMessage().contains("content signature"));
    }

    @Test
    public void testFakeContentTypePngWithBadBytesFails() {
        byte[] badBytes = new byte[]{0x00, 0x00, 0x00, 0x00};
        MockMultipartFile file = new MockMultipartFile("file", "test.png", "image/png", badBytes);
        
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            validator.validateAndGenerateSafeName(file, UploadCategory.IMAGE);
        });
        assertTrue(ex.getMessage().contains("content signature"));
    }

    // --- FILENAME / SANITIZATION TESTS ---

    @Test
    public void testPathTraversalInFilenameFails() {
        byte[] pdfBytes = "%PDF-1.4\n%...\n%%EOF".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "../../../evil.pdf", "application/pdf", pdfBytes);
        
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            validator.validateAndGenerateSafeName(file, UploadCategory.DOCUMENT);
        });
        assertTrue(ex.getMessage().contains("Invalid filename structure"));
    }

    @Test
    public void testNullByteInFilenameFails() {
        byte[] pdfBytes = "%PDF-1.4\n%...\n%%EOF".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "evil\0.pdf", "application/pdf", pdfBytes);
        
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            validator.validateAndGenerateSafeName(file, UploadCategory.DOCUMENT);
        });
        assertTrue(ex.getMessage().contains("Invalid filename structure"));
    }

    @Test
    public void testDoubleExtensionFails() {
        byte[] pdfBytes = "%PDF-1.4\n%...\n%%EOF".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "test.png.pdf", "application/pdf", pdfBytes);
        
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            validator.validateAndGenerateSafeName(file, UploadCategory.DOCUMENT);
        });
        assertTrue(ex.getMessage().contains("Double file extensions"));
    }

    @Test
    public void testJspExtensionFails() {
        byte[] pdfBytes = "%PDF-1.4\n%...\n%%EOF".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "exploit.jsp", "application/pdf", pdfBytes);
        
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            validator.validateAndGenerateSafeName(file, UploadCategory.DOCUMENT);
        });
        assertTrue(ex.getMessage().contains("Forbidden file extension"));
    }

    // --- SIZE TESTS ---

    @Test
    public void testEmptyFileFails() {
        MockMultipartFile file = new MockMultipartFile("file", "empty.pdf", "application/pdf", new byte[0]);
        
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            validator.validateAndGenerateSafeName(file, UploadCategory.DOCUMENT);
        });
        assertTrue(ex.getMessage().contains("must not be empty"));
    }

    @Test
    public void testHugeFileFails() {
        byte[] hugeBytes = new byte[3 * 1024 * 1024]; // 3MB (limit is 2MB for IMAGE)
        byte[] pngBytes = new byte[3 * 1024 * 1024];
        pngBytes[0] = (byte) 0x89; pngBytes[1] = 0x50; pngBytes[2] = 0x4E; pngBytes[3] = 0x47;
        MockMultipartFile file = new MockMultipartFile("file", "huge.png", "image/png", pngBytes);
        
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            validator.validateAndGenerateSafeName(file, UploadCategory.IMAGE);
        });
        assertTrue(ex.getMessage().contains("exceeds the limit"));
    }

    // --- STORAGE PATH PROTECTION ---

    @Test
    public void testGetSafeUploadPathGuardsTraversal() {
        Path safe = validator.getSafeUploadPath("image.png", "profile");
        assertTrue(safe.toString().contains("uploads"));
        assertTrue(safe.toString().contains("profile"));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            validator.getSafeUploadPath("../../../evil.png", null);
        });
        assertTrue(ex.getMessage().contains("Invalid upload path"));
    }
}
