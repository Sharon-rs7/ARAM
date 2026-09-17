import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";
import Button from "@/components/common/Button";
import { toast } from "sonner";

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log("ARAM app was installed successfully.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.warning("Install option is not available yet. On Android Chrome, open menu and tap Add to Home screen.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to ARAM install: ${outcome}`);
    setDeferredPrompt(null);
  };

  if (isInstalled) return null;

  return (
    <Button
      variant="secondary"
      onClick={handleInstallClick}
      icon={Download}
      className="!min-h-[44px]"
    >
      Install ARAM App
    </Button>
  );
}
