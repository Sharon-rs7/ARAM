import pytest
import numpy as np

def cosine_similarity(vec1, vec2):
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(np.dot(vec1, vec2) / (norm1 * norm2))

def is_duplicate_complaint(similarity_score, threshold=0.55):
    return similarity_score >= threshold

def test_dedup_threshold_boundary_cases():
    # Test boundary below threshold (0.54) -> NOT duplicate
    assert is_duplicate_complaint(0.54, threshold=0.55) is False
    
    # Test exact threshold boundary (0.55) -> DUPLICATE
    assert is_duplicate_complaint(0.55, threshold=0.55) is True
    
    # Test boundary above threshold (0.56) -> DUPLICATE
    assert is_duplicate_complaint(0.56, threshold=0.55) is True

def test_cosine_similarity_identical_vectors():
    v1 = np.array([0.5, 0.5, 0.5, 0.5])
    v2 = np.array([0.5, 0.5, 0.5, 0.5])
    assert abs(cosine_similarity(v1, v2) - 1.0) < 1e-5

def test_cosine_similarity_orthogonal_vectors():
    v1 = np.array([1.0, 0.0])
    v2 = np.array([0.0, 1.0])
    assert abs(cosine_similarity(v1, v2) - 0.0) < 1e-5
