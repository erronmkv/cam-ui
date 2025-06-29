
import { RefObject } from 'react';

interface CameraPreviewProps {
  videoRef: RefObject<HTMLVideoElement>;
}

const CameraPreview = ({ videoRef }: CameraPreviewProps) => {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-100 p-8">
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl w-full">
        <div className="aspect-video relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Interface overlay */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="text-gray-400 text-sm font-medium mb-2 text-center">interface:</div>
            <div className="w-16 h-12 border-2 border-gray-300 rounded-sm relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <div className="w-3 h-2 border border-gray-300 rounded-t-sm bg-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraPreview;
