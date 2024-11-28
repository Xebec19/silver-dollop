import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

interface Recording {
  name: string;
  path: string;
}

const audioRecorderPlayer = new AudioRecorderPlayer();

const FilesScreen = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(
    null,
  );

  useEffect(() => {
    requestPermissions().then(granted => {
      if (granted) {
        fetchRecordings();
      }
    });

    return () => {
      if (isPlaying) {
        audioRecorderPlayer.stopPlayer();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRecordingDir = async () => {
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
  };

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

  const fetchRecordings = async () => {
    try {
      const path = await getRecordingDir();
      await RNFS.mkdir(path);
      const files = await RNFS.readDir(path);
      console.log({files, path: path});
      const audioFiles = files.filter(
        file =>
          file.name.endsWith('.mp3') ||
          file.name.endsWith('.m4a') ||
          file.name.endsWith('.wav'),
      );
      setRecordings(
        audioFiles.map(file => ({name: file.name, path: file.path})),
      );
    } catch (error) {
      console.error('Error fetching recordings:', error);
    }
  };

  const playRecording = async (recording: Recording) => {
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
  };

  const pauseRecording = async () => {
    try {
      await audioRecorderPlayer.pausePlayer();
      setIsPlaying(false);
    } catch (error) {
      console.error('Error pausing recording:', error);
    }
  };

  const renderItem = ({item}: {item: Recording}) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        isPlaying && currentRecording?.path === item.path
          ? pauseRecording()
          : playRecording(item)
      }>
      <Text>{item.name}</Text>
      {currentRecording?.path === item.path && (
        <Text>{isPlaying ? 'Playing' : 'Paused'}</Text>
      )}
    </TouchableOpacity>
  );

  console.log({recordings});

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recordings</Text>
      <FlatList
        data={recordings}
        renderItem={renderItem}
        keyExtractor={item => item.path}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default FilesScreen;
