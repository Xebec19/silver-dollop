import {useState, useEffect} from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {PermissionsAndroid, Platform} from 'react-native';
import RNFS from 'react-native-fs';

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

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Permissions granted');
          return true;
        } else {
          console.log('All required permissions not granted');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const getRecordingPath = async () => {
    const now = new Date();
    const fileName = `recording_${now.getTime()}.mp3`;
    if (Platform.OS === 'android') {
      const dirPath = `${RNFS.ExternalDirectoryPath}/SoundRecorder`;
      try {
        const dirExists = await RNFS.exists(dirPath);
        if (!dirExists) {
          await RNFS.mkdir(dirPath);
        }
        return `${dirPath}/${fileName}`;
      } catch (error) {
        console.error('Error creating directory:', error);
        return `${RNFS.ExternalDirectoryPath}/${fileName}`;
      }
    } else {
      return `${RNFS.DocumentDirectoryPath}/${fileName}`;
    }
  };

  const startRecording = async () => {
    try {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        // throw new Error('Permissions not granted');
      }

      const path = await getRecordingPath();
      const uri = await audioRecorderPlayer.startRecorder(path);
      audioRecorderPlayer.addRecordBackListener(e => {
        setDuration(e.currentPosition / 1000);
      });
      setIsRecording(true);
      setDuration(0);
      console.log('Recording started', uri);
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
      console.log('Recording stopped', uri);
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
