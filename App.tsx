import * as React from 'react';
import {
  NavigationContainer,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './screens/Home.screen';
import FilesScreen from './screens/Files.screen';
import {HeaderButton} from '@react-navigation/elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import {TouchableOpacity} from 'react-native';

export type NavigationParamsList = {
  Home: undefined;
  Files: undefined;
};

const Stack = createNativeStackNavigator<NavigationParamsList>();

function RootStack() {
  const navigation = useNavigation<NavigationProp<NavigationParamsList>>();

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerRight: () => (
            <TouchableOpacity>
              <HeaderButton onPress={() => navigation.navigate('Files')}>
                <Icon name="folder-open-o" size={24} />
              </HeaderButton>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="Files" component={FilesScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
}
