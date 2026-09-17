import pytest
from app.intent_classifier import classify_intent, INTENTS
from app.chatbot_engine import ask_chatbot_engine
from app.conversation_manager import conversation_manager

def test_intent_classification_greeting():
    intent, _ = classify_intent("hi")
    assert intent == INTENTS["GREETING"]

    intent, _ = classify_intent("vanakkam")
    assert intent == INTENTS["GREETING"]

    intent, _ = classify_intent("வணக்கம்")
    assert intent == INTENTS["GREETING"]

def test_intent_classification_language_selection():
    intent, meta = classify_intent("tamil?")
    assert intent == INTENTS["LANGUAGE_SELECTION"]
    assert meta.get("selected_language") == "ta"

    intent, meta = classify_intent("தமிழ்ல பேசுங்க")
    assert intent == INTENTS["LANGUAGE_SELECTION"]
    assert meta.get("selected_language") == "ta"

    intent, meta = classify_intent("can you speak in hindi please")
    assert intent == INTENTS["LANGUAGE_SELECTION"]
    assert meta.get("selected_language") == "hi"

def test_intent_classification_thanks_and_bye():
    intent, _ = classify_intent("thanks")
    assert intent == INTENTS["THANKS"]

    intent, _ = classify_intent("நன்றி")
    assert intent == INTENTS["THANKS"]

    intent, _ = classify_intent("bye")
    assert intent == INTENTS["GOODBYE"]

def test_intent_classification_general_convo():
    intent, _ = classify_intent("what can you do?")
    assert intent == INTENTS["GENERAL_CONVERSATION"]

    intent, _ = classify_intent("help")
    assert intent == INTENTS["GENERAL_CONVERSATION"]

def test_intent_classification_emergency():
    intent, _ = classify_intent("he is threatening to kill me with a knife")
    assert intent == INTENTS["EMERGENCY"]

def test_chatbot_engine_greeting_no_rag():
    res = ask_chatbot_engine("hi", session_id=f"test_sess_greet_{int(__import__('time').time()*1000)}")
    assert res.get("responseType") == "GREETING"
    assert res.get("is_conversational") is True
    assert "ARAM AI Legal Assistant" in res.get("reply") or "வணக்கம்" in res.get("reply")
    assert res.get("category") == "CONVERSATIONAL"
    assert len(res.get("sections", [])) == 0

def test_chatbot_engine_tamil_switch_no_rag():
    sess_id = f"test_sess_tamil_{int(__import__('time').time()*1000)}"
    res = ask_chatbot_engine("tamil?", session_id=sess_id)
    assert res.get("responseType") == "LANGUAGE_SELECTION"
    assert res.get("language") == "ta"
    assert res.get("is_conversational") is True
    assert "வணக்கம்! நான் தமிழில் பேசுகிறேன்" in res.get("reply")
    
    # State should persist 'ta'
    state = conversation_manager.get_or_create_state(sess_id)
    assert state.get("language") == "ta"

def test_chatbot_engine_vague_property_clarification():
    sess_id = f"test_sess_clarify_{int(__import__('time').time()*1000)}"
    res = ask_chatbot_engine("en property issuse yarkita enga complaint pananum nu enaku thrla", session_id=sess_id)
    assert res.get("responseType") == "CLARIFICATION"
    assert res.get("is_conversational") is True
    assert len(res.get("options", [])) > 0
    assert "Boundary" in str(res.get("options")) or "Patta" in str(res.get("options"))

def test_chatbot_engine_thanks():
    res = ask_chatbot_engine("thanks", session_id="test_sess_thanks")
    assert res.get("responseType") == "THANKS"
    assert res.get("is_conversational") is True

def test_chatbot_engine_emergency():
    res = ask_chatbot_engine("someone is attacking me and threatened to kill me", session_id="test_sess_em")
    assert res.get("responseType") == "EMERGENCY"
    assert res.get("emergency") is True
    assert "112" in str(res.get("where_to_complain")) or "112" in res.get("reply")
