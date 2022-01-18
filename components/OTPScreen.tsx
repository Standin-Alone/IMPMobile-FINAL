import React, {Component} from 'react';
import {View,Text, StyleSheet} from 'react-native';
import {Fumi} from 'react-native-textinput-effects';
import Colors from '../constants/Colors';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Layout from '../constants/Layout';
import Button from 'apsl-react-native-button';
import * as Animatable from 'react-native-animatable';
import NetInfo from "@react-native-community/netinfo";
import axios from 'axios';
import * as ipConfig from '../ipconfig';
import * as Yup from 'yup';
import { Formik } from 'formik';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Popup } from 'react-native-popup-confirm-toast';
export default class OTPScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isLoading:false,
        focus_otp_txt:false,
        otp:'',        
        params:this.props.route.params,
        error:false,
        error_message:'',
        isResendLoading:false,
        validation : Yup.object({
          otp: Yup.number().typeError('OTP must be a number.').required("Please enter your OTP"),
          
        })

    };






  }


  // handle verify otp
  handleVerifyOTP = (values,resetForm)=>{

    console.warn(this.state.params.user_id);
    let data = {
      user_id:this.state.params.user_id,
      code:values.otp
      
  }
        
      this.setState({isLoading:true,error:false})
      // axios post here
      console.warn(data);
      NetInfo.fetch().then(async (response)=>{
        
        if(response.isConnected){
          axios.post(ipConfig.ipAddress+'/validate-otp',data).then( async (response)=>{
            console.warn(response);
            this.setState({error:false})
            if (response.data == true) {      
              AsyncStorage.setItem("user_id", this.state.params.user_id.toLocaleString());
              AsyncStorage.setItem("supplier_id", this.state.params.supplier_id.toLocaleString());
              AsyncStorage.setItem("full_name", this.state.params.full_name);
                 
              this.props.navigation.replace("Root");                                            
                       
              this.setState({isLoading:false});
            } else if(response.data == 'expired') {
              this.setState({isLoading:false,error:true,error_message:'Your otp has been expired. Please resend new OTP.'})
              // resetForm();
            }else {
              this.setState({isLoading:false,error:true,error_message:'Incorrect OTP.'})
              // resetForm();
            }



          }).catch((err)=>{
            console.warn(err.response.data);
            this.setState({isLoading:false,error:true})
          });
      }else{
        alert('No internet connection');
      }
    });
     
  }


  // handle resend otp
  handleResendOTP = async ()=>{
    const email   = await AsyncStorage.getItem("email");
    const user_id   = await AsyncStorage.getItem("user_id");

    let data = {
      user_id:this.state.params.user_id,      
      email:this.state.params.email,      
    } 
          
      this.setState({isResendLoading:true,error:false})
      // axios post here

      NetInfo.fetch().then(async (response)=>{
        if(response.isConnected){
          axios.post(ipConfig.ipAddress+'/resend-otp',data).then((response)=>{
            console.warn(response.data);                  
            if(response.data['Message'] == 'true'){
              alert('Successfully resend new OTP to your email.');
                
              AsyncStorage.setItem(
                "otp_code",
                response.data["OTP"].toLocaleString()
              );
              this.setState({isResendLoading:false,error:false})
            }else{
             
              this.setState({isResendLoading:false,error:true})
            } 
          }).catch((err)=>{
            console.warn(err.response);
           
            this.setState({isResendLoading:false,error:false})
          });
      }else{
        alert('No internet connection');
        this.setState({isResendLoading:false})
      }
    });
  }


  render() {
    const navigation = this.props.navigation;
    return (
      <View style={styles.container}>
        
        
        
        <Animatable.View style={styles.title_container} animation="fadeInDownBig">
            <Text style={styles.otp}>One Time Pin</Text>
              <Text style={styles.otp_desc}>
                Your one time pin has been sent to your email {'\n'}
                <Text style={[styles.otp_desc,{color:Colors.blue_green}]}>  {this.state.params.email} </Text>
            </Text>
        </Animatable.View>              
        <Formik
          initialValues = {{otp:''}}
          validationSchema = {this.state.validation}
          onSubmit= {(values,{resetForm})=>this.handleVerifyOTP(values,resetForm)} 
          // validateOnChange={false}           
        >
          {({ values, handleChange, errors, setFieldTouched, touched, isValid, handleSubmit }) =>(

        <View>
          {/* username textbox */}
          <Animatable.View animation="slideInLeft" >
              <Fumi
              label={'OTP'}
              iconClass={FontAwesomeIcon}
              iconName={'key'}
              iconColor={Colors.green}
              iconSize={20}
              iconWidth={40}
              inputPadding={16}
              style={[styles.otp_input_field,
                          {borderColor: this.state.focus_otp_txt == true || this.state.otp.length != 0  ? Colors.light_green 
                              : 
                                  this.state.error == true || (errors.otp && touched.otp) ? Colors.danger : Colors.light}]}
              onFocus = {()=>this.setState({focus_otp_txt:true})}
              onBlur = {()=>this.setState({focus_otp_txt:false})}
              onChangeText={handleChange('otp')} 
              value={values.otp}     
              keyboardType="number-pad"
              />
              {/* display otp error here */}
              {errors.otp  && touched.otp ?
                    <Text style={styles.warning}><Icon name="exclamation-triangle" size={20}/> {errors.otp}</Text> : null
                  }
              {this.state.error && 
                    <Text style={styles.error}>{this.state.error_message}</Text>
                  }
          </Animatable.View>
                   

          <Button
            textStyle={styles.otp_txt}
            style={styles.verify_otp_btn}
            activityIndicatorColor={'white'}
            isLoading={this.state.isLoading}
            disabledStyle={{opacity: 1}} 
            onPress = {handleSubmit}         
          >
            Verify OTP
          </Button>      

          <Button
            textStyle={styles.resend_otp_txt}
            style={styles.resend_otp_btn}
            activityIndicatorColor={Colors.dark_blue}
            isLoading={this.state.isResendLoading}
          
            disabledStyle={{opacity: 1}} 
            onPress = {this.handleResendOTP}     
                   
          >
           Resend OTP
          </Button>      
        </View>
        )}
        </Formik>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },  
  title:{
    top: (Layout.height / 100) * 20,   
    color:Colors.dark,     
    alignSelf:'center',
    fontFamily:'Gotham_bold',
    
    fontSize:20,    
  },
  title_container:{        
    alignContent:'center',
    alignSelf:'center'
  },
  otp_input_field: {
    width: (Layout.width / 100) * 90,
    top: (Layout.height / 100) * 40,
    left: (Layout.width / 100) * 5,
    fontFamily:'Gotham_bold',
    borderWidth:1,
    borderRadius:10,
    backgroundColor: '#F7F7F7',
    fontSize: 1,
  }, 
  otp_txt:{
    color:Colors.light,    
    fontFamily:'Gotham_bold',
  },
  
  verify_otp_btn:{    
    top: (Layout.height / 100) * 45,
    width: (Layout.width / 100) * 90,
    left: (Layout.width / 100) * 5,
    borderColor: Colors.green,
    backgroundColor: Colors.green,    
  },
  resend_otp_txt:{
    color:Colors.dark_blue,    
    fontFamily:'Gotham_bold',
  },
  
  resend_otp_btn:{    
    top: (Layout.height / 100) * 45,
    width: (Layout.width / 100) * 90,
    left: (Layout.width / 100) * 5,
    borderColor: Colors.dark_blue,
    backgroundColor: Colors.light,    
  },
  error:{ 
    color: Colors.light,
    backgroundColor:Colors.danger,
    borderRadius:5, 
    width: Layout.width - 40,
    padding:10,
    marginBottom:10,
    top: (Layout.height / 100) * 42,
    left:22
    
  },
  warning:{ 
    color: Colors.danger,
    borderRadius:5, 
    width: Layout.width - 40,
    marginBottom:20,
    top: (Layout.height / 100) * 42,
    
  },
  otp: { textAlign: "center", fontSize: 25,color:Colors.dark ,top: (Layout.height / 100) * 35,fontFamily:'Gotham_bold'},
  otp_desc: { textAlign: "center", fontSize: 18,marginBottom:20,color:Colors.dark,top: (Layout.height / 100) * 35},
});
