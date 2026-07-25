import { toast } from "sonner";

export const processVoiceCommand = (text, callbacks = {}) => {
  if (!text) return;
  
  const query = text.toLowerCase().trim();
  console.log("Voice Command Processor Query:", query);

  // 1. Submit Complaint Commands
  if (
    query.includes("submit complaint") || 
    query.includes("complaint submit pannu") || 
    query.includes("புகார் சமர்ப்பிக்க") || 
    query.includes("complaint submit karo")
  ) {
    if (callbacks.onSubmit) {
      toast("Voice Command: Submit Complaint?", {
        action: {
          label: "Confirm Submit",
          onClick: () => callbacks.onSubmit()
        }
      });
      return true;
    }
  }

  // 2. Navigation Commands
  if (query.includes("go back") || query.includes("back po") || query.includes("पीछे जाओ") || query.includes("pinadi po")) {
    if (callbacks.onGoBack) {
      callbacks.onGoBack();
      return true;
    }
  }

  if (query.includes("open chatbot") || query.includes("chatbot open pannu") || query.includes("counselor")) {
    if (callbacks.onOpenChatbot) {
      callbacks.onOpenChatbot();
      return true;
    }
  }

  // 3. Document checklist
  if (query.includes("show documents") || query.includes("documents kaatu") || query.includes("documents dikhao")) {
    if (callbacks.onShowDocuments) {
      callbacks.onShowDocuments();
      return true;
    }
  }

  // 4. Status Check
  if (
    query.includes("check status") || 
    query.includes("status sollu") || 
    query.includes("status batao") || 
    query.includes("நிலை சொல்லு")
  ) {
    if (callbacks.onCheckStatus) {
      callbacks.onCheckStatus();
      return true;
    }
  }

  // 5. Read aloud actions
  if (query.includes("read result") || query.includes("result padichu sollu") || query.includes("read aloud")) {
    if (callbacks.onReadAloud) {
      callbacks.onReadAloud();
      return true;
    }
  }

  // 6. Stop / Reset Actions
  if (query.includes("stop") || query.includes("niruthu") || query.includes("band karo") || query.includes("நிறுத்து")) {
    if (callbacks.onStop) {
      callbacks.onStop();
      return true;
    }
  }

  return false;
};
