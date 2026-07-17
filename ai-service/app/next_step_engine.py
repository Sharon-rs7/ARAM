DEFAULT_NEXT_STEPS = [
    "Save all available proof and dates.",
    "Approach the recommended authority or a verified legal aid helper.",
    "Treat this as preliminary legal aid guidance only.",
]


def get_next_steps(category: str, priority: str = "MEDIUM") -> list[str]:
    if priority == "CRITICAL":
        return [
            "If there is immediate danger, contact local emergency services first.",
            "Ask a trusted person or helper to stay with you while seeking official help.",
            *DEFAULT_NEXT_STEPS,
        ]
    return DEFAULT_NEXT_STEPS
