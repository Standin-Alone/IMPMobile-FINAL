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
export default class ForgotPasswordScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email:'',
      focus_email_txt:false,
      isLoading:false
    };




  }

  handleSendResetPasswordLink = ()=>{
    Keyboard.dismiss();
        let data = {
            email:this.state.email,           
        }
        
        this.setState({isLoading:true,error:false});
        
        // axios post here
    
        NetInfo.fetch().then(async (response)=>{
          if(response.isConnected){
            
            axios.post(ipConfig.ipAddress+'/form_reset_password_link/sending_request',data).then((response)=>{              

              
              if(response.data.success == 'true'){

                Popup.show({
                  type: 'success',              
                  title: 'Message',
                  textBody: response.data['message'],                
                  buttonText:"Okay",
                  okButtonStyle:styles.confirmButton,
                  okButtonTextStyle: styles.confirmButtonText,
                  callback: () => {    
                                 
                    Popup.hide()                 
                                                 
                    this.props.navigation.replace('LoginScreen')    
                  },              
                })
               
         
              }             
              else{
                
                Popup.show({
                  type: 'danger',              
                  title: 'Message',
                  textBody: response.data.message,                
                  buttonText:"Okay",
                  okButtonStyle:styles.confirmButton,
                  okButtonTextStyle: styles.confirmButtonText,
                  callback: () => {    
                                 
                    Popup.hide()                 
                                                                     
                  },              
                })
                
                this.setState({isLoading:false,error:true,error_message:response.data.message})                

              } 

            }).catch((err)=>{
              console.warn(err.response.data.message);

              Popup.show({
                type: 'danger',              
                title: 'Message',
                textBody: err.response.data.message,                
                buttonText:"Okay",
                okButtonStyle:styles.confirmButton,
                okButtonTextStyle: styles.confirmButtonText,
                callback: () => {    
                               
                  Popup.hide()                 
                                                                   
                },              
              })
              this.setState({isLoading:false})
            });
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
            },
          });
        }
      });

  }

  render() {
    const navigation = this.props.navigation;
    return (
      <View style={styles.container}>
        
        <Animatable.Image source={Images.forgot_password_bg} style={styles.logo}  resizeMode={'contain'} animation="fadeInDownBig" delay={500}/>  
        
        <Animatable.View animation="slideInLeft" >
              <Fumi
                label={'Email'}
                iconClass={Entypo}
                iconName={'email'}
                iconColor={Colors.green}
                iconSize={20}
                iconWidth={40}
                inputPadding={16}
                style={[styles.email,
                            {borderColor: this.state.email_txt == true || this.state.email.length != 0  ? Colors.light_green 
                              :  this.state.focus_email_txt == false ? Colors.fade : Colors.light_green 
                                }]}
                onFocus = {()=>this.setState({focus_email_txt:true})}
                onBlur = {()=>this.setState({focus_email_txt:false})}              
                value={this.state.email}    
                onChangeText={(value)=>this.setState({email:value})}
                keyboardType="email-address"
              />
              
          </Animatable.View>
        
     
     
         
      
        <View style={styles.forgot_password_container}>
          <Button
            textStyle={styles.forgot_txt}
            style={styles.forgot_btn}
            activityIndicatorColor={Colors.light}
            activeOpacity={100}
            isLoading={this.state.isLoading}
            disabledStyle={{opacity: 1}}
            onPress ={this.handleSendResetPasswordLink}
            >
              Send Reset Password Link
          </Button>
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
  logo:{
    width:(Layout.width / 100) *  60,
    height:(Layout.height / 100) * 60,
    alignSelf:'center',
    top: (Layout.height / 100) * -10,   
    position:'absolute'    
    },
  forgot_password_container:{
    top: (Layout.height / 100 )* 43
  },
  email: {
    width: (Layout.width / 100) * 90,
    top: (Layout.height / 100) * 40,
    left: (Layout.width / 100) * 5,
    fontFamily:'Gotham_bold',
    borderWidth:1,
    borderRadius:10,
    backgroundColor: '#F7F7F7',
    fontSize: 1,
  },
  forgot_txt:{
    color:Colors.light,    
    fontFamily:'Gotham_bold',
  },  
  forgot_btn:{        
    width: (Layout.width / 100) * 90,
    left: (Layout.width / 100) * 5,
    borderColor: Colors.green,
    backgroundColor: Colors.green,    
  },
  error:{ 
    color: Colors.light,
    backgroundColor:Colors.danger,
    borderRadius:5, 
    width: Layout.width - 40,
    padding:10,
    marginBottom:20,
    top: (Layout.height / 100) * 45,
    left:22
    
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
