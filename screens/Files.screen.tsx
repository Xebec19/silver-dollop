import React, {useState, useEffect, useCallback, memo} from 'react';
import {Platform, PermissionsAndroid, View, Text, Button} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

interface Recording {
  name: string;
  path: string;
  timestamp: Date;
}

const audioRecorderPlayer = new AudioRecorderPlayer();

const FilesScreen = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(
    null,
  );

  useEffect(() => {
    const initialize = async () => {
      const granted = await requestPermissions();
      if (granted) {
        fetchRecordings();
      }
    };

    initialize();

    return () => {
      if (isPlaying) {
        audioRecorderPlayer.stopPlayer();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const getRecordingDir = useCallback(async () => {
    if (Platform.OS === 'android') {
      const dirPath = `${RNFS.ExternalDirectoryPath}/SoundRecorder`;
      try {
        const dirExists = await RNFS.exists(dirPath);
        if (!dirExists) {
          await RNFS.mkdir(dirPath);
        }
        return dirPath;
      } catch (error) {
        console.error('Error creating directory:', error);
        return RNFS.ExternalDirectoryPath;
      }
    } else {
      return RNFS.DocumentDirectoryPath;
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        return (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  }, []);

  const fetchRecordings = useCallback(async () => {
    try {
      const path = await getRecordingDir();
      const files = await RNFS.readDir(path);
      const audioFiles = files.filter(
        file =>
          file.name.endsWith('.mp3') ||
          file.name.endsWith('.m4a') ||
          file.name.endsWith('.wav'),
      );
      setRecordings(
        audioFiles.map(file => ({
          name: file.name,
          path: file.path,
          timestamp: file.mtime || new Date(),
        })),
      );
    } catch (error) {
      console.error('Error fetching recordings:', error);
    }
  }, [getRecordingDir]);

  const playRecording = useCallback(
    async (recording: Recording) => {
      try {
        if (isPlaying) {
          await audioRecorderPlayer.stopPlayer();
          setIsPlaying(false);
        }

        if (currentRecording?.path !== recording.path) {
          await audioRecorderPlayer.startPlayer(recording.path);
          setIsPlaying(true);
          setCurrentRecording(recording);

          audioRecorderPlayer.addPlayBackListener(e => {
            if (e.currentPosition === e.duration) {
              audioRecorderPlayer.stopPlayer();
              setIsPlaying(false);
            }
          });
        } else {
          await audioRecorderPlayer.resumePlayer();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Error playing recording:', error);
      }
    },
    [isPlaying, currentRecording],
  );

  return (
    <View>
      {recordings.map(recording => (
        <View key={recording.path}>
          <Text>{recording.name}</Text>
          <Button title="Play" onPress={() => playRecording(recording)} />
        </View>
      ))}
    </View>
  );
};

export default memo(FilesScreen);
