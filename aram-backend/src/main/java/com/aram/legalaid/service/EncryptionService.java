package com.aram.legalaid.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class EncryptionService {

    private final SecretKeySpec secretKey;
    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int IV_LENGTH_BYTE = 12;
    private static final int TAG_LENGTH_BIT = 128;

    public EncryptionService(@Value("${app.encryption.key:${APP_ENCRYPTION_KEY:ARAMLegalAidEncryptionSecretKey2026}}") String keyString) {
        if (keyString == null || keyString.trim().isEmpty()) {
            keyString = "ARAMLegalAidEncryptionSecretKey2026";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashedKey = digest.digest(keyString.getBytes(StandardCharsets.UTF_8));
            this.secretKey = new SecretKeySpec(hashedKey, ALGORITHM);
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize EncryptionService key Spec", e);
        }
    }

    public String encrypt(String plainText) {
        if (plainText == null) return null;
        try {
            SecureRandom random = new SecureRandom();
            byte[] iv = new byte[IV_LENGTH_BYTE];
            random.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            byte[] encryptedIvAndText = new byte[IV_LENGTH_BYTE + cipherText.length];
            System.arraycopy(iv, 0, encryptedIvAndText, 0, IV_LENGTH_BYTE);
            System.arraycopy(cipherText, 0, encryptedIvAndText, IV_LENGTH_BYTE, cipherText.length);

            return Base64.getEncoder().encodeToString(encryptedIvAndText);
        } catch (Exception e) {
            System.err.println("Encryption failed: " + e.getMessage());
            return plainText; // Fallback in case of exceptions
        }
    }

    public String decrypt(String cipherText) {
        if (cipherText == null) return null;
        try {
            byte[] decoded = Base64.getDecoder().decode(cipherText);
            if (decoded.length < IV_LENGTH_BYTE) {
                return cipherText;
            }

            byte[] iv = new byte[IV_LENGTH_BYTE];
            System.arraycopy(decoded, 0, iv, 0, IV_LENGTH_BYTE);

            byte[] cipherBytes = new byte[decoded.length - IV_LENGTH_BYTE];
            System.arraycopy(decoded, IV_LENGTH_BYTE, cipherBytes, 0, cipherBytes.length);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            byte[] plainTextBytes = cipher.doFinal(cipherBytes);
            return new String(plainTextBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException("CRITICAL DECRYPTION FAILURE: Failed to decrypt record with the configured APP_ENCRYPTION_KEY. Decryption tag verification failed or key mismatch.", e);
        }
    }
}
