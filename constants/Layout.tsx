
import { Dimensions } from 'react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const scale = width / 320;
export default {
    width,
    height,
    scale
};

