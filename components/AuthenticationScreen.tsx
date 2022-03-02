import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  View,
  BackHandler,
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
import Swipeable from "react-native-gesture-handler/Swipeable";

export default class AuthenticationScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  retryConnection = (self) =>{
    setTimeout(() => {
      NetInfo.fetch().then(async response => {
        if (response.isConnected) {
     
          let user_id = await AsyncStorage.getItem('user_id');

          axios
            .get(
              ipConfig.ipAddress + '/check_utility/' + DeviceInfo.getVersion(),
            )
            .then(async response => {
              
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
            textBody: 'No Internet Connection.Please check your internet connection.',
            buttonText: 'Retry',
            okButtonStyle: styles.confirmButton,
            okButtonTextStyle: styles.confirmButtonText,
            callback: () => {  
              Popup.hide();
                          
              
             
            },
          });

        }
      });
    }, 3000);

    
  }

  componentDidMount() {


    let self = this;


    // check if internet connection is back again
    NetInfo.addEventListener((state)=>{ 

       if(state.isConnected){
         console.warn('connected')
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

            this.retryConnection(self)
            
          },
        });
       }
    });

    setTimeout(() => {
      NetInfo.fetch().then(async response => {
        if (response.isConnected) {
     
          let user_id = await AsyncStorage.getItem('user_id');

          axios
            .get(
              ipConfig.ipAddress + '/check_utility/' + DeviceInfo.getVersion(),
            )
            .then(async response => {
              

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
                    'The mobile application has new update. please download the new mobile application in voucher management platform website.',
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
            .catch(err => console.warn(err.response));
        } else {
          

          // pop up no internet connection
          Popup.show({
            type: 'danger',
            title: 'Message',
            textBody: 'No Internet Connection.Please check your internet connection.',
            buttonText: 'Retry',
            okButtonStyle: styles.confirmButton,
            okButtonTextStyle: styles.confirmButtonText,
            callback: () => {              
              Popup.hide();

              
              
            },
          });

        }
      });
    }, 3000);
  }

  render() {
    return (
      <Animatable.View
        style={styles.container}
        animation="fadeInDownBig"
        duration={1000}>
        <Image
          source={Images.DA_Logo}
          style={styles.logo}
          resizeMode={'contain'}
        />
      </Animatable.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.light,
  },
  title: {
    marginVertical: (Layout.height / 100) * -20,
    fontSize: 25,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logo: {
    width: (Layout.width / 100) * 80,
    height: (Layout.height / 100) * 80,
    bottom: 0,
    top: 0,
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
