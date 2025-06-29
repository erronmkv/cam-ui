
import { Button } from "@/components/ui/button";

interface IntroScreenProps {
  onLaunch: () => void;
}

const IntroScreen = ({ onLaunch }: IntroScreenProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Cam UI</h1>
        <p className="text-lg text-gray-600 mb-8">A free and open source camera app</p>
        <Button 
          onClick={onLaunch}
          className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-lg"
        >
          Launch Camera
        </Button>
      </div>
    </div>
  );
};

export default IntroScreen;
