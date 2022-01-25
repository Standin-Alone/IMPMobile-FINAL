import React, {Component} from 'react';
import {View,Text, StyleSheet,FlatList,Image} from 'react-native';
import Colors from '../../constants/Colors';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Layout from '../../constants/Layout';
import * as Animatable from 'react-native-animatable';
import NetInfo from "@react-native-community/netinfo";
import axios from 'axios';
import * as ipConfig from '../../ipconfig';
import * as Yup from 'yup';
import { Formik } from 'formik';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Images from '../../constants/Images';
import Button from 'apsl-react-native-button';
import Moment from 'react-moment';
import NumberFormat from 'react-number-format';

export default class ReviewTransactionScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {          
        params:this.props.route.params,        
    };
    console.warn(this.props.route.params)
  }

 


  render() {
 
    return (
      <View  style={styles.container}>        
         <LinearGradient colors={['#A9F99E', Colors.green, Colors.blue_green]} style={styles.cover}>
          <FontAwesomeIcon name="arrow-left" color={Colors.light} style={styles.go_back} size={30} onPress={this.handleGoBack}/>          
          
          {/* Farmer Image*/}
          <Animatable.Image animation="fadeInDownBig" source={Images.farmer} style={styles.logo} />            
      </LinearGradient>
              
        {/* Reference Number */}      
        <Animatable.Text animation="slideInLeft" numberOfLines={2} style={styles.reference_no}>#{this.state.params.voucher_info.reference_no}</Animatable.Text>        
      {/* Full Name */}      
      <Animatable.Text animation="slideInLeft" numberOfLines={2} style={styles.full_name}>{this.state.params.voucher_info.first_name} {this.state.params.voucher_info.last_name}</Animatable.Text>        
      {/* Location */}      
      <Animatable.Text animation="slideInLeft" delay={300}  numberOfLines={10}  style={styles.location}>
          <Ionicons name="location" color={Colors.blue_green}/>
                Barangay {this.state.params.voucher_info.Barangay}, {this.state.params.voucher_info.Municipality}, {this.state.params.voucher_info.Province}, {this.state.params.voucher_info.Region}</Animatable.Text>


      <Animatable.Text animation="slideInLeft" numberOfLines={2} style={styles.history_title}><FontAwesomeIcon name="info-circle" color={Colors.blue_green} size={16}/> Attachments</Animatable.Text>        


      <Animatable.Text animation="slideInLeft" numberOfLines={2} style={styles.cart}><FontAwesomeIcon name="info-circle" color={Colors.blue_green} size={16}/>My Cart</Animatable.Text>        

      

          
      <View style={{flex: 1}}>

        
        <View style={{position: 'absolute', left: 0, right: 0, bottom: 0}}>
        <Text style={styles.total_amount_title}>
            Total Amount:
        </Text>
        <Text style={styles.total_amount}>
            PHP {this.state.params.total_amount}
        </Text>
          <Button
            textStyle={styles.next_txt}
            style={styles.next_btn}
            activityIndicatorColor={Colors.light}
            activeOpacity={100}
            isLoading={this.state.isLoading}
            disabledStyle={{opacity: 1}}            
            >
              Submit
          </Button>
        </View>
      </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  cover:{
    height:150,
    borderBottomLeftRadius:35,
    borderBottomRightRadius:35
  },
  logo:{    
    width:150,
    height:150,
    top:(Layout.height / 100) * 8,
    alignSelf:'center',    
  },
  reference_no:{        
    alignSelf:'center',    
    fontFamily:'Gotham_bold',
    fontSize:16,
    top:(Layout.height / 100) * 8,
    color:Colors.blue_green
  },
  full_name:{
    alignSelf:'center',    
    fontFamily:'Gotham_bold',
    fontSize:16,
    top:(Layout.height / 100) * 10,
    color:Colors.light_green
  },
  location:{    
    alignSelf:'center',    
    justifyContent:'center',
    fontFamily:'Gotham_bold',
    fontSize:8,    
    top:(Layout.height / 100) * 12,
  },
  history_title:{    
    fontFamily:'Gotham_bold',
    fontSize:16,    
    left: (Layout.width / 100) * 5,
    top:(Layout.height / 100) * 20,
    color:Colors.dark
  },
  cart:{
    fontFamily:'Gotham_bold',
    fontSize:16,    
    left: (Layout.width / 100) * 5,
    top:(Layout.height / 100) * 40,
    color:Colors.dark
  },
  next_btn:{        
    width: (Layout.width / 100) * 40,
    left: (Layout.width / 100) * 55,
    borderColor: Colors.green,
    backgroundColor: Colors.green,    
  },
  next_txt:{
    color:Colors.light,    
    fontFamily:'Gotham_bold',
  },
  total_amount_title:{
    top:(Layout.height / 100) * 2,
    fontFamily:'Gotham_bold',
    fontSize:12,    
  },
  total_amount:{
    top:(Layout.height / 100) * 2,
    fontFamily:'Gotham_bold',
    color:Colors.blue_green,
    fontSize:18,    
  }
});
