import  React,{Component} from 'react';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Root } from 'react-native-popup-confirm-toast';
import LoginScreen from '../components/LoginScreen';
import ForgotPasswordScreen from '../components/ForgotPasswordScreen';
import OTPScreen from '../components/OTPScreen';
import BottomTabNavigator from './BottomTabNavigator';

import FarmerProfileScreen from '../components/FarmerProfileScreen';
import AuthenticationScreen from '../components/AuthenticationScreen';
import CommodityScreen from '../components/transactions/CommodityScreen';
import SelectedCommodityScreen from '../components/transactions/SelectedCommodityScreen';
import ViewCartScreen from '../components/transactions/ViewCartScreen';
import AttachmentScreen from '../components/transactions/AttachmentScreen';
import ReviewTransactionScreen from '../components/transactions/ReviewTransactionScreen';
import SummaryScreen from '../components/SummaryScreen';
import PayoutSummaryScreen from '../components/PayoutSummaryScreen';
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';

import ProfileScreen from '../components/ProfileScreen';
import SocketConnection from '../constants/SocketConnection';
import PushNotification from "react-native-push-notification";

import {firebase} from '@react-native-firebase/firestore';

import Firebase from '../constants/Firebase';
import Colors from '../constants/Colors';
import PayoutTracking from '../components/PayoutTracking';

// LogBox.ignoreAllLogs();
const Stack  = createSharedElementStackNavigator();



