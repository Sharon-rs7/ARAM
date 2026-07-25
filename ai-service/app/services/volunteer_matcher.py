class VolunteerMatcher:
    def match(self, category: str, language: str, prefer_woman: bool, district: str, volunteers: list) -> list:
        recommendations = []
        
        for vol in volunteers:
            score = 0
            reasons = []
            
            # 1. Availability and Capacity check
            avail = vol.get("availabilityStatus", "AVAILABLE")
            active_cases = int(vol.get("currentActiveCases", 0))
            max_cases = int(vol.get("maxActiveCases", 5))
            
            if avail != "AVAILABLE":
                continue  # Skip completely if not available
            if active_cases >= max_cases:
                continue  # Skip if overloaded
                
            # 2. Specialization Match (40 pts)
            specs = vol.get("specializationCategories", [])
            if category in specs:
                score += 40
                reasons.append("Matches required legal category specialization")
            else:
                score += 15
                reasons.append("General practice legal capability")

            # 3. Language Match (25 pts)
            langs = vol.get("languagesKnown", [])
            # Handle list or comma-separated string
            if isinstance(langs, str):
                langs = [l.strip() for l in langs.split(",")]
            
            if language in langs:
                score += 25
                reasons.append(f"Fluent in detected language: {language}")
            else:
                # Partial match if they know English as fallback
                if "English" in langs:
                    score += 10
                    reasons.append("Fluent in English (secondary option)")

            # 4. District Location Match (15 pts)
            vol_dist = vol.get("district", "")
            if vol_dist.lower() == district.lower():
                score += 15
                reasons.append(f"Located in same district: {district}")
            else:
                reasons.append(f"Located in neighboring district: {vol_dist}")

            # 5. Case Workload Capacity (10 pts)
            capacity_ratio = 1 - (active_cases / max_cases)
            score += int(capacity_ratio * 10)
            reasons.append(f"Has active case capacity ({active_cases}/{max_cases} cases)")

            # 6. Women Safety & Gender Comfort Match (10 pts)
            gender = vol.get("gender", "ANY").upper()
            trained = vol.get("womenSupportTrained", False)
            
            if prefer_woman:
                if gender == "FEMALE":
                    score += 10
                    if trained:
                        score += 10
                        reasons.append("Trained female support advocate matched")
                    else:
                        reasons.append("Female volunteer matched for citizen comfort preference")
                else:
                    score -= 20  # Apply penalty for male volunteer in women-sensitive complaints
                    reasons.append("Male volunteer mismatch for female preference rule")
            else:
                # No gender preference
                score += 5
                reasons.append("Standard volunteer match routing")

            # Clean score bounds
            final_score = max(0, min(100, score))
            
            recommendations.append({
                "id": vol.get("id"),
                "name": vol.get("name"),
                "gender": gender,
                "languagesKnown": langs,
                "matchScore": final_score,
                "reason": "; ".join(reasons)
            })

        # Sort by match score descending
        recommendations.sort(key=lambda x: x["matchScore"], reverse=True)
        return recommendations

volunteer_matcher = VolunteerMatcher()
