import api, { USE_MOCKS } from "./api";

const DISCLAIMER = "ARAM provides preliminary complaint guidance only. It does not replace police, court, lawyer, or official authority.";

export const chatbotService = {
  askChatbot: async (payload) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const message = payload.message.toLowerCase();
      
      let reply = "I'm sorry, I don't have specific guidance on that query. You may contact your District Legal Services Authority (DLSA) for further help.";
      let category = "GENERAL_LEGAL_AID";
      let suggestedActions = ["Submit official complaint", "Consult DLSA legal counselor"];
      
      if (message.includes("salary") || message.includes("wage") || message.includes("employer") || message.includes("job")) {
        category = "LABOUR_DISPUTE";
        reply = "Under Section 33C of the Industrial Disputes Act, you can file a claim for unpaid wages with the Labour Commissioner. Gather your pay slips, bank statements, and employment contract.";
        suggestedActions = ["Download Unpaid Wages Form", "Schedule Helper Consultation", "Contact Labour Commissioner Office"];
      } else if (message.includes("scam") || message.includes("upi") || message.includes("otp") || message.includes("hacked") || message.includes("fraud")) {
        category = "CYBER_CRIME";
        reply = "Immediately call 1930 to report the cyber crime or register your grievance on cybercrime.gov.in. Save transaction screenshots and transaction IDs.";
        suggestedActions = ["Call 1930 Helpline", "Generate UPI Fraud Complaint Draft", "Visit Nearest Cyber Cell"];
      } else if (message.includes("husband") || message.includes("beating") || message.includes("domestic") || message.includes("violence") || message.includes("harass")) {
        category = "WOMEN_SAFETY_DOMESTIC_VIOLENCE";
        reply = "Please contact the National Commission for Women (NCW) helpline at 7827170170 or the domestic violence helpline at 181. For immediate safety, contact the local police station.";
        suggestedActions = ["Call 181 Helpline", "Draft Protection Order Petition", "Find Women Support Shelter"];
      } else if (message.includes("refund") || message.includes("damaged") || message.includes("seller") || message.includes("invoice")) {
        category = "CONSUMER_COMPLAINT";
        reply = "File a complaint online through the National Consumer Helpline (NCH) portal or call 1915. Send a formal legal notice to the vendor detailing the product deficiency first.";
        suggestedActions = ["Register Consumer Case Draft", "Send Vendor Notice Template", "Call 1915 Help Desk"];
      } else if (message.includes("land") || message.includes("property") || message.includes("neighbor") || message.includes("encroach")) {
        category = "PROPERTY_CIVIL_DISPUTE";
        reply = "Ensure you have your patta, sale deed, and land surveyor boundary report. You can file a civil injunction suit or report property encroachment to the local revenue inspector.";
        suggestedActions = ["Review Land Patta Status", "Find Revenue Office Contact", "Consult Civil Lawyer Group"];
      }
      
      return {
        reply,
        category,
        suggestedActions,
        disclaimer: DISCLAIMER,
        confidence: 0.90
      };
    }
    
    const res = await api.post("/ai/chat", payload);
    return res.data;
  }
};
