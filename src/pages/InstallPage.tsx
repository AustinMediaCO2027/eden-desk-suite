import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, Smartphone, Monitor } from "lucide-react";
import { Link } from "react-router-dom";
import edenDarkLogo from "@/assets/eden_dark_logo.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <img src={edenDarkLogo} alt="Eden Desk" className="h-12 mb-8" />

      {isInstalled ? (
        <div className="space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-3xl font-bold text-foreground">Already Installed!</h1>
          <p className="text-muted-foreground max-w-md">
            Eden Desk is installed on your device. Open it from your home screen.
          </p>
          <Link to="/">
            <Button size="lg" className="mt-4">Go to App</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8 max-w-md">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-foreground">Install Eden Desk</h1>
            <p className="text-muted-foreground text-lg">
              Add Eden Desk to your home screen for instant access — works offline, feels like a native app.
            </p>
          </div>

          {deferredPrompt ? (
            <Button size="lg" onClick={handleInstall} className="gap-2 text-base px-8 h-14 bg-foreground text-background hover:bg-foreground/90 rounded-xl font-semibold">
              <Download className="h-5 w-5" />
              Install Now
            </Button>
          ) : isIOS ? (
            <div className="bg-card border border-border rounded-xl p-6 text-left space-y-3">
              <p className="font-semibold text-foreground flex items-center gap-2">
                <Smartphone className="h-5 w-5" /> Install on iPhone / iPad
              </p>
              <ol className="text-muted-foreground space-y-2 text-sm list-decimal list-inside">
                <li>Tap the <strong>Share</strong> button in Safari (square with arrow)</li>
                <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                <li>Tap <strong>"Add"</strong> to confirm</li>
              </ol>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-6 text-left space-y-3">
              <p className="font-semibold text-foreground flex items-center gap-2">
                <Monitor className="h-5 w-5" /> Install from Browser
              </p>
              <ol className="text-muted-foreground space-y-2 text-sm list-decimal list-inside">
                <li>Open this page in <strong>Chrome</strong> or <strong>Edge</strong></li>
                <li>Click the <strong>install icon</strong> in the address bar</li>
                <li>Or open the browser menu → <strong>"Install app"</strong></li>
              </ol>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { icon: "⚡", label: "Fast" },
              { icon: "📴", label: "Works Offline" },
              { icon: "🔔", label: "Home Screen" },
            ].map((f) => (
              <div key={f.label} className="text-center">
                <div className="text-2xl mb-1">{f.icon}</div>
                <div className="text-xs text-muted-foreground">{f.label}</div>
              </div>
            ))}
          </div>

          <Link to="/" className="block">
            <Button variant="ghost" className="text-muted-foreground">
              Continue to website →
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default InstallPage;
