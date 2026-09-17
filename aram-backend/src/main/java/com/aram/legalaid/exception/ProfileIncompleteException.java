package com.aram.legalaid.exception;

public class ProfileIncompleteException extends RuntimeException {
    private final int completionPercentage;

    public ProfileIncompleteException(String message, int completionPercentage) {
        super(message);
        this.completionPercentage = completionPercentage;
    }

    public int getCompletionPercentage() {
        return completionPercentage;
    }
}
