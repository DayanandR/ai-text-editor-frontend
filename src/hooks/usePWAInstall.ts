// Update your usePWAInstall hook with debugging
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Add debugging
    console.log("PWA Install hook initialized");

    // Check if already installed
    if (
      window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      console.log("App is already installed");
      return;
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log("beforeinstallprompt event fired", e);
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const handleAppInstalled = (e: Event) => {
      console.log("App was installed", e);
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    // Force show for testing (remove this in production)
    // setTimeout(() => {
    //   console.log('Force showing install button for testing');
    //   setShowInstallButton(true);
    // }, 2000);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    console.log("Install button clicked", deferredPrompt);
    if (!deferredPrompt) {
      console.log("No deferred prompt available");
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("User choice:", outcome);

      if (outcome === "accepted") {
        console.log("PWA installed successfully");
        setDeferredPrompt(null);
        setShowInstallButton(false);
      }
    } catch (error) {
      console.error("Error installing PWA:", error);
    }
  };

  return { showInstallButton, handleInstall };
};
