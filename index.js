/**
 * @format
 */

import {AppRegistry} from 'react-native';
import Route from './navigation/Route';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import firestore,{firebase} from '@react-native-firebase/firestore';
import PushNotification from "react-native-push-notification";
const message = 'sample';

// AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage',() => Route)

AppRegistry.registerComponent(appName, () => Route);
