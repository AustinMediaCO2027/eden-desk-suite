import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";

const PlaceholderPage = () => {
  const location = useLocation();
  const pageName = location.pathname.split("/").pop() || "Page";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-6">
        <Construction className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold capitalize mb-2">{pageName}</h1>
      <p className="text-muted-foreground text-sm max-w-sm">
        This feature is coming soon. We're building something great for you.
      </p>
    </div>
  );
};

export default PlaceholderPage;
