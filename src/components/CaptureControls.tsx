
import { Camera, SwitchCamera } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface CaptureControlsProps {
  captureMode: 'photo' | 'video';
  setCaptureMode: (mode: 'photo' | 'video') => void;
  isRecording: boolean;
  onCapture: () => void;
}

const CaptureControls = ({
  captureMode,
  setCaptureMode,
  isRecording,
  onCapture
}: CaptureControlsProps) => {
  return (
    <div className="bg-white border-t border-gray-200 p-6">
      <div className="flex items-center justify-center gap-8 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCaptureMode(captureMode === 'photo' ? 'video' : 'photo')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <SwitchCamera size={16} />
          <span className="text-sm">switch to {captureMode === 'photo' ? 'vid' : 'photo'}</span>
        </Button>

        <div className="flex flex-col items-center gap-2">
          <Button
            onClick={onCapture}
            className={`w-16 h-16 rounded-full ${
              captureMode === 'video' && isRecording
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gray-900 hover:bg-gray-800'
            } text-white flex items-center justify-center`}
          >
            {captureMode === 'video' && isRecording ? (
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            ) : (
              <div className="w-6 h-6 bg-white rounded-full"></div>
            )}
          </Button>
          <span className="text-xs text-gray-500">
            {captureMode === 'video' ? 
              (isRecording ? 'stop recording' : 'camera/vid button') : 
              'camera/vid button'
            }
          </span>
        </div>

        <div className="w-20"></div> {/* Spacer for symmetry */}
      </div>
    </div>
  );
};

export default CaptureControls;