function MyStack(){
  
      
    // PushNotification.configure({
    //     onNotification: function(notification) {
    //         const { data } = notification;
            

    //         PushNotification.cancelLocalNotification(data);
                                        
    //     }
    // });


    // if (!firebase.apps.length) {
    //     firebase.initializeApp(Firebase.credentials).catch((err)=>console.warn(err));
    // }

    // firebase 
    // firebase.messaging().setBackgroundMessageHandler(async remoteMessage => {

    //               PushNotification.createChannel({
    //                 channelId:  remoteMessage.data.channel,
    //                 channelName:remoteMessage.data.channel,
    //                 soundName: 'default',     
    //                 vibrate: true,
    //               },()=>{console.warn('created')});


    //                 // create channel for notification
    //             PushNotification.localNotification({
    //               channelId: remoteMessage.data.channel, // (required)
    //               channelName: remoteMessage.data.channel,
    //               autoCancel: true,
    //               userInfo: {id:remoteMessage.data.channel},
    //               subText: 'Notification',
    //               title: 'Intervention Management Platform',
    //               message: remoteMessage.data.message,
    //               vibrate: true,
    //               vibration: 300,
    //               playSound: true,
    //               soundName: 'default',
    //               priority:'high'
    //           });

 
    // });
  
  

    // firebase.messaging().onMessage(async(remoteMessage)=>{
    //     try {            
    //         // create channel for notification0
    //         PushNotification.createChannel({
    //             channelId:  remoteMessage.data.channel,
    //             channelName: 'Sample',
    //             soundName: 'default',     
    //             vibrate: true,
    //           },()=>{console.warn('created')});


    //         // create push notification
    //         PushNotification.localNotification({
    //           channelId: remoteMessage.data.channel, // (required)
    //           channelName: 'Sample',
    //           autoCancel: true,
    //           userInfo: {id:remoteMessage.data.channel},
    //           subText: 'Notification',
    //           title: 'Intervention Management Platform',
    //           message: remoteMessage.data.message,            
    //           vibrate: true,
    //           vibration: 300,
    //           playSound: true,
    //           soundName: 'default',
    //           priority:'high'
    //       });


    //       } catch (err) { console.log(err) }

    // })

    




    // SocketConnection.socket.on('connect',async msg => {  
    //  console.warn('connected');
            

     
        
    //   SocketConnection.socket.on('room',  result => {

    


        // create channel for notification
        //     PushNotification.createChannel({
        //         channelId: result.channel,
        //         channelName: 'Sample',
        //         soundName: 'default',     
        //         vibrate: true,
        //       },()=>{console.warn('created')});
                      
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
            
    //     });

    // });
    
    return(
        <Root>
            <Stack.Navigator initialRouteName='AuthenticationScreen' >            
                <Stack.Screen component={AuthenticationScreen} name='AuthenticationScreen' options={{headerShown:false,headerTransparent:true}}/>
                <Stack.Screen component={LoginScreen} name='LoginScreen' options={{headerShown:false,headerTransparent:true,cardStyleInterpolator:CardStyleInterpolators.forHorizontalIOS}}/>
                <Stack.Screen component={ForgotPasswordScreen} name='ForgotPasswordScreen' options={{headerTransparent:true,headerTitle:'Change Password',cardStyleInterpolator:CardStyleInterpolators.forRevealFromBottomAndroid}}/>
                <Stack.Screen component={OTPScreen} name='OTPScreen' options={{headerShown:true,headerTransparent:true,headerTitle:'Verify OTP',cardStyleInterpolator:CardStyleInterpolators.forHorizontalIOS}}/>
                <Stack.Screen component={FarmerProfileScreen} name='FarmerProfileScreen' options={{headerShown:false,headerTransparent:true,cardStyleInterpolator:CardStyleInterpolators.forHorizontalIOS}}/>
                <Stack.Screen component={SelectedCommodityScreen} name='SelectedCommodityScreen'             
                    sharedElements={(route, otherRoute, showing) => {
                        if(otherRoute.name == 'CommodityScreen' && showing){
                            const { item } = route.params;                    
                            return [{   id: item.item_id,                                                }];
                        }                        
                    }}                    
                />
                <Stack.Screen component={CommodityScreen} name='CommodityScreen' options={{headerTransparent:true,headerTitle:"Commodities",headerTitleStyle:{fontFamily:'Gotham_bold'},cardStyleInterpolator:CardStyleInterpolators.forHorizontalIOS}} 
                               
              
                  
                />
                <Stack.Screen component={ViewCartScreen} name='ViewCartScreen' options={{cardStyleInterpolator:CardStyleInterpolators.forHorizontalIOS}}/>
                <Stack.Screen component={AttachmentScreen} name='AttachmentScreen' options={{headerTransparent:true,headerTitle:"Attachments",headerTitleStyle:{fontFamily:'Gotham_bold'},cardStyleInterpolator:CardStyleInterpolators.forHorizontalIOS}} />
                <Stack.Screen component={SummaryScreen} name='SummaryScreen' options={{headerTransparent:true,headerTitle:"Transaction Details",headerTitleStyle:{fontFamily:'Gotham_bold'},headerTintColor:Colors.green,cardStyleInterpolator:CardStyleInterpolators.forHorizontalIOS}} />
                <Stack.Screen component={ProfileScreen} name='ProfileScreen' options={{headerTransparent:true,headerTitle:"Profile",headerTitleStyle:{fontFamily:'Gotham_bold',color:Colors.light},  headerTintColor:Colors.light,cardStyleInterpolator:CardStyleInterpolators.forRevealFromBottomAndroid}} />
                <Stack.Screen component={ReviewTransactionScreen} name='ReviewTransactionScreen' options={{headerShown:false,headerTransparent:true,cardStyleInterpolator:CardStyleInterpolators.forHorizontalIOS}}/>    
                <Stack.Screen component={PayoutSummaryScreen} name='PayoutSummaryScreen' options={{headerTransparent:true,headerTitle:"Payout Summary",headerTitleStyle:{fontFamily:'Gotham_bold',color:'white'}, headerTintColor: 'white'}}/>                
                <Stack.Screen component={PayoutTracking} name='PayoutTracking' options={{headerTransparent:true,headerTitle:"Payout Tracking",headerTitleStyle:{fontFamily:'Gotham_bold',color:Colors.green}, headerTintColor:Colors.green}}/>                
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