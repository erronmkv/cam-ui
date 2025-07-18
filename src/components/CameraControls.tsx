
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CameraControlsProps {
  resolution: '720p' | '1080p';
  setResolution: (resolution: '720p' | '1080p') => void;
  selectedCamera: string;
  setSelectedCamera: (camera: string) => void;
  selectedAudio: string;
  setSelectedAudio: (audio: string) => void;
  cameras: MediaDeviceInfo[];
  audioDevices: MediaDeviceInfo[];
  onClose: () => void;
}

const CameraControls = ({
  resolution,
  setResolution,
  selectedCamera,
  setSelectedCamera,
  selectedAudio,
  setSelectedAudio,
  cameras,
  audioDevices,
  onClose
}: CameraControlsProps) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex gap-4 items-center justify-center max-w-4xl mx-auto relative">
        <div className="bg-gray-900 text-white px-3 py-1.5 rounded-md text-sm font-medium">
          Cam UI
        </div>
        
        <Select value={resolution} onValueChange={(value: '720p' | '1080p') => setResolution(value)}>
          <SelectTrigger className="w-24 bg-white border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg">
            <SelectItem value="720p">720p</SelectItem>
            <SelectItem value="1080p">1080p</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedAudio} onValueChange={setSelectedAudio}>
          <SelectTrigger className="w-40 bg-white border-gray-300">
            <SelectValue placeholder="audio source" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg">
            {audioDevices.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label || `Audio Device ${device.deviceId.slice(0, 8)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCamera} onValueChange={setSelectedCamera}>
          <SelectTrigger className="w-40 bg-white border-gray-300">
            <SelectValue placeholder="camera source" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg">
            {cameras.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 text-gray-600 hover:text-gray-900"
        >
          <X size={20} />
        </Button>
      </div>
    </div>
  );
};

export default CameraControls;
