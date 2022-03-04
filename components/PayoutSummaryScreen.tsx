import React, {Component} from 'react';
import {View,Text, StyleSheet, Keyboard,Image} from 'react-native';
import {Fumi} from 'react-native-textinput-effects';
import Colors from '../constants/Colors';
import Entypo from 'react-native-vector-icons/Entypo';
import Layout from '../constants/Layout';
import Button from 'apsl-react-native-button';
import * as Animatable from 'react-native-animatable';
import NetInfo from "@react-native-community/netinfo";
import * as ipConfig from '../ipconfig';
import * as Yup from 'yup';
import axios from 'axios';
import { Formik } from 'formik';
import Icon from 'react-native-vector-icons/FontAwesome';
import Images from '../constants/Images';
import { Popup } from 'react-native-popup-confirm-toast';
export default class PayoutSummaryScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
  
    };

  }


  render() {

    return (
      <View style={styles.container}>
        
      
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  }
});
