import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  InteractionManager,
  Image,
  View,
  BackHandler,
  ImageBackground
} from 'react-native';

import Images from '../constants/Images';
import Layout from '../constants/Layout';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import * as Animatable from 'react-native-animatable';
import axios from 'axios';
import * as ipConfig from '../ipconfig';
import DeviceInfo from 'react-native-device-info';
import {Popup} from 'react-native-popup-confirm-toast';
import Geolocation from '@react-native-community/geolocation';
import FastImage from 'react-native-fast-image';
import Swipeable from "react-native-gesture-handler/Swipeable";
import { stat } from 'react-native-fs';
let subscribe;
export default class AuthenticationScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      check_connection : true
    };
  }

  retryConnection = (self) =>{

  //  let connection_timeout = setTimeout(() => {
      NetInfo.fetch().then(response => {
        
        if (response.isConnected && response.isInternetReachable) {
   
         

          axios
            .get(
              ipConfig.ipAddress + '/check_utility/' + DeviceInfo.getVersion(),
            )
            .then(async response => {
           
              let user_id = await AsyncStorage.getItem('user_id');
              // if(user_id){
              //     self.props.navigation.replace('Root');
              //   }else{
              //       self.props.navigation.replace('LoginScreen');

              //   }

              // ENABLE THIS BEFORE GENERATING APK
              // check if the mobile application is on maintenance
              if (response.data['maintenance'] == '1') {
                Popup.show({
                  type: 'danger',
                  title: 'Error!',
                  textBody:
                    'Sorry for the inconvenience. The mobile application is on maintenance. Please try again later.',
                  buttonText: 'Ok',
                  okButtonStyle: styles.confirmButton,
                  okButtonTextStyle: styles.confirmButtonText,
                  callback: () => {
                    BackHandler.exitApp();
                    Popup.hide();
                  },
                });
              }
              // check if the mobile app has new version
              else if (response.data['active'] == '0') {
                Popup.show({
                  type: 'danger',
                  title: 'Error!',
                  textBody:
                    'The mobile application has new update. please download the new mobile application in intervention management platform website.',
                  buttonText: 'Ok',
                  okButtonStyle: styles.confirmButton,
                  okButtonTextStyle: styles.confirmButtonText,
                  callback: () => {
                    BackHandler.exitApp();
                    Popup.hide();
                  },
                });
              } else {
         
                // check location
                Geolocation.getCurrentPosition(
                  async openLocation => {
              
                    // if(openLocation && (openLocation.coords.latitude != 0 && openLocation.coords.longitude != 0))
                    
                    if (openLocation) {
                      
                      if (user_id) {
                        
                        self.props.navigation.replace('Root');
                        
                      } else {
                        self.props.navigation.replace('LoginScreen');
                      }
                    } else {
                      Popup.show({
                        type: 'danger',
                        title: 'Message',
                        textBody: 'Please open your location first.',
                        buttonText: 'Ok',
                        okButtonStyle: styles.confirmButton,
                        okButtonTextStyle: styles.confirmButtonText,
                        callback: () => {
                          BackHandler.exitApp();
                          Popup.hide();
                        },
                      });
                    }
                  },
                  err => {
                    console.warn(err);
                    if (err.code === 2) {
                      Popup.show({
                        type: 'danger',
                        title: 'Message',
                        textBody: 'Please open your location first.',
                        buttonText: 'Ok',
                        okButtonStyle: styles.confirmButton,
                        okButtonTextStyle: styles.confirmButtonText,
                        callback: () => {
                          BackHandler.exitApp();
                          Popup.hide();
                        },
                      });
                    }
                  },
                  {
                    enableHighAccuracy: false,
                    timeout: 2000,
                    maximumAge: 3600000,
                  },
                );
              }
            })
            .catch(err => console.warn(err.response.data));
        } else {
          

          Popup.show({
            type: 'danger',
            title: 'Message',
            textBody: 'No Internet Connection.Please check your internet connection. Retry  conection',
            buttonText: 'Retry',
            okButtonStyle: styles.confirmButton,
            okButtonTextStyle: styles.confirmButtonText,
            callback: () => {  
              Popup.hide();
                                        
             
            },
          });

        }
      });
    // }, 2000);
  
    
  }

  componentDidMount() {
    let self = this;
    


    InteractionManager.runAfterInteractions(()=>{
        // check if internet connection is back again
        NetInfo.fetch().then((state)=>{ 
        
          setTimeout(()=>{
          if(state.isConnected && state.isInternetReachable){
    
            this.retryConnection(self)
            
          }else{
  
            Popup.show({
              type: 'danger',
              title: 'Message',
              textBody: 'No Internet Connection.Please check your internet connection.',
              buttonText: 'Retry',
              okButtonStyle: styles.confirmButton,
              okButtonTextStyle: styles.confirmButtonText,
              callback: () => {              
                Popup.hide();
                BackHandler.exitApp()
              },
            });
  
          }
          },3000);
        });

    })
    

  }


  render() {
    return (

      <>
      <FastImage
        // style={styles.container}
        source      = {Images.splash_screen}
        style       = {styles.container}
        resizeMode  = {'cover'}
       >
        <View>
           
            <Animatable.Image
              source      = {Images.DA_Logo_White}
              style       = {styles.logo}
              resizeMode  = {'contain'}
              animation = "fadeIn"
              duration  = {1000}
            />
        </View>
          
    
       
            
      </FastImage>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,        
    position:'absolute',
    width: (Layout.width / 100) * 100,
    height: (Layout.height / 100) * 100,
    
  },
  title: {
    marginVertical: (Layout.height / 100) * -20,
    fontSize: 25,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  splash_screen: {
    width: (Layout.width / 100) * 100,
    height: (Layout.height / 100) * 100,
    bottom: 0,
    top: 0,
  },
  logo: {
    width: (Layout.width / 100) * 100,
    height: (Layout.height / 100) * 100,    
    // bottom:(Layout.height / 100) * 10 ,
    // position:'absolute',
    alignSelf:'center'
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
  confirmButton: {
    backgroundColor: 'white',
    color: Colors.green,
    borderColor: Colors.green,
    borderWidth: 1,
  },
  confirmButtonText: {
    color: Colors.green,
  },
});
