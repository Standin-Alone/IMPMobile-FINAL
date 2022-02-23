import  React,{Component} from 'react';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';

import { NavigationContainer } from '@react-navigation/native';
import { Root } from 'react-native-popup-confirm-toast';
import LoginScreen from '../components/LoginScreen';
import ForgotPasswordScreen from '../components/ForgotPasswordScreen';
import OTPScreen from '../components/OTPScreen';
import BottomTabNavigator from '../navigation/BottomTabNavigator';
import FarmerProfileScreen from '../components/FarmerProfileScreen';
import AuthenticationScreen from '../components/AuthenticationScreen';
import CommodityScreen from '../components/transactions/CommodityScreen';
import SelectedCommodityScreen from '../components/transactions/SelectedCommodityScreen';
import ViewCartScreen from '../components/transactions/ViewCartScreen';
import AttachmentScreen from '../components/transactions/AttachmentScreen';
import ReviewTransactionScreen from '../components/transactions/ReviewTransactionScreen';
import SummaryScreen from '../components/SummaryScreen';
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';
import SocketConnection from '../constants/SocketConnection';
import PushNotification from "react-native-push-notification";

import {firebase} from '@react-native-firebase/firestore';

import Firebase from '../constants/Firebase';

const Stack  = createSharedElementStackNavigator();



function MyStack(){
  
      
PushNotification.configure({
    onNotification: function(notification) {
        const { data } = notification;
        

        PushNotification.cancelLocalNotification(data);
                                     
    }
  });
  

  

    if (!firebase.apps.length) {
        firebase.initializeApp(Firebase.credentials).catch((err)=>console.warn(err));
    }

 
firebase.messaging().setBackgroundMessageHandler(async remoteMessage => {

                  PushNotification.createChannel({
                    channelId:  remoteMessage.data.channel,
                    channelName:remoteMessage.data.channel,
                    soundName: 'default',     
                    vibrate: true,
                  },()=>{console.warn('created')});


                    // create channel for notification
                PushNotification.localNotification({
                  channelId: remoteMessage.data.channel, // (required)
                  channelName: remoteMessage.data.channel,
                  autoCancel: true,
                  userInfo: {id:remoteMessage.data.channel},
                  subText: 'Notification',
                  title: 'Intervention Management Platform',
                  message: remoteMessage.data.message,
                  vibrate: true,
                  vibration: 300,
                  playSound: true,
                  soundName: 'default',
                  priority:'high'
              });

 
    });
  
  

    firebase.messaging().onMessage(async(remoteMessage)=>{
        try {            
            // create channel for notification0
            PushNotification.createChannel({
                channelId:  remoteMessage.data.channel,
                channelName: 'Sample',
                soundName: 'default',     
                vibrate: true,
              },()=>{console.warn('created')});


            // create push notification
            PushNotification.localNotification({
              channelId: remoteMessage.data.channel, // (required)
              channelName: 'Sample',
              autoCancel: true,
              userInfo: {id:remoteMessage.data.channel},
              subText: 'Notification',
              title: 'Intervention Management Platform',
              message: remoteMessage.data.message,            
              vibrate: true,
              vibration: 300,
              playSound: true,
              soundName: 'default',
              priority:'high'
          });


          } catch (err) { console.log(err) }

    })

    




    SocketConnection.socket.on('connect',async msg => {  
     console.warn('connected');
            

     
        
      SocketConnection.socket.on('room',  result => {

    


      
        //     PushNotification.createChannel({
        //         channelId: result.channel,
        //         channelName: 'Sample',
        //         soundName: 'default',     
        //         vibrate: true,
        //       },()=>{console.warn('created')});
              
        // // create channel for notification
        // PushNotification.localNotification({
        //     channelId: result.channel, // (required)
        //     channelName: 'Sample',
        //     autoCancel: true,
        //     userInfo: {document_number:result.message},
        //     subText: 'Notification',
        //     title: 'Intervention Management Platform',
        //     message: result.message,
        //     vibrate: true,
        //     vibration: 300,
        //     playSound: true,
        //     soundName: 'default',
        //     priority:'high'
        // });
            
// create channel for notification
    

   
            
        });

    });
    
    return(
        <Root>
            <Stack.Navigator initialRouteName='AuthenticationScreen'>            
                <Stack.Screen component={AuthenticationScreen} name='AuthenticationScreen' options={{headerShown:false,headerTransparent:true}}/>
                <Stack.Screen component={LoginScreen} name='LoginScreen' options={{headerShown:false,headerTransparent:true}}/>
                <Stack.Screen component={ForgotPasswordScreen} name='ForgotPasswordScreen' options={{headerTransparent:true,headerTitle:'Change Password'}}/>
                <Stack.Screen component={OTPScreen} name='OTPScreen' options={{headerShown:false,headerTransparent:true}}/>
                <Stack.Screen component={FarmerProfileScreen} name='FarmerProfileScreen' options={{headerShown:false,headerTransparent:true}}/>
                <Stack.Screen component={SelectedCommodityScreen} name='SelectedCommodityScreen' options={{headerTitle:'Commodity',headerTransparent:true,
                transitionSpec:{
                    open:{animation:'timing',config:{duration:500}},
                    close:{animation:'timing',config:{duration:500}}
                },
                cardStyleInterpolator:({current:{progress}})=>{
                    return {
                        cardStyle:{
                            opacity:progress
                        }
                    }
                }               
                
                }}
                

                
                sharedElements={(route, otherRoute, showing) => {

                    if(otherRoute.name == 'CommodityScreen' && showing){
                        const { item } = route.params;                    
                        return [{   id: item.item_id,                                                }];
                    }
                    
                  }}
                  
                />
                <Stack.Screen component={CommodityScreen} name='CommodityScreen' options={{headerTransparent:true,headerTitle:"Commodities",headerTitleStyle:{fontFamily:'Gotham_bold'}}} 
                               
              
                  
                />
                <Stack.Screen component={ViewCartScreen} name='ViewCartScreen' options={{headerTransparent:true,headerTitle:"My Cart",headerTitleStyle:{fontFamily:'Gotham_bold'}}} />
                <Stack.Screen component={AttachmentScreen} name='AttachmentScreen' options={{headerTransparent:true,headerTitle:"Attachments",headerTitleStyle:{fontFamily:'Gotham_bold'}}} />
                <Stack.Screen component={SummaryScreen} name='SummaryScreen' options={{headerTransparent:true,headerTitle:"More Info",headerTitleStyle:{fontFamily:'Gotham_bold'}}} />
                <Stack.Screen component={ReviewTransactionScreen} name='ReviewTransactionScreen' options={{headerShown:false,headerTransparent:true}}/>                
                <Stack.Screen component={BottomTabNavigator} name='Root' options={{headerShown:false,headerTransparent:true}}/>
            </Stack.Navigator>
        </Root>
    )
    
}


export default function Route(){



    return (
        <NavigationContainer>
            <MyStack/>
        </NavigationContainer>
    )
}