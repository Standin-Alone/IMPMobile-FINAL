import  React,{Component} from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { NavigationContainer } from '@react-navigation/native';
import { Root } from 'react-native-popup-confirm-toast';
import LoginScreen from '../components/LoginScreen';
import OTPScreen from '../components/OTPScreen';
import BottomTabNavigator from '../navigation/BottomTabNavigator';
import FarmerProfileScreen from '../components/FarmerProfileScreen';
import AuthenticationScreen from '../components/AuthenticationScreen';
import FuelScreen from '../components/transactions/FuelScreen';
import SelectedCommodityScreen from '../components/transactions/SelectedCommodityScreen';
import ViewCartScreen from '../components/transactions/ViewCartScreen';
import AttachmentScreen from '../components/transactions/AttachmentScreen';
import ReviewTransactionScreen from '../components/transactions/ReviewTransactionScreen';
const Stack  = createStackNavigator();

function MyStack(){
    return(
        <Root>
            <Stack.Navigator initialRouteName='AuthenticationScreen'>            
                <Stack.Screen component={AuthenticationScreen} name='AuthenticationScreen' options={{headerShown:false,headerTransparent:true}}/>
                <Stack.Screen component={LoginScreen} name='LoginScreen' options={{headerShown:false,headerTransparent:true}}/>
                <Stack.Screen component={OTPScreen} name='OTPScreen' options={{headerShown:false,headerTransparent:true}}/>
                <Stack.Screen component={FarmerProfileScreen} name='FarmerProfileScreen' options={{headerShown:false,headerTransparent:true}}/>
                <Stack.Screen component={SelectedCommodityScreen} name='SelectedCommodityScreen' options={{headerTitle:'Commodity',headerTransparent:true}}/>
                <Stack.Screen component={FuelScreen} name='FuelScreen' options={{headerTransparent:true,headerTitle:"Commodities",headerTitleStyle:{fontFamily:'Gotham_bold'}}} />
                <Stack.Screen component={ViewCartScreen} name='ViewCartScreen' options={{headerTransparent:true,headerTitle:"My Cart",headerTitleStyle:{fontFamily:'Gotham_bold'}}} />
                <Stack.Screen component={AttachmentScreen} name='AttachmentScreen' options={{headerTransparent:true,headerTitle:"Attachments",headerTitleStyle:{fontFamily:'Gotham_bold'}}} />
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