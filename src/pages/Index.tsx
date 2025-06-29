import { useState, useRef, useEffect } from 'react';
import CameraControls from '@/components/CameraControls';
import CameraPreview from '@/components/CameraPreview'; 
import CaptureControls from '@/components/CaptureControls';

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('photo');
  const [selectedCamera, setSelectedCamera] = useState<string | undefined>(undefined);
  const [selectedAudio, setSelectedAudio] = useState<string | undefined>(undefined);
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [devices, setDevices] = useState<{
    cameras: MediaDeviceInfo[];
    audioDevices: MediaDeviceInfo[];
  }>({ cameras: [], audioDevices: [] });
  const [isDevicesLoaded, setIsDevicesLoaded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    initializeCamera();
    getDevices();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getDevices = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const cameras = deviceList.filter(device => 
        device.kind === 'videoinput' && device.deviceId
      );
      const audioDevices = deviceList.filter(device => 
        device.kind === 'audioinput' && device.deviceId
      );
      
      setDevices({ cameras, audioDevices });
      
      if (cameras.length > 0 && !selectedCamera) {
        setSelectedCamera(cameras[0].deviceId);
      }
      if (audioDevices.length > 0 && !selectedAudio) {
        setSelectedAudio(audioDevices[0].deviceId);
      }
      
      setIsDevicesLoaded(true);
    } catch (error) {
      console.error('Error getting devices:', error);
    }
  };

  const initializeCamera = async () => {
    try {
      const constraints = {
        video: {
          width: resolution === '1080p' ? 1920 : 1280,
          height: resolution === '1080p' ? 1080 : 720,
          deviceId: selectedCamera || undefined
        },
        audio: captureMode === 'video' ? { deviceId: selectedAudio || undefined } : false
      };

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  useEffect(() => {
    if (isDevicesLoaded && (selectedCamera || selectedAudio || resolution)) {
      initializeCamera();
    }
  }, [selectedCamera, selectedAudio, resolution, captureMode, isDevicesLoaded]);

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    if (context) {
      context.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `photo-${new Date().getTime()}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const options = {
      mimeType: 'video/webm;codecs=vp9'
    };

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video-${new Date().getTime()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleCapture = () => {
    if (captureMode === 'photo') {
      capturePhoto();
    } else {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {isDevicesLoaded && selectedCamera && selectedAudio ? (
        <CameraControls
          resolution={resolution}
          setResolution={setResolution}
          selectedCamera={selectedCamera}
          setSelectedCamera={setSelectedCamera}
          selectedAudio={selectedAudio}
          setSelectedAudio={setSelectedAudio}
          cameras={devices.cameras}
          audioDevices={devices.audioDevices}
        />
      ) : (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-center">
            <span className="text-gray-500">Loading camera...</span>
          </div>
        </div>
      )}
      
      <CameraPreview videoRef={videoRef} />
      
      <CaptureControls
        captureMode={captureMode}
        setCaptureMode={setCaptureMode}
        isRecording={isRecording}
        onCapture={handleCapture}
      />
    </div>
  );
};

export default Index;
