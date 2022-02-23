
window.navigator.userAgent = 'react-native';
import React, {Component} from 'react';
import io from 'socket.io-client/dist/socket.io';
import { ipAddress,ipAddress_socket } from '../ipconfig';



let socket = io(ipAddress_socket+':8080'); 






  export default {socket}