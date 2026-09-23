import os
import pytest

# Ensure a valid INTERNAL_API_TOKEN is set for all test runs
os.environ.setdefault("INTERNAL_API_TOKEN", "test-internal-token-32-chars-long-secure!")
