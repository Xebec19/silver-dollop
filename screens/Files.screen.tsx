import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
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
    requestPermissions();
    return () => {
      if (isPlaying) {
        audioRecorderPlayer.stopPlayer();
      }
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      console.log({result});
      if (result === RESULTS.GRANTED) {
        fetchRecordings();
      } else {
        console.log('Permission denied');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const fetchRecordings = async () => {
    try {
      const files = await RNFS.readDir(RNFS.ExternalStorageDirectoryPath);
      console.log({files, path: RNFS.ExternalStorageDirectoryPath});
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
