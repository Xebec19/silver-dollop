import styled from 'styled-components';
import {SafeAreaView, StatusBar} from 'react-native';

const Container = styled(SafeAreaView)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  text-align: center;
  margin-top: ${StatusBar.currentHeight
    ? StatusBar.currentHeight + 'px'
    : '0px'};
`;

export default Container;
