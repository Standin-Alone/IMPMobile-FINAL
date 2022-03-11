import React, {Component} from 'react';
import {View,Text, StyleSheet, Keyboard,Image,Pressable} from 'react-native';
import {Fumi} from 'react-native-textinput-effects';
import Colors from '../constants/Colors';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
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
import {Popup} from 'react-native-popup-confirm-toast';
import { FontAwesomeIcon as FAI}  from '@fortawesome/react-native-fontawesome'
import { faEyeSlash,faEye} from '@fortawesome/free-solid-svg-icons'
export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isLoading:false,
        focus_username_txt:false,
        username:'',
        password:'',
        error:false,
        error_message:'',
        show_password:true,
        validation : Yup.object({
          username: Yup.string().required("Please enter username"),
          password: Yup.string().required("Please enter password")      
        })

    };






  }

  handleLogin = (values,navigation,resetForm)=>{

  
        Keyboard.dismiss();
        let data = {
            username:values.username,
            password:values.password
        }
        
        this.setState({isLoading:true,error:false});
        
        // axios post here
    
        NetInfo.fetch().then(async (response)=>{
          if(response.isConnected && response.isInternetReachable){
            
            axios.post(ipConfig.ipAddress+'/sign_in',data).then((response)=>{              
              
              if(response.data['Message'] == 'true'){
                
                
                this.setState({isLoading:false,error:false});
                let get_user_id     = response.data["user_id"];
                let get_email       = response.data["email"];
                let get_supplier_id = response.data["supplier_id"];
                let get_full_name   = response.data["full_name"];
                let get_programs    = response.data["programs"];
                
                let clean_programs:any = [];

                get_programs.map((program)=>{
                  console.warn(program.program_id);
                  clean_programs.push(program.program_id);
                })
                


                let dataToSend = {
                  user_id    : get_user_id,
                  supplier_id: get_supplier_id,
                  full_name  : get_full_name,
                  email      : get_email,
                  programs   : clean_programs,
                };

                this.props.navigation.navigate('OTPScreen',dataToSend)
              }
              // check if account exist
              else if(response.data['Message'] == 'no account'){                
                resetForm();
                this.setState({isLoading:false,error:true,error_message:'Account does not exist'})                
              } 
              // check if account is for approval
              else if(response.data['Message'] == 'Your account status is for approval.'){    
                
                resetForm();
                this.setState({isLoading:false,error:true,error_message:'Your account status is for approval.'})                
              } 
              // check if account is enabled
              else if(response.data['Message'] == 'Disabled'){                
                resetForm();
                this.setState({isLoading:false,error:true,error_message:'Your account is disabled.'})                
              }              
              // check if username and password is correct
              else{
                resetForm();
                this.setState({isLoading:false,error:true,error_message:'Incorrect username or password.'})                

              } 
            }).catch((err)=>{
              console.warn(err);
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
        
        <Image source={Images.imp_bg} style={styles.background_image} resizeMode={'cover'} />  
        <Animatable.Image
          animation="fadeIn"
          delay={1500}
          source={Images.DA_Logo_White}
          style={styles.da_logo}
          resizeMode={'contain'}
        />
        
        <Animatable.View style={styles.login_container} animation={"slideInUp"}>        
        
            <Animatable.View style={styles.title_container} animation="fadeIn" delay={1000} >
                <Text style={styles.title} numberOfLines={2}> Welcome To </Text>
                <Text style={styles.title} numberOfLines={2}> Interventions Management Platform</Text>
            </Animatable.View>              

        
        <Formik
          initialValues = {{username:'',password:''}}
          validationSchema = {this.state.validation}
          onSubmit= {(values,{resetForm })=>this.handleLogin(values,navigation,resetForm)} 
          // validateOnChange={false}           
        >
          {({ values, handleChange, errors, setFieldTouched, touched, isValid, handleSubmit }) =>(

        <View style={{top:(Layout.height / 100) * 5}}>
          
          {/* username textbox */}
          <Animatable.View animation="slideInLeft"   style={{top: (Layout.height / 100) * 5}}>
              <Fumi
              label={'Username'}
              iconClass={FontAwesomeIcon}
              iconName={'user'}
              iconColor={Colors.green}
              iconSize={20}
              
              inputPadding={20}
              style={[styles.username,
                          {borderColor: this.state.focus_username_txt == true || this.state.username.length != 0  ? Colors.light_green 
                              : 
                                  this.state.error == true || (errors.username && touched.username) ? Colors.danger : Colors.light}]}
              onFocus = {()=>this.setState({focus_username_txt:true})}
              onBlur = {()=>this.setState({focus_username_txt:false})}
              onChangeText={handleChange('username')}  
              
              defaultValue={values.username}    
              value={values.username}                                      
              keyboardType="email-address"
              />
              {/* display username error here */}
              {errors.username  && touched.username &&
                    <Text style={styles.warning}><Icon name="exclamation-triangle" size={20}/> {errors.username}</Text> 
                  }
          </Animatable.View>
          
          {/* password textbox */}
          <Animatable.View animation="slideInLeft" delay={500} style={{top: (Layout.height / 100) * 7}} >
              <Fumi
              label={'Password'}
              iconClass={FontAwesomeIcon}
              iconName={'key'}
              iconColor={Colors.green}
              iconSize={20}              
              inputPadding={20}              
              style={[styles.password,{borderColor: this.state.focus_password_txt == true || this.state.password.length != 0  ? Colors.light_green 
                          :                        
                              this.state.error == true  || (errors.password && touched.password) ? Colors.danger : Colors.light}]}
              onFocus = {()=>this.setState({focus_password_txt:true})}
              onBlur = {()=>this.setState({focus_password_txt:false})}
              onChangeText={handleChange('password')}       
              enablesReturnKeyAutomatically
              defaultValue={values.password}  
              value={values.password}                                      
              secureTextEntry={this.state.show_password}              
              />

                <Pressable          
                onPress={  () => {                        
                    this.setState({show_password:this.state.show_password ? false :true })
                }}
                style={styles.show_password}>
                <FAI icon={this.state.show_password ? faEyeSlash :  faEye } size={25} color={Colors.green} style={{left:20}} transform="fa-fade"  />       
              </Pressable>
             
              

              {/* display error password here */}
              {errors.password && touched.password &&
                    <Text style={[styles.warning,{ top: (Layout.height / 100) * -1}]}><Icon name="exclamation-triangle" size={20}/> {errors.password}</Text> 
                }
              {/* display username error here */}
              {this.state.error &&
                    <Text style={styles.error}>{this.state.error_message}</Text> 
                  }
          </Animatable.View>

          <Button
            textStyle={styles.login_txt}
            style={styles.login_btn}
            activityIndicatorColor={'white'}
            isLoading={this.state.isLoading}
            disabledStyle={{opacity: 1}} 
            onPress = {handleSubmit}         
          >
            Login
          </Button>  
          <Animatable.Text style={styles.forgot_password_txt} animation="slideInLeft" onPress={()=>this.props.navigation.navigate('ForgotPasswordScreen')} >Forgot your password?</Animatable.Text>            
        </View>
        )}
        </Formik>   
        </Animatable.View>     
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },  
  background_image:{
    position:'absolute',
    width:(Layout.width / 100) *  100,
    height:(Layout.height / 100) * 100
  },
  logo:{
    width:(Layout.width / 100) *  70,
    height:(Layout.height / 100) * 70,
    alignSelf:'center',
    top: (Layout.height / 100) * -10,   
    position:'absolute'    
    },
  da_logo:{
    width:(Layout.width / 100) *  40,
    height:(Layout.height / 100) * 40,
    alignSelf:'center',
    top: (Layout.height / 100) * -5
    },
  title:{
    top: (Layout.height / 100) * 10,   
    color:Colors.green,         
    fontFamily:'Gotham_bold',   
    
    fontSize:18
  },
  login_container:{
    position:'absolute',
    backgroundColor:Colors.light,
    width:(Layout.width / 100) *  100,
    marginTop:(Layout.height / 100) * 30,
    height:(Layout.height / 100) * 100,
    borderRadius:45,
    shadowColor: Colors.dark,
    shadowRadius: 100,
    shadowOpacity: 1,    
    borderColor:Colors.fade,
    borderWidth:1
    
  },
  title_container:{        
    
    left:(Layout.width / 100) *  3,
    bottom: (Layout.height / 100) *5
    
  },
  username: {
    width: (Layout.width / 100) * 90,    
    zIndex:1,
    left: (Layout.width / 100) * 5,
    fontFamily:'Gotham_bold',
    borderWidth:1,
    borderRadius:10,
    backgroundColor: '#F7F7F7',
    fontSize: 1,
  },
  password: {
    width: (Layout.width / 100) * 90,    
    left: (Layout.width / 100) * 5,
    fontFamily:'Gotham_bold',
    borderWidth:1,
    borderRadius:10,
    backgroundColor: '#F7F7F7',
    fontSize: 20,
  },
  login_txt:{
    color:Colors.light,    
    fontFamily:'Gotham_bold',
  },  
  login_btn:{    
    top: (Layout.height / 100) * 5,
    width: (Layout.width / 100) * 90,
    left: (Layout.width / 100) * 5,
    borderColor: Colors.green,
    backgroundColor: Colors.green,    
  },
  error:{ 
    color: Colors.light,
    backgroundColor:Colors.danger,
    borderRadius:5, 
    width: (Layout.width / 100) * 90,
    padding:10,
    marginBottom:20,
    bottom: (Layout.height / 100) * 2,
    left:22    
  },
  warning:{ 
    color: Colors.danger,
    borderRadius:5, 
    width: Layout.width - 40,
    marginBottom:20,
    top: (Layout.height / 100) * 2,
    
    left:35
  },
  show_password:{
    width: (Layout.width / 100) * 90,
    bottom: (Layout.height / 100) * 5,
    left: (Layout.width / 100) * 80,
  },
  forgot_password_txt:{
    fontFamily:"Gotham_light",
    fontSize:16,
    fontWeight:'bold',
    color:Colors.blue_green,
    top:(Layout.height/100) * 10,
    left:(Layout.width / 100) * 5,
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
