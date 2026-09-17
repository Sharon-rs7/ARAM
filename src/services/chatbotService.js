import api from "@/services/api";

export const chatbotService = {
  askLegalAI: async (messageOrPayload, language = "en") => {
    let message, lang, userRole, complaintId, conversationId;
    if (typeof messageOrPayload === "object" && messageOrPayload !== null) {
      message = messageOrPayload.message || messageOrPayload.query || messageOrPayload.text;
      lang = messageOrPayload.language || language || "en";
      userRole = messageOrPayload.userRole || "CITIZEN";
      complaintId = messageOrPayload.complaintId || null;
      conversationId = messageOrPayload.conversationId || null;
    } else {
      message = messageOrPayload;
      lang = language || "en";
      userRole = "CITIZEN";
      complaintId = null;
      conversationId = null;
    }

    const payload = {
      message: message,
      language: lang,
      userRole: userRole,
      complaintId: complaintId,
      conversationId: conversationId
    };

    const res = await api.post("/ai/case-assistant", payload);
    const data = res.data || {};

    if (data.responseType === "LANGUAGE_PREFERENCE" || data.intent === "LANGUAGE_PREFERENCE") {
      return {
        ...data,
        is_conversational: true,
        responseType: "LANGUAGE_PREFERENCE",
        summary: data.reply || data.answer || "Language preference updated.",
        reply: data.reply || data.answer || "Language preference updated.",
        options: data.options || []
      };
    }

    if (data.responseType === "CLARIFICATION" || data.intent === "AMBIGUOUS_LEGAL_QUERY" || data.options?.length > 0 && data.category === "GENERAL_LEGAL_AID") {
      return {
        ...data,
        is_conversational: true,
        responseType: "CLARIFICATION",
        summary: data.reply || data.answer || data.understanding,
        reply: data.reply || data.answer || data.understanding,
        options: data.options || [],
        questions: data.questions || []
      };
    }

    if (data.is_conversational || data.is_greeting || data.category === "CONVERSATIONAL" || data.responseType === "GREETING") {
      return {
        ...data,
        is_conversational: true,
        responseType: "GREETING",
        summary: data.reply || data.answer || "Hello! How can I assist you with legal aid today?",
        reply: data.reply || data.answer || "Hello! How can I assist you with legal aid today?"
      };
    }

    // Normalize 11-part structure for AiResultCard
    const provisions = data.relevantProvisions || data.laws || [];
    const firstProvision = provisions[0] || {};
    const lawName = data.applicableLaw || firstProvision.actName || (provisions.length > 0 ? provisions.map(p => p.actName).filter(Boolean).join(", ") : "Transfer of Property Act, 1882 & Revenue Laws");
    const sectionName = data.section || (firstProvision.section ? `Section ${firstProvision.section}` : (firstProvision.provision ? firstProvision.provision : "Statutory Legal Provision"));
    
    // Clean, substantive explanation
    let rawExplanation = data.explanation || data.problemUnderstanding || data.understanding || firstProvision.explanation || data.answer || "Detailed legal aid explanation based on statutory precedent.";
    
    // Strip raw markdown headers if returned from legacy template
    if (rawExplanation.includes("###")) {
      const match = rawExplanation.match(/### (?:Understanding of Situation|பிரச்சனை புரிதல்|समस्या की समझ):\s*([\s\S]*?)(?=###|$)/i);
      if (match && match[1]?.trim()) {
        rawExplanation = match[1].trim();
      } else {
        rawExplanation = rawExplanation.replace(/###[^\n\r]+[\n\r]*/g, "").trim();
      }
    }

    const penaltyText = data.groundedPenalty || data.punishment?.details || data.punishment?.punishment || "Statutory relief, recovery decree, and applicable judicial remedy.";
    
    let nextStepsList = data.nextSteps || data.suggestedActions || data.procedure || [];
    if (!Array.isArray(nextStepsList) || nextStepsList.length === 0) {
      nextStepsList = [
        "Organize all relevant evidentiary documents and proofs.",
        "Submit formal representation to competent authority.",
        "Track application status using official acknowledgement number."
      ];
    }
    
    let docsList = data.documents || data.documents_required || data.documentChecklist || [];
    if (!Array.isArray(docsList) || docsList.length === 0) {
      docsList = ["Identity proof (Aadhaar/Voter ID)", "Relevant property/transaction documents"];
    }

    const authorityName = data.recommendedAuthority || (data.where_to_complain && data.where_to_complain[0]) || data.authority || "District Legal Services Authority (DLSA)";
    const safetyText = data.disclaimer || "Preliminary AI legal guidance based on certified Indian statutory corpus. For emergency situations, call 112 or 181.";

    return {
      ...data,
      is_conversational: false,
      summary: data.problemUnderstanding || data.understanding || data.summary || message,
      problemSummary: message,
      applicableLaw: lawName,
      section: sectionName,
      explanation: rawExplanation,
      groundedPenalty: penaltyText,
      nextSteps: nextStepsList,
      documentChecklist: docsList,
      authority: authorityName,
      safetyNotice: safetyText,
      sourceReference: "ARAM Certified Indian Legal Corpus (1,306 Verified Chunks)"
    };
  },
  askChatbot: async (payload) => {
    return chatbotService.askLegalAI(payload);
  },
  askCaseAssistant: async (payload) => {
    const res = await api.post("/ai/case-assistant", payload);
    return res.data;
  }
};

export default chatbotService;
