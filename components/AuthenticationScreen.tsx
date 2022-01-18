import React,{useEffect,useState} from 'react';
import { StyleSheet, TouchableOpacity,Image,View} from 'react-native';



import Images from '../constants/Images';
import Layout from '../constants/Layout';
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from '../constants/Colors';
import * as Animatable from 'react-native-animatable';

export default class AuthenticationScreen extends React.Component {
    constructor(props){
        super(props);
        this.state={

        }


    }

componentDidMount(){
    let self = this;
    setTimeout(()=>{
        
     NetInfo.fetch().then(async (response)=>{
          if(response.isConnected){
              
            let user_id = await AsyncStorage.getItem('user_id');

            if(user_id){
              self.props.navigation.replace('Root');
            }else{
                self.props.navigation.replace('LoginScreen');
            }
            
          }else{
            alert('No Internet Connection.Pleae check your internet connection.')
            
          }
      });
    },3000);

}
 

  render(){



  
  return (
    <Animatable.View style={styles.container} animation= 'fadeInDownBig' duration={1000}>
        <Image source={Images.DA_Logo} style={styles.logo}  resizeMode={'contain'}/>        
    </Animatable.View>
  );

}

    
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor:Colors.light
  },
  title: {
    marginVertical: (Layout.height / 100) * -20,
    fontSize: 25,    
    color:'black',
    fontWeight: 'bold',
    textAlign:'center'
  },
  logo:{
      width:(Layout.width / 100) *  80,
      height:(Layout.height / 100) * 80,
      bottom:0,
      top:0,
        },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});



