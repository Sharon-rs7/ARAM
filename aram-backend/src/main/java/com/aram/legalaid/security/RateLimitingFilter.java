package com.aram.legalaid.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingFilter implements Filter {

    private final ConcurrentHashMap<String, RateLimitInfo> ipRequestCounts = new ConcurrentHashMap<>();
    
    // Limits: Max 10 requests per 1 minute per IP
    private static final int MAX_REQUESTS = 500;
    private static final long TIME_WINDOW_MS = 60000; 

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        String path = httpRequest.getRequestURI();

        // Apply rate limit strictly to authentication endpoints
        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register") || path.startsWith("/api/auth/otp-verification")) {
            String ip = getClientIP(httpRequest);
            long now = System.currentTimeMillis();

            // Periodic cleanup of expired entries if map grows
            if (ipRequestCounts.size() > 5000) {
                ipRequestCounts.entrySet().removeIf(entry -> now - entry.getValue().windowStartTime > TIME_WINDOW_MS);
            }

            RateLimitInfo info = ipRequestCounts.compute(ip, (k, v) -> {
                if (v == null || now - v.windowStartTime > TIME_WINDOW_MS) {
                    return new RateLimitInfo(now, new AtomicInteger(1));
                } else {
                    v.count.incrementAndGet();
                    return v;
                }
            });

            if (info.count.get() > MAX_REQUESTS) {
                httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                httpResponse.setContentType("application/json");
                httpResponse.getWriter().write("{\"error\": \"Too many login/registration attempts. Please try again after a minute.\"}");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    private static class RateLimitInfo {
        final long windowStartTime;
        final AtomicInteger count;

        RateLimitInfo(long windowStartTime, AtomicInteger count) {
            this.windowStartTime = windowStartTime;
            this.count = count;
        }
    }
}
