package com.aram.legalaid.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AIServiceProperties {

    @Value("${ai.service.url:${AI_SERVICE_URL:http://127.0.0.1:8000}}")
    private String url;

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
