import React, {Component} from 'react';
import {View,Text, StyleSheet, Keyboard,Image} from 'react-native';
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
        validation : Yup.object({
          username: Yup.string().required("Please enter username").email("Username must be valid email."),
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
          if(response.isConnected){
            
            axios.post(ipConfig.ipAddress+'/sign_in',data).then((response)=>{              
              console.warn(response.data )            
              if(response.data['Message'] == 'true'){
                
                
                this.setState({isLoading:false,error:false});
                let get_user_id     = response.data["user_id"];
                let get_email       = response.data["email"];
                let get_supplier_id = response.data["supplier_id"];
                let get_full_name   = response.data["full_name"];


                let dataToSend = {
                  user_id    : get_user_id,
                  supplier_id: get_supplier_id,
                  full_name  : get_full_name,
                  email      : get_email
                };

                this.props.navigation.replace('OTPScreen',dataToSend)
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
              console.warn(err.response);
              this.setState({isLoading:false})
            });
        }else{
          alert('No internet connection');
        }
      });
     
  }

  render() {
    const navigation = this.props.navigation;
    return (
      <View style={styles.container}>
        
        
        <Animatable.Image source={Images.login_bg} style={styles.logo}  resizeMode={'contain'} animation="fadeInDownBig" delay={500}/>  
        
            <Animatable.View style={styles.title_container} animation="fadeInDownBig" >
                <Text style={styles.title} numberOfLines={2}> Welcome To </Text>
                <Text style={styles.title} numberOfLines={2}> Intervention Management Platform</Text>           
            </Animatable.View>              
  
        <Formik
          initialValues = {{username:'',password:''}}
          validationSchema = {this.state.validation}
          onSubmit= {(values,{resetForm })=>this.handleLogin(values,navigation,resetForm)} 
          // validateOnChange={false}           
        >
          {({ values, handleChange, errors, setFieldTouched, touched, isValid, handleSubmit }) =>(

        <View style={{top:(Layout.height / 100) * 10}}>
          {/* username textbox */}
          <Animatable.View animation="slideInLeft" >
              <Fumi
              label={'Email'}
              iconClass={FontAwesomeIcon}
              iconName={'user'}
              iconColor={Colors.green}
              iconSize={20}
              iconWidth={40}
              inputPadding={16}
              style={[styles.username,
                          {borderColor: this.state.focus_username_txt == true || this.state.username.length != 0  ? Colors.light_green 
                              : 
                                  this.state.error == true || (errors.username && touched.password) ? Colors.danger : Colors.light}]}
              onFocus = {()=>this.setState({focus_username_txt:true})}
              onBlur = {()=>this.setState({focus_username_txt:false})}
              onChangeText={handleChange('username')}  
              value={values.username}    
              keyboardType="email-address"
              />
              {/* display username error here */}
              {errors.username  && touched.username ?
                    <Text style={styles.warning}><Icon name="exclamation-triangle" size={20}/> {errors.username}</Text> : null
                  }
          </Animatable.View>
          
          {/* username textbox */}
          <Animatable.View animation="slideInLeft" delay={500} >
              <Fumi
              label={'Password'}
              iconClass={FontAwesomeIcon}
              iconName={'key'}
              iconColor={Colors.green}
              iconSize={20}
              iconWidth={40}
              inputPadding={16}
              style={[styles.password,{borderColor: this.state.focus_password_txt == true || this.state.password.length != 0  ? Colors.light_green 
                          :                        
                              this.state.error == true  || (errors.password && touched.password) ? Colors.danger : Colors.light}]}
              onFocus = {()=>this.setState({focus_password_txt:true})}
              onBlur = {()=>this.setState({focus_password_txt:false})}
              onChangeText={handleChange('password')}       
              value={values.password}                                        
              secureTextEntry={true}
              />
              {/* display error password here */}
              {errors.password && touched.password ?
                    <Text style={[styles.warning,{ top: (Layout.height / 100) * 43}]}><Icon name="exclamation-triangle" size={20}/> {errors.password}</Text> :null
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
    backgroundColor: 'white',
  },  
  logo:{
    width:(Layout.width / 100) *  70,
    height:(Layout.height / 100) * 70,
    alignSelf:'center',
    top: (Layout.height / 100) * -10,   
    position:'absolute'    
    },
  title:{
    top: (Layout.height / 100) * 45,   
    color:Colors.dark,         
    fontFamily:'Gotham_bold',
    
    fontSize:20,    
  },
  title_container:{        
    alignContent:'flex-start',
        left:(Layout.width / 100) *  3,
        alignSelf:'flex-start'
  },
  username: {
    width: (Layout.width / 100) * 90,
    top: (Layout.height / 100) * 40,
    left: (Layout.width / 100) * 5,
    fontFamily:'Gotham_bold',
    borderWidth:1,
    borderRadius:10,
    backgroundColor: '#F7F7F7',
    fontSize: 1,
  },
  password: {
    width: (Layout.width / 100) * 90,
    top: (Layout.height / 100) * 42,
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
    top: (Layout.height / 100) * 45,
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
  warning:{ 
    color: Colors.danger,
    borderRadius:5, 
    width: Layout.width - 40,
    marginBottom:20,
    top: (Layout.height / 100) * 42,
    left:35
  },
});
