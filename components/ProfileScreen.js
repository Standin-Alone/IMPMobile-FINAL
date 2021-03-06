import React, {Component} from 'react';
import {View,Text, StyleSheet,ScrollView,Image} from 'react-native';
import { FontAwesomeIcon}  from '@fortawesome/react-native-fontawesome';
import {faUserCircle,faMailBulk,faBuilding, faSignOut} from '@fortawesome/free-solid-svg-icons';
import Colors from '../constants/Colors';

import Layout from '../constants/Layout';
import * as Animatable from 'react-native-animatable';
import NetInfo from "@react-native-community/netinfo";
import axios from 'axios';
import * as ipConfig from '../ipconfig';
import * as Yup from 'yup';
import { Formik } from 'formik';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from 'apsl-react-native-button';
import { Root, Popup } from 'react-native-popup-confirm-toast';

import {List,Divider} from 'react-native-paper';
import Images from '../constants/Images';
import LinearGradient from 'react-native-linear-gradient';
export default class ProfileScreen extends Component {
  constructor(props : any) {
    super(props);
    this.state = {          
        full_name: '',
        region_name: '',
        isLoading:false,
        company_name:'',
        email:''
    };

  }

  async componentDidMount() {

    this.setState({full_name:await AsyncStorage.getItem('full_name')});
    this.setState({region_name:await AsyncStorage.getItem('region_name')});
    this.setState({company_name:await AsyncStorage.getItem('company_name')});
    this.setState({email:await AsyncStorage.getItem('email')});
      
  }


  render() {
    
    
    return (
      <View  style={styles.container}>        
      <View style={{alignContent:'center',bottom:(Layout.height /100)*35,}}>
  
      <Animatable.Image
              source      = {Images.profile_cover}
              style       = {styles.cover}
              resizeMode  = {'center'}                            
              blurRadius={2}
      />
       <LinearGradient
        colors={['transparent', 'rgba(255,255,255,1)']}
        style={styles.absolute}
      />

      </View>
        <View style={{top:(Layout.height /100)*23,left:5,alignContent:'center',zIndex:1}}>
            <FontAwesomeIcon icon={faUserCircle} color={Colors.light_green} size={140} style={{alignSelf:'center',marginBottom:20,shadowOffset:100,shadowOpacity:1,shadowColor:Colors.dark,textShadowOffset:{width:100, height:100}}}/>
            <Text style={styles.full_name} adjustsFontSizeToFit>  {this.state.full_name}</Text>
            <Text style={styles.region_name} adjustsFontSizeToFit>  {this.state.region_name}</Text>
        </View>
        
    
    <View style={styles.profile_info}>
        <List.Item title="Email"  left={()=><FontAwesomeIcon  icon={faMailBulk} size={30}/>} titleStyle={styles.list_title_style} description={this.state.email} color={Colors.green}  descriptionStyle={styles.list_desc_style}/>
        <Divider/>
        <List.Item title="Company"  left={()=><FontAwesomeIcon  icon={faBuilding} size={30}/>}  titleStyle={styles.list_title_style}  color={Colors.green} description={this.state.company_name} descriptionStyle={styles.list_desc_style}/>
    </View>          
    
      <View style={{flex: 1}}>
        <View style={{position: 'absolute', left: 0, right: 0, bottom: 0}}>
        <LinearGradient colors={['#80ff72','#7ee8fa']}    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.next_btn}>
        
          <Button
            textStyle={styles.next_txt}
            // style={styles.next_btn}
            style={{ borderWidth:0 }}
            activityIndicatorColor={Colors.muted}
            activeOpacity={100}
            isLoading={this.state.isLoading}
            disabledStyle={{opacity: 1}}            
            
            onPress = {()=>{
                Popup.show({
                    type: 'confirm',
                    title: 'Warning',
                    textBody: 'Do you want to sign out?',                    
                    buttonText: 'Sign Out',
                    confirmText:'Cancel',                                 
                    callback: () => {
                      Popup.hide()
                      AsyncStorage.clear();                      
                      this.props.navigation.reset({
                        index: 0,
                        routes: [{name: 'AuthenticationScreen'}],
                      })
                      
                    },
                    okButtonStyle:styles.confirmButton,
                    okButtonTextStyle: styles.confirmButtonText
                  
                  })
            }}
            >                    
            <FontAwesomeIcon  icon={faSignOut} size={30} color={Colors.light} style={{left:(Layout.width / 100) * 30}}/>
              Logout
          </Button>
          </LinearGradient>
        </View>
      </View>
                    
      </View>
    );
  }
}

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  next_txt:{
    color:Colors.light,    
    fontFamily:'Gotham_bold',
  },
  cover:{
    width: (Layout.width / 100) * 100,
    height: (Layout.height / 100) * 100,
    position:'absolute',
    zIndex:-1,
        
  },  
  absolute:{
    width: (Layout.width / 100) * 100,
    height: (Layout.height / 100) * 40,
    top: (Layout.height / 100) * 40,
    zIndex:-1,
    position:'absolute'
  },  
  
  next_btn:{    
    elevation:2,
    width: (Layout.width / 100) * 90,
    left: (Layout.width / 100) * 5,
    borderWidth:0,
    bottom:20,
    height:(Layout.height / 100) * 5,
    // borderColor: Colors.light_green,
    // backgroundColor: Colors.light_green,    
  },
  profile_info:{
    elevation:5,
    backgroundColor:Colors.light,
    left: (Layout.width / 100) * 5,
    width:(Layout.width / 100) * 90,
    top:(Layout.height / 100) * 30,
    paddingVertical:(Layout.height / 100) * 2,
    paddingHorizontal:(Layout.width / 100) * 2,
    borderRadius:15
  },
  list_title_style:{
    fontFamily:'Gotham_bold',
    fontSize:16
  },
  list_desc_style:{
    fontFamily:'Gotham_light',
    fontSize:19
  },
  full_name:{
      fontFamily:'Gotham_bold',
      fontSize:20,
      color:Colors.header_text,
      alignSelf:'center'
  },
  region_name:{
    fontFamily:'Gotham_bold',    
    fontSize:12,
    color:Colors.header_text,
    alignSelf:'center'
  },
  confirmButton:{
    backgroundColor:'white',
    color:Colors.green,
    borderColor:Colors.green,
    borderWidth:1
  },
  confirmButtonText:{  
    color:Colors.green,    
  },
});
