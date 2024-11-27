import {useState, useEffect} from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const audioRecorderPlayer = new AudioRecorderPlayer();

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.stopPlayer();
    };
  }, []);

  const startRecording = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const uri = await audioRecorderPlayer.startRecorder();
      audioRecorderPlayer.addRecordBackListener(e => {
        setDuration(e.currentPosition / 1000);
      });
      setIsRecording(true);
      setDuration(0);
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      const uri = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setRecordedUri(uri);
      console.log('Recording stopped');
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const playSound = async () => {
    if (recordedUri) {
      try {
        await audioRecorderPlayer.startPlayer(recordedUri);
        console.log('Playing recorded audio');
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    }
  };

  return {
    isRecording,
    duration,
    recordedUri,
    startRecording,
    stopRecording,
    playSound,
  };
}
