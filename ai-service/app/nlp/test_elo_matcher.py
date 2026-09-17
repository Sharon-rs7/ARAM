import sys
import os
import unittest
from unittest.mock import MagicMock, patch

# Ensure app is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ml.elo_matcher import rank_volunteers_with_elo
from app.config import settings

class TestEloMatcher(unittest.TestCase):
    def setUp(self):
        # Base volunteers list
        self.volunteers = [
            {
                "id": 1,
                "name": "Guide One",
                "languagesKnown": ["Tamil", "English"],
                "supportsTanglish": True,
                "supportsHinglish": False,
                "specializationCategories": ["GENERAL_LEGAL_AID", "CIVIL_DISPUTES"],
                "district": "Chennai",
                "currentActiveCases": 0,
                "maxActiveCases": 5,
                "availabilityStatus": "AVAILABLE",
                "gender": "FEMALE",
                "canHandleSensitiveCases": True,
                "eloRating": 1100,
                "averageRating": 4.5,
                "feedbackCount": 10
            },
            {
                "id": 2,
                "name": "Guide Two",
                "languagesKnown": ["Hindi", "English", "Tamil"],
                "supportsTanglish": False,
                "supportsHinglish": True,
                "specializationCategories": ["GENERAL_LEGAL_AID"],
                "district": "Chennai",
                "currentActiveCases": 0,
                "maxActiveCases": 5,
                "availabilityStatus": "AVAILABLE",
                "gender": "MALE",
                "canHandleSensitiveCases": False,
                "eloRating": 1200,
                "averageRating": 4.8,
                "feedbackCount": 15
            },
            {
                "id": 3,
                "name": "Guide Three",
                "languagesKnown": ["Tamil"],
                "supportsTanglish": True,
                "supportsHinglish": False,
                "specializationCategories": ["GENERAL_LEGAL_AID"],
                "district": "Chennai",
                "currentActiveCases": 0,
                "maxActiveCases": 5,
                "availabilityStatus": "AVAILABLE",
                "gender": "FEMALE",
                "canHandleSensitiveCases": True,
                "eloRating": 1000,
                "averageRating": 4.0,
                "feedbackCount": 5
            }
        ]

    @patch('app.mongo_logger.mongo_manager.get_db')
    def test_1_correct_region_language_specialization(self, mock_get_db):
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        mock_db.guide_case_embeddings.find.return_value = []
        
        res = rank_volunteers_with_elo(
            complaint_text="I need general legal assistance",
            category="GENERAL_LEGAL_AID",
            language="Tamil",
            prefer_woman=False,
            district="Chennai",
            volunteers=self.volunteers
        )
        self.assertEqual(len(res["recommendedGuides"]), 3)
        self.assertEqual(res["recommendationMode"], "COLD_START_RECOMMENDATION")

    @patch('app.mongo_logger.mongo_manager.get_db')
    def test_2_wrong_region_excluded(self, mock_get_db):
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        
        self.volunteers[0]["district"] = "Coimbatore"
        
        res = rank_volunteers_with_elo(
            complaint_text="I need legal aid in Chennai",
            category="GENERAL_LEGAL_AID",
            language="Tamil",
            prefer_woman=False,
            district="Chennai",
            volunteers=self.volunteers
        )
        guide_ids = [g["guideId"] for g in res["recommendedGuides"]]
        self.assertNotIn("1", guide_ids)

    @patch('app.mongo_logger.mongo_manager.get_db')
    def test_3_wrong_language_excluded(self, mock_get_db):
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        
        res = rank_volunteers_with_elo(
            complaint_text="Need Hindi help",
            category="GENERAL_LEGAL_AID",
            language="Hindi",
            prefer_woman=False,
            district="Chennai",
            volunteers=self.volunteers
        )
        # Guide 2 is Hindi; Guide 1 and 3 are Tamil only in languagesKnown
        self.volunteers[0]["languagesKnown"] = ["Tamil"]
        self.volunteers[2]["languagesKnown"] = ["Tamil"]
        
        res = rank_volunteers_with_elo(
            complaint_text="Need Hindi help",
            category="GENERAL_LEGAL_AID",
            language="Hindi",
            prefer_woman=False,
            district="Chennai",
            volunteers=self.volunteers
        )
        guide_ids = [g["guideId"] for g in res["recommendedGuides"]]
        self.assertEqual(guide_ids, ["2"])

    @patch('app.mongo_logger.mongo_manager.get_db')
    def test_4_sensitive_case_capability_excluded(self, mock_get_db):
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        
        res = rank_volunteers_with_elo(
            complaint_text="Sensitive issue",
            category="GENERAL_LEGAL_AID",
            language="English",
            prefer_woman=False,
            district="Chennai",
            volunteers=self.volunteers,
            sensitive=True
        )
        guide_ids = [g["guideId"] for g in res["recommendedGuides"]]
        self.assertNotIn("2", guide_ids)

    @patch('app.mongo_logger.mongo_manager.get_db')
    def test_5_capacity_limits(self, mock_get_db):
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        
        self.volunteers[0]["currentActiveCases"] = 5
        self.volunteers[0]["maxActiveCases"] = 5
        
        res = rank_volunteers_with_elo(
            complaint_text="Normal help",
            category="GENERAL_LEGAL_AID",
            language="Tamil",
            prefer_woman=False,
            district="Chennai",
            volunteers=self.volunteers
        )
        guide_ids = [g["guideId"] for g in res["recommendedGuides"]]
        self.assertNotIn("1", guide_ids)

    @patch('app.services.embedding_service.embedding_service.encode')
    @patch('app.mongo_logger.mongo_manager.get_db')
    def test_6_higher_case_similarity(self, mock_get_db, mock_encode):
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        
        self.volunteers[0]["eloRating"] = 1000
        self.volunteers[0]["averageRating"] = 4.0
        self.volunteers[0]["feedbackCount"] = 5
        self.volunteers[0]["currentActiveCases"] = 0
        self.volunteers[2]["eloRating"] = 1000
        self.volunteers[2]["averageRating"] = 4.0
        self.volunteers[2]["feedbackCount"] = 5
        self.volunteers[2]["currentActiveCases"] = 0
        
        embedding1 = [1.0] + [0.0]*383
        embedding3 = [0.1] + [0.0]*383
        
        mock_db.guide_case_embeddings.find.side_effect = lambda query: [
            {"embedding": embedding1, "resolutionOutcome": "SUCCESS"},
            {"embedding": embedding1, "resolutionOutcome": "SUCCESS"},
            {"embedding": embedding1, "resolutionOutcome": "SUCCESS"}
        ] if query["guideId"] == "1" else [
            {"embedding": embedding3, "resolutionOutcome": "SUCCESS"},
            {"embedding": embedding3, "resolutionOutcome": "SUCCESS"},
            {"embedding": embedding3, "resolutionOutcome": "SUCCESS"}
        ]
        
        mock_encode.return_value = [[1.0] + [0.0]*383]
        
        res = rank_volunteers_with_elo(
            complaint_text="Exact match",
            category="GENERAL_LEGAL_AID",
            language="Tamil",
            prefer_woman=False,
            district="Chennai",
            volunteers=self.volunteers
        )
        self.assertEqual(res["recommendedGuides"][0]["guideId"], "1")
        self.assertEqual(res["recommendationMode"], "ML_RECOMMENDATION")

    @patch('app.mongo_logger.mongo_manager.get_db')
    def test_7_higher_elo(self, mock_get_db):
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        mock_db.guide_case_embeddings.find.return_value = []
        
        self.volunteers[0]["eloRating"] = 1200
        self.volunteers[0]["averageRating"] = 4.0
        self.volunteers[0]["currentActiveCases"] = 0
        self.volunteers[2]["eloRating"] = 1000
        self.volunteers[2]["averageRating"] = 4.0
        self.volunteers[2]["currentActiveCases"] = 0
        
        res = rank_volunteers_with_elo(
            complaint_text="Elo test",
            category="GENERAL_LEGAL_AID",
            language="Tamil",
            prefer_woman=False,
            district="Chennai",
            volunteers=[self.volunteers[0], self.volunteers[2]]
        )
        self.assertEqual(res["recommendedGuides"][0]["guideId"], "1")

    @patch('app.mongo_logger.mongo_manager.get_db')
    def test_8_higher_feedback_quality(self, mock_get_db):
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        mock_db.guide_case_embeddings.find.return_value = []
        
        self.volunteers[0]["eloRating"] = 1000
        self.volunteers[0]["averageRating"] = 4.8
        self.volunteers[0]["feedbackCount"] = 10
        self.volunteers[0]["currentActiveCases"] = 0
        self.volunteers[2]["eloRating"] = 1000
        self.volunteers[2]["averageRating"] = 3.0
        self.volunteers[2]["feedbackCount"] = 5
        self.volunteers[2]["currentActiveCases"] = 0
        
        res = rank_volunteers_with_elo(
            complaint_text="Feedback test",
            category="GENERAL_LEGAL_AID",
            language="Tamil",
            prefer_woman=False,
            district="Chennai",
            volunteers=[self.volunteers[0], self.volunteers[2]]
        )
        self.assertEqual(res["recommendedGuides"][0]["guideId"], "1")

    @patch('app.mongo_logger.mongo_manager.get_db')
    def test_9_no_historical_data_cold_start(self, mock_get_db):
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        mock_db.guide_case_embeddings.find.return_value = []
        
        res = rank_volunteers_with_elo(
            complaint_text="Cold test",
            category="GENERAL_LEGAL_AID",
            language="Tamil",
            prefer_woman=False,
            district="Chennai",
            volunteers=self.volunteers
        )
        self.assertEqual(res["recommendationMode"], "COLD_START_RECOMMENDATION")

    @patch('app.mongo_logger.mongo_manager.get_db')
    def test_10_three_eligible_guides_returned(self, mock_get_db):
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        mock_db.guide_case_embeddings.find.return_value = []
        
        res = rank_volunteers_with_elo(
            complaint_text="General query",
            category="GENERAL_LEGAL_AID",
            language="Tamil",
            prefer_woman=False,
            district="Chennai",
            volunteers=self.volunteers
        )
        self.assertEqual(len(res["recommendedGuides"]), 3)

    @patch('app.mongo_logger.mongo_manager.get_db')
    def test_11_only_one_eligible_returned(self, mock_get_db):
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        mock_db.guide_case_embeddings.find.return_value = []
        
        # Exclude all except Guide 1 by setting wrong districts
        self.volunteers[1]["district"] = "Madurai"
        self.volunteers[2]["district"] = "Madurai"
        
        res = rank_volunteers_with_elo(
            complaint_text="General query",
            category="GENERAL_LEGAL_AID",
            language="Tamil",
            prefer_woman=False,
            district="Chennai",
            volunteers=self.volunteers
        )
        self.assertEqual(len(res["recommendedGuides"]), 1)
        self.assertEqual(res["recommendedGuides"][0]["guideId"], "1")

    @patch('app.mongo_logger.mongo_manager.get_db')
    def test_12_no_eligible_guide_response(self, mock_get_db):
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        
        res = rank_volunteers_with_elo(
            complaint_text="General query",
            category="GENERAL_LEGAL_AID",
            language="Hindi",
            prefer_woman=False,
            district="Madurai", # No guide is in Madurai
            volunteers=self.volunteers
        )
        self.assertEqual(res["recommendedGuides"], [])
        self.assertEqual(res["reason"], "NO_ELIGIBLE_GUIDE")

if __name__ == '__main__':
    unittest.main()
