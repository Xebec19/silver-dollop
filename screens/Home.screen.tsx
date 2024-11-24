import React from 'react';
import Container from '../components/ui/Container';
import {Text} from '@react-navigation/elements';

function HomeScreen() {
  return (
    <Container>
      <Text>Home Screen</Text>
      {/* <Button onPress={() => navigation.navigate('Files')}>
        Go to Details
      </Button> */}
    </Container>
  );
}

export default HomeScreen;
