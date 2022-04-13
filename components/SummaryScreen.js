import React, {Component} from 'react';
import {View,Text, StyleSheet,ScrollView,Image} from 'react-native';
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

import Images from '../constants/Images';

import NumberFormat from 'react-number-format';

import moment from "moment";
import { List, Card, Divider } from "react-native-paper";
export default class SummaryScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {          
        params:this.props.route.params,
        transactions:this.props.route.params.transactions
    };
    
  }

  componentDidMount(){
    console.warn(this.state.transactions[0]);
  }

   convertedDate = (raw_date) => {
    let split_date = raw_date.split(/[- :]/);
    let convert_date = new Date(
      Date.UTC(
        split_date[0],
        split_date[1] - 1,
        split_date[2],
        split_date[3],
        split_date[4],
        split_date[5]
      )
    ).toDateString();

    return moment(convert_date).format("MMMM DD YYYY");
  };
  render() {
    
    const transactionFilterByDate = this.state.transactions.filter(
      (item, index) =>
      this.state.transactions.findIndex(
          (obj) =>
            obj.transac_by_fullname === item.transac_by_fullname &&
            obj.transaction_id === item.transaction_id
        ) === index
    );

    return (
      <View  style={styles.container}>        

        <View style={styles.remaining_balance_card}>
                <View style={{flexDirection:"row"}}>
                    <View style={{flex:1}}>
                    <Text style={[styles.remaining_balance_label,{justifyContent:'flex-start'}]}>Voucher Amount:</Text>
                    </View>
                    <View style={{flex:1}}>
                    <NumberFormat value={this.state.params.voucher_info.default_balance} displayType={'text'} thousandSeparator={true} 
                      renderText={(value)=>(
                      <Animatable.Text animation="slideInLeft" numberOfLines={2} style={styles.remaining_balance_value}> PHP {value}
                    </Animatable.Text>
                  )}
                  />

                    
                    </View>
                </View>
        </View>
{/*                         
        <View style={{ flexDirection:'column' }}>
            <View>
              <Text>Attachments</Text>
            </View>

            <View>

            </View>
        </View> */}
        <View style={styles.info_card}>            
                <View style={{flexDirection:"row",top:20}}>
                <ScrollView style={styles.farmer_details} showsVerticalScrollIndicator={false}>
                  <View style={{flex:1}}>
                    <View style={{flexDirection:"row"}}>
                        <View style={{flex:0.5}}>
                        <Text style={{justifyContent:'flex-start',fontFamily:'Gotham_bold'}}>Name:</Text>
                        </View>
                        <View style={{flex:1}}>
                        <Text style={{justifyContent:'flex-end'}}> {this.state.params.fullname}</Text>
                        </View>
                        
                    </View>

                    <View style={{flexDirection:"row"}}>
                        <View style={{flex:0.5}}>
                        <Text style={{justifyContent:'flex-start',fontFamily:'Gotham_bold'}}>Address:</Text>
                        </View>
                        <View style={{flex:1}}>
                        <Text style={{justifyContent:'flex-end'}}>{this.state.params.voucher_info.address}  </Text>
                        </View>                     
                    </View>
                    
              

                    <View style={{flexDirection:"row"}}>
                        <View style={{flex:0.5}}>
                        <Text style={{justifyContent:'flex-start',fontFamily:'Gotham_bold'}} numberOfLines={2}> Program: </Text>
                        </View>
                        <View style={{flex:1}}>
                        <Text style={{justifyContent:'flex-end'}}>{this.state.params.voucher_info.program_title} </Text>                  
                        </View>                    
                    </View>                                                        
                  </View>
                  </ScrollView> 
                  <View style={{flex:0.5}}>
                    <Animatable.Image source={Images.more_info} style={[styles.more_info_pic,{justifyContent:'flex-end'}]}  resizeMode={'contain'} animation="slideInRight" delay={500}/>  
                  </View>
                </View>
           

                        
        </View>
          
        {/* list of previous transaction component */}

        <View style={styles.transaction_card}>
        <ScrollView >
        
        <List.AccordionGroup  expandedId={1} >
        {transactionFilterByDate.map((item,index) => {
          let sum = 0;
          return (
          <List.Accordion
            style={{backgroundColor:'white',overflow:'scroll'}}
            title={moment(item.transac_date).format("MMMM DD, YYYY")}
            id={index+1}
            description={"transacted by " + item.transac_by_fullname}
            descriptionStyle={{textTransform:'capitalize'}}
            expanded
            titleStyle={{ color: Colors.base }}
            left={(props) => (
              <List.Icon {...props} icon="history" color={Colors.blue_green} />
            )}
          >
            {this.state.transactions.map((value) =>{

            return  this.convertedDate(value.transac_date)  ==  this.convertedDate(item.transac_date)  &&  item.transac_by_fullname == value.transac_by_fullname  ? (
                <View>
                  <List.Item
                    title={

                      <View style={{ width:(Layout.width / 100)* 50 }}>

                        
                        <Text style={{ fontFamily:"Gotham_bold"}}  
                        numberOfLines={5}
                        >
                          {(value.item_category != '' ? value.item_category : value.item_name)  + '\n' +" (" + value.quantity + " " + value.unit_measure  +")"} 
                        </Text>                    
                      </View>
                    }
                    
                    // description={ 
                    //   "₱" + value.total_amount 
                    // }

                    
                    right={() => (

                      <NumberFormat
                        value={ value.total_amount}
                        displayType={"text"}
                        decimalScale={2}
                        thousandSeparator={true}               
                        renderText={(values) => (
                          <Text style={{ top: 10 }}>
                            {"₱" + values }
                          </Text>
                        )}
                      />
                     
                    )}
                  />
                  <Divider />
                </View>
              ) : null;
            }
            )}
              
            <List.Item  title={"Total Amount"}               
              titleStyle={{fontFamily:'calibri-light',fontWeight:'bold'}}              
              right={()=>              
               {                 
                let filter_transaction = this.state.transactions.filter((transaction_value)=> this.convertedDate(item.transac_date)  ==  this.convertedDate(transaction_value.transac_date) && transaction_value.transac_by_fullname == item.transac_by_fullname );
                return (
                
                  <NumberFormat
                    value={ filter_transaction.reduce((val,index) => { return this.convertedDate(index.transac_date)  ==  this.convertedDate(item.transac_date)  ? val += Number( index.total_amount)  : null }, 0 ).toFixed(2)}
                    displayType={"text"}
                    decimalScale={2}
                    thousandSeparator={true}                
                    renderText={(values) => (
                      <Text style={{top:10,fontFamily:'Gotham_bold',color:Colors.green}}>
                        {"₱"+values}
                      </Text>
                    )}
                  />                
                )
                    
                }} 
              />  
              <List.Item  title={"Cash Added By Farmer"}               
              titleStyle={{fontFamily:'calibri-light',fontWeight:'bold'}}              
              right={()=>              
               {                 
                let filter_transaction = this.state.transactions.filter((transaction_value)=> this.convertedDate(item.transac_date)  ==  this.convertedDate(transaction_value.transac_date) && transaction_value.transac_by_fullname == item.transac_by_fullname );
                return (
                
                  <NumberFormat
                    value={ filter_transaction.reduce((val,index) => { return this.convertedDate(index.transac_date)  ==  this.convertedDate(item.transac_date)  ? val += Number( index.cash_added)  : null }, 0 ).toFixed(2)}
                    displayType={"text"}
                    decimalScale={2}
                    thousandSeparator={true}                
                    renderText={(values) => (
                      <Text style={{top:10,fontFamily:'Gotham_bold',color:Colors.danger}}>
                        {"₱"+values}
                      </Text>
                    )}
                  />                
                )
                    
                }} 
              />                           
          </List.Accordion>
        )})}
      </List.AccordionGroup>
        </ScrollView>

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
      flex:0.3,
      width:(Layout.width / 100) *95,
      backgroundColor:'white',
      borderWidth:1,
      overflow:'hidden',
      flexShrink:1,
      borderColor:Colors.fade,
      elevation:5
  },
  remaining_balance_card:{
    left:10,
    top:(Layout.height / 100) * 12,
    height:(Layout.height / 100) *  10,
    width:(Layout.width / 100) *95,
    backgroundColor:'white',
    borderWidth:1,
    borderColor:Colors.fade,
    elevation:5
    },
  transaction_card:{
    // left:10,
    // top:(Layout.height / 100) * 18,
    // height:(Layout.height / 100) *  27,
    // width:(Layout.width / 100) *95,
 
    // flexGrow:0,
    // paddingBottom:200,
    flex:0.4,
    top:(Layout.height / 100) * 18,
    width:(Layout.width / 100) *95,
    left:10,
    backgroundColor:'white',
    borderWidth:1,
    borderColor:Colors.fade,
    elevation:5

    },
  more_info_pic:{
    bottom:(Layout.height / 100) * 9,
    // left:(Layout.width / 100) *60,        
    height:(Layout.height / 100) *30,
    width:(Layout.width / 100) *30,
    elevation:2
  },
  farmer_details:{
    
    
    left:10,
    
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
