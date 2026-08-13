package com.astra.backend.ai;

import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class SafetyFilter {

    private static final List<String> BLOCKED_TERMS = List.of(
            "how to hack",
            "generate malware",
            "write a virus",
            "exploit code",
            "bypass authentication",
            "sql injection payload",
            "reverse shell"
    );

    public boolean isSafe(String prompt) {
        if (prompt == null || prompt.trim().isEmpty()) {
            return false;
        }
        
        String lowerCasePrompt = prompt.toLowerCase();
        for (String term : BLOCKED_TERMS) {
            if (lowerCasePrompt.contains(term)) {
                return false;
            }
        }
        
        return true;
    }
}
