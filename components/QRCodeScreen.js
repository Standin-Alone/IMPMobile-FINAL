import  React,{Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    BackHandler
  } from 'react-native';
import Colors from '../constants/Colors';
import BarcodeMask from 'react-native-barcode-mask';
import NetInfo from "@react-native-community/netinfo";
import axios from 'axios';
import * as ipConfig from '../ipconfig';
import {  Popup} from 'react-native-popup-confirm-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RNCamera } from 'react-native-camera';
import Spinner from 'react-native-spinkit';
import DeviceInfo from 'react-native-device-info';
import BackgroundTimer from 'react-native-background-timer';
export default class QRCodeScreen extends Component{
    constructor(props) {        
        super(props);

        this.state = {
            scanned:false,
            isLoading:false,
            hasPermission:false,
            isBarcodeRead: true,
            show_spinner:false            
        }              
       
    }

 

    componentDidMount(){

      this.props.navigation.addListener('focus',()=>{
        this.setState({isBarcodeRead:true,show_spinner:false});       
      })
    }
    handleBarCodeRead = async (scanResult)=>{
      const get_user_id = await AsyncStorage.getItem("user_id");
      const get_supplier_id = await AsyncStorage.getItem("supplier_id");
      const get_full_name = await AsyncStorage.getItem("full_name");
      let get_programs = await AsyncStorage.getItem("programs");

      let clean_programs = JSON.parse(get_programs);
      // payload
      let form = { 
            reference_num: scanResult.data,
            supplier_id:get_supplier_id,
            programs:clean_programs
            };
      

            

      if(this.state.isBarcodeRead){   

        this.setState({show_spinner:true});
      // check internet connection
      NetInfo.fetch().then((response) => {
        if (response.isConnected && response.isInternetReachable) {
          this.setState({isBarcodeRead:false});
        
          // check imp mobile application version
          axios.get(ipConfig.ipAddress + '/check_utility/' + DeviceInfo.getVersion()).then(async response => {
            // close app if  maintenenace
            if (response.data['maintenance'] == '1') {
              this.setState({isBarcodeRead:true,show_spinner:false});              
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
            // close app if apk has new updates
            else if( response.data['active'] == '0') {
              this.setState({isBarcodeRead:true,show_spinner:false});              
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
            }else{
              
            // START SCANNING AXIOS HERE
            axios
              .post(
                ipConfig.ipAddress + "/get_voucher_info",
                form
              )
              .then( (response) => {
                    
                if (response.data["Message"] == "true") {

                
                  // navigation.navigate('ClaimVoucher',response.data[0]['data']);
                  // setScanned(false);
                  // setIsShow(false);
                  // Test Available Balance
                  
                  if (response.data["data"][0].Available_Balance != 0.00) {                
                    if(response.data["data"][0].voucher_status != 'FULLY CLAIMED' ){
                      
                      
                      Popup.show({
                        type: 'success',              
                        title: 'Success!',
                        textBody: "Successfully scanned the QR Code.",                
                        buttonText:'Ok',
                        okButtonStyle:styles.confirmButton,
                        okButtonTextStyle: styles.confirmButtonText,
                        callback: () => {     
                     
                        // start timer when scanned                        

                          Popup.hide()            
                          this.props.navigation.navigate("FarmerProfileScreen",{data:response.data["data"],
                            program_items:response.data["program_items"],
                            fertilizer_categories:response.data["fertilizer_categories"],
                            fertilizer_sub_categories:response.data["fertilizer_sub_categories"],
                            unit_types:response.data["unit_types"],
                            history:response.data["history"],
                            supplier_id:get_supplier_id,
                            full_name:get_full_name,
                            user_id:get_user_id,                          
                            time: BackgroundTimer.setTimeout((res) => { 
                              Popup.show({
                                type: 'danger',              
                                title: 'Message',
                                textBody: "Voucher processing has ended.",                
                                buttonText:'Ok',
                                okButtonStyle:styles.confirmButton,
                                okButtonTextStyle: styles.confirmButtonText,
                                callback: () => {    
                                  Popup.hide()       
                                  BackgroundTimer.clearTimeout(this)                             
                                  this.props.navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'Root' }]
                                  });                                
                                },              
                              })                                        
                            }, 
                            response.data["time_limit"]
                          )
                          });
                          
                                                  
                        },              
                      })
                      
                    }
                    else{
                      
                      
                      Popup.show({
                        type: 'danger',              
                        title: 'Message',
                        textBody: "This voucher is already fully claimed",                
                        buttonText:'Ok',
                        okButtonStyle:styles.confirmButton,
                        okButtonTextStyle: styles.confirmButtonText,
                        callback: () => {    
                          this.setState({isBarcodeRead:true,show_spinner:false});              
                          Popup.hide()                                    
                        },              
                      })
                
                  
                    }
                  } else {
                    

                    
                    Popup.show({
                      type: 'danger',              
                      title: 'Message',
                      textBody: "This voucher is already fully claimed",                
                      buttonText:'Ok',
                      okButtonStyle:styles.confirmButton,
                      okButtonTextStyle: styles.confirmButtonText,
                      callback: () => {    
                        this.setState({isBarcodeRead:true,show_spinner:false});              
                        Popup.hide()                                    
                      },              
                    })
                
                  }
                }else if(response.data["Message"] == "Not Yet Open") {
                  Popup.show({
                    type: 'danger',              
                    title: 'Message',
                    textBody: "The time of voucher transaction is from 6:00 am to 6:00 pm only.",                
                    buttonText:'Ok',
                    okButtonStyle:styles.confirmButton,
                    okButtonTextStyle: styles.confirmButtonText,
                    callback: () => {    
                      this.setState({isBarcodeRead:true,show_spinner:false});              
                      Popup.hide()                                    
                    },              
                  })

                }
                else if(response.data["Message"] == "on-going process") {
                  
                  this.setState({show_spinner:false});              
                  Popup.show({
                    type: 'danger',              
                    title: 'Message',
                    textBody: "The voucher process is currently on-going. You have "+response.data["Minutes"]+" "+(response.data["Minutes"] == 1 ? 'minute' : 'minutes')+"  left before you can scan.",                
                    buttonText:'Ok',
                    okButtonStyle:styles.confirmButton,
                    okButtonTextStyle: styles.confirmButtonText,
                    callback: () => {    
                      this.setState({isBarcodeRead:true,show_spinner:false});              
                      Popup.hide()                                    
                    },              
                  })
                                
                }   
                else if(response.data["Message"] == "already scanned") {
                  
                    
                  Popup.show({
                    type: 'danger',              
                    title: 'Message',
                    textBody: "This voucher is already scanned by the others.",                
                    buttonText:'Ok',
                    okButtonStyle:styles.confirmButton,
                    okButtonTextStyle: styles.confirmButtonText,
                    callback: () => {    
                      this.setState({isBarcodeRead:true,show_spinner:false});              
                      Popup.hide()                                    
                    },              
                  })
                                
                }else if(response.data["Message"] == "invalid program.") {
                  
                    
                  Popup.show({
                    type: 'danger',              
                    title: 'Message',
                    textBody: "You are not registered in this program.",                
                    buttonText:'Ok',
                    okButtonStyle:styles.confirmButton,
                    okButtonTextStyle: styles.confirmButtonText,
                    callback: () => {    
                      this.setState({isBarcodeRead:true,show_spinner:false});              
                      Popup.hide()                                    
                    },              
                  })
                                
                }             
                else {
                    
                  Popup.show({
                    type: 'danger',              
                    title: 'Message',
                    textBody: "Reference Number doesn't exist.",                
                    buttonText:'Ok',
                    okButtonStyle:styles.confirmButton,
                    okButtonTextStyle: styles.confirmButtonText,
                    callback: () => {    
                      this.setState({isBarcodeRead:true,show_spinner:false});              
                      Popup.hide()                                    
                    },              
                  })

                  
                }
              })
              .catch((error) => {
                console.warn(error.response.data); 
                Popup.show({
                  type: 'danger',              
                  title: 'Message',
                  textBody: "Something went wrong!",                
                  buttonText:'Ok',
                  okButtonStyle:styles.confirmButton,
                  okButtonTextStyle: styles.confirmButtonText,
                  callback: () => {    
                    console.warn(error.response.data);                           
                    this.setState({isBarcodeRead:true,show_spinner:false});              
                    Popup.hide()                                    
                  },              
                }) 
              });
          }

        }).catch(err => console.warn(err.response));
        } else {
          Popup.show({
            type: 'danger',
            title: 'Message',
            textBody: 'No Internet Connection.Please check your internet connection.',
            buttonText: 'Retry',
            okButtonStyle: styles.confirmButton,
            okButtonTextStyle: styles.confirmButtonText,
            callback: () => {  
              this.setState({isBarcodeRead:true,show_spinner:false});              
              Popup.hide();
                          
              
             
            },
          });
          
          
   
        }
      });
    }

    }


    render(){
        return (
            <View style={styles.container}>        

            
          {this.state.show_spinner && (
            <View style={styles.loading}>
              <Spinner
                isVisible={this.state.show_spinner}
                size={100}
                type={'Wave'}
                color={Colors.light_green}
              />
            </View>
          )}

          
            {this.state.scanned == false ? (        
            <RNCamera
            onBarCodeRead = {this.handleBarCodeRead.bind(this)}
            style={[StyleSheet.absoluteFillObject,styles.container]}
            permissionDialogTitle={'Permission to use camera'}
            permissionDialogMessage={'We need your permission to use your camera phone'}
            >        
  
            
              <BarcodeMask edgeColor={Colors.green} showAnimatedLine={false}/>                
            
            </RNCamera>
  
            ) : (
            <Text> No Access camera</Text>
            )}
        </View>

        )
    }


}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: 20,
      backgroundColor:Colors.light
      
    },
    formBody:{
      flex: 1,
      backgroundColor:Colors.light
    },
    qrForm:{
      flex: 1,
      backgroundColor:Colors.light,
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
    loading: {
      zIndex:1,
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    }

  
  
  });