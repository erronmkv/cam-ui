import { RefObject } from 'react';
import DurationMeter from './DurationMeter';

interface CameraPreviewProps {
  videoRef: RefObject<HTMLVideoElement>;
  isRecording: boolean;
  isFlipped: boolean;
}

const CameraPreview = ({ videoRef, isRecording, isFlipped }: CameraPreviewProps) => {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-100 p-8">
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl w-full">
        <div className="aspect-video relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded shadow max-h-full max-w-full"
            style={{
              background: '#000',
              transform: isFlipped ? 'scaleX(-1)' : 'none'
            }}
          />
          <DurationMeter isRecording={isRecording} />
        </div>
      </div>
    </div>
  );
};

export default CameraPreview;
