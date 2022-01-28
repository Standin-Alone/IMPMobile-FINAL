import React, {Component} from 'react';
import {View,Text, StyleSheet,FlatList,Image} from 'react-native';
import Colors from '../constants/Colors';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
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
import { Card } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Images from '../constants/Images';
import Button from 'apsl-react-native-button';
import Moment from 'react-moment';
import NumberFormat from 'react-number-format';
import Spinner from 'react-native-spinkit';
export default class SummaryScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {          
        
    };

  }

  componentDidUpdate() {
      
  }

  render() {
 
    return (
      <View  style={styles.container}>        

        <View style={styles.transaction_card}>
                <View style={{flexDirection:"row"}}>
                    <View style={{flex:1}}>
                    <Text style={[styles.remaining_balance_label,{justifyContent:'flex-start'}]}>Remaining Balance:</Text>
                    </View>
                    <View style={{flex:1}}>
                    <Text style={[styles.remaining_balance_value,{justifyContent:'flex-end'}]}> PHP 2,000.00 </Text>
                    </View>
                </View>
        </View>
        <View style={styles.info_card}>
            <View style={styles.farmer_details}>

                <View style={{flexDirection:"row"}}>
                    <View style={{flex:1}}>
                    <Text style={{justifyContent:'flex-start',fontFamily:'Gotham_bold'}}>Name:</Text>
                    </View>
                    <View style={{flex:1}}>
                    <Text style={{justifyContent:'flex-end',right:60}}> John Edcel Zenarosa</Text>
                    </View>
                </View>

                <View style={{flexDirection:"row"}}>
                    <View style={{flex:1}}>
                    <Text style={{justifyContent:'flex-start',fontFamily:'Gotham_bold'}}>Address:</Text>
                    </View>
                    <View style={{flex:1}}>
                    <Text style={{justifyContent:'flex-end',right:60}}> BLK 30 LOT 24 ilang ilang street evergreen heights subdivision Barangay Gaya-Gaya Evergreen Heights Subidivision, San Jose Del Monte asfasd asfas dasd </Text>
                    </View>
                </View>
{/*                 
          

                <View style={{flexDirection:"row"}}>
                    <View style={{flex:1}}>
                    <Text style={{justifyContent:'flex-start'}}> Program Name:</Text>
                    </View>
                    <View style={{flex:1}}>
                    <Text style={{justifyContent:'flex-end'}}> </Text>
                    </View>
                </View> */}
           

            </View>

                <Animatable.Image source={Images.more_info} style={styles.more_info_pic}  resizeMode={'contain'} animation="slideInRight" delay={500}/>  
        </View>
     
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  info_card:{
      left:10,
      top:(Layout.height / 100) * 15,
      height:(Layout.height / 100) *40,
      width:(Layout.width / 100) *95,
      backgroundColor:'white'
  },
  transaction_card:{
    left:10,
    top:(Layout.height / 100) * 12,
    height:(Layout.height / 100) *  10,
    width:(Layout.width / 100) *95,
    backgroundColor:'white'
    },
  more_info_pic:{
    bottom:(Layout.height / 100) * 25,
    left:(Layout.width / 100) *60,
    height:(Layout.height / 100) *30,
    width:(Layout.width / 100) *30,
  },
  farmer_details:{
      
      left:10,
      top:(Layout.height / 100) * 1,
      width:(Layout.width / 100) * 70,      
  },
  remaining_balance_label:{
        left:10,
      top:20,
      fontSize:12,
      fontFamily:"Gotham_bold"
  },
  remaining_balance_value:{
    top:30,
    right:40,
    color:Colors.blue_green,
    fontSize:25,
    
  }
});
