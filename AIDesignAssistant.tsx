import { Helmet } from "react-helmet";
import AIDesignAssistant from "@/components/AIDesignAssistant";

export default function AIDesignAssistantPage() {
  return (
    <>
      <Helmet>
        <title>AI Design Assistant - Metal Cards NYC</title>
        <meta name="description" content="Get personalized business card design recommendations powered by AI. Our intelligent assistant analyzes your business and provides professional design suggestions." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              AI Design Assistant
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get personalized business card design recommendations powered by artificial intelligence. 
              Our AI analyzes your business information and provides professional design suggestions.
            </p>
          </div>
          
          <AIDesignAssistant />
        </div>
      </div>
    </>
  );
}