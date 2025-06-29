import { useState, useRef, useEffect } from 'react';
import CameraControls from '@/components/CameraControls';
import CameraPreview from '@/components/CameraPreview'; 
import CaptureControls from '@/components/CaptureControls';
import IntroScreen from '@/components/IntroScreen';

const Index = () => {
  const [showIntro, setShowIntro] = useState(true);
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

  useEffect(() => {
    // Request audio permission once to ensure audio devices are listed
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
        getDevices();
      })
      .catch(() => getDevices());
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
      setIsDevicesLoaded(true); // Still show controls even if device enumeration fails
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
    if (isDevicesLoaded) {
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

    // Try different codec options for better compatibility
    const codecOptions = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus', 
      'video/webm',
      'video/mp4'
    ];

    let mediaRecorder: MediaRecorder | null = null;
    
    for (const mimeType of codecOptions) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        try {
          mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
          break;
        } catch (error) {
          console.log(`Failed to create MediaRecorder with ${mimeType}:`, error);
        }
      }
    }

    if (!mediaRecorder) {
      // Fallback without specifying codec
      try {
        mediaRecorder = new MediaRecorder(streamRef.current);
      } catch (error) {
        console.error('Failed to create MediaRecorder:', error);
        return;
      }
    }

    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mediaRecorder?.mimeType || 'video/webm' });
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
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleLaunchApp = () => {
    setShowIntro(false);
  };

  const handleCloseApp = () => {
    // Stop any active streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    // Stop recording if active
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    setShowIntro(true);
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

  if (showIntro) {
    return <IntroScreen onLaunch={handleLaunchApp} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {isDevicesLoaded ? (
        <CameraControls
          resolution={resolution}
          setResolution={setResolution}
          selectedCamera={selectedCamera || (devices.cameras[0]?.deviceId || '')}
          setSelectedCamera={setSelectedCamera}
          selectedAudio={selectedAudio || (devices.audioDevices[0]?.deviceId || '')}
          setSelectedAudio={setSelectedAudio}
          cameras={devices.cameras}
          audioDevices={devices.audioDevices}
          onClose={handleCloseApp}
        />
      ) : (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-center">
            <span className="text-gray-500">Loading camera...</span>
          </div>
        </div>
      )}
      
      <CameraPreview videoRef={videoRef} isRecording={isRecording} />
      
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
