package com.aram.legalaid;

import com.aram.legalaid.service.EncryptionService;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class EncryptionServiceTest {

    @Test
    public void testDecryptionWithInvalidKeyFailsLoudly() {
        EncryptionService service1 = new EncryptionService("CorrectKey123456789012345678901234");
        String original = "Confidential Grievance Record";
        String encrypted = service1.encrypt(original);

        EncryptionService service2 = new EncryptionService("WrongKey987654321098765432109876");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            service2.decrypt(encrypted);
        });

        assertTrue(ex.getMessage().contains("CRITICAL DECRYPTION FAILURE"));
    }
}
