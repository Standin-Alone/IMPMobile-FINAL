import  React,{Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
  } from 'react-native';
import Colors from '../constants/Colors';
import BarcodeMask from 'react-native-barcode-mask';
import NetInfo from "@react-native-community/netinfo";
import axios from 'axios';
import * as ipConfig from '../ipconfig';
import {  Popup} from 'react-native-popup-confirm-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RNCamera } from 'react-native-camera';
import { Alert } from 'react-native';
import moment from 'moment';
export default class QRCodeScreen extends Component{
    constructor(props) {        
        super(props);

        this.state = {
            scanned:false,
            isLoading:false,
            hasPermission:false,
            isBarcodeRead: true,            
        }              
       
    }
    


    handleBarCodeRead = async (scanResult)=>{
      const get_user_id = await AsyncStorage.getItem("user_id");
      const get_supplier_id = await AsyncStorage.getItem("supplier_id");
      const get_full_name = await AsyncStorage.getItem("full_name");
      
      
      let form = { reference_num: scanResult.data,supplier_id:get_supplier_id };
      



      if(this.state.isBarcodeRead){   
      // check internet connection
      NetInfo.fetch().then((response: any) => {
        if (response.isConnected) {
          this.setState({isBarcodeRead:false});
          axios
            .post(
              ipConfig.ipAddress + "/get_voucher_info",
              form
            )
            .then( (response) => {
                console.warn(response.data)
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
                        
                        Popup.hide()            
                        this.props.navigation.replace("FarmerProfileScreen",{data:response.data["data"],
                          program_items:response.data["program_items"],
                          history:response.data["history"],
                          supplier_id:get_supplier_id,
                          full_name:get_full_name,
                          user_id:get_user_id,                          
                        
                        });
                        this.setState({isBarcodeRead:true});              
                                                
                      },              
                    })
                    
                  }
                  else{
                    
                    
                    Popup.show({
                      type: 'danger',              
                      title: 'Message',
                      textBody: "This voucher is fully claimed",                
                      buttonText:'Ok',
                      okButtonStyle:styles.confirmButton,
                      okButtonTextStyle: styles.confirmButtonText,
                      callback: () => {    
                        this.setState({isBarcodeRead:true});              
                        Popup.hide()                                    
                      },              
                    })
               
                 
                  }
                } else {
                  

                  
                  Popup.show({
                    type: 'danger',              
                    title: 'Message',
                    textBody: "Not Enough Balance.",                
                    buttonText:'Ok',
                    okButtonStyle:styles.confirmButton,
                    okButtonTextStyle: styles.confirmButtonText,
                    callback: () => {    
                      this.setState({isBarcodeRead:true});              
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
                    this.setState({isBarcodeRead:true});              
                    Popup.hide()                                    
                  },              
                })

              }
              else if(response.data["Message"] == "on-going process") {
                
                  
                Popup.show({
                  type: 'danger',              
                  title: 'Message',
                  textBody: "The voucher process is currently on-going.",                
                  buttonText:'Ok',
                  okButtonStyle:styles.confirmButton,
                  okButtonTextStyle: styles.confirmButtonText,
                  callback: () => {    
                    this.setState({isBarcodeRead:true});              
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
                    this.setState({isBarcodeRead:true});              
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
                    this.setState({isBarcodeRead:true});              
                    Popup.hide()                                    
                  },              
                })

                
              }
            })
            .catch((error) => {
              console.warn(error.response);                           
              Popup.show({
                type: 'danger',              
                title: 'Message',
                textBody: "Something went wrong!",                
                buttonText:'Ok',
                okButtonStyle:styles.confirmButton,
                okButtonTextStyle: styles.confirmButtonText,
                callback: () => {    
                  this.setState({isBarcodeRead:true});              
                  Popup.hide()                                    
                },              
              }) 
            });
        } else {
          alert("No Internet Connection.");
   
        }
      });
    }

    }


    render(){
        return (
            <View style={styles.container}>        
        
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

  
  
  });