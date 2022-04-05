import React, {Component} from 'react';
import {View,Text, StyleSheet, Keyboard,Image,FlatList,RefreshControl} from 'react-native';
import {Fumi} from 'react-native-textinput-effects';
import Colors from '../constants/Colors';
import Entypo from 'react-native-vector-icons/Entypo';
import Layout from '../constants/Layout';
import Button from 'apsl-react-native-button';
import * as Animatable from 'react-native-animatable';
import NetInfo from "@react-native-community/netinfo";
import * as ipConfig from '../ipconfig';
import axios from 'axios';
import Images from '../constants/Images';
import { Popup } from 'react-native-popup-confirm-toast';
import NumberFormat from 'react-number-format';
import { Card } from 'react-native-paper';
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import Icon from 'react-native-vector-icons/FontAwesome';
import Moment from 'react-moment';
export default class PayoutSummaryScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      params:this.props.route.params,
      payout_transaction_list:[],
      refreshing:false
    };
  }


  fetch_data = () =>{
      
        
    this.setState({refreshing:true,selected_filter:'All'});
    NetInfo.fetch().then(async (response) => {

      
      const batch_id    = this.state.params.batch_info.batch_id;    
      
      if (response.isConnected && response.isInternetReachable) {            
      const  result = await axios.get(
        ipConfig.ipAddress+ "/get-payout-transaction-list/"+batch_id+"/"+0,         
        ).catch((error)=>error.response.data.message);
        
        // if status is 200
        if (result.status == 200) {        
          
          this.setState({ payout_transaction_list:result.data,
                          refreshing:false})                    
          
        }

        console.warn(result)


        this.setState({refreshing:false});
      } else {
        Popup.show({
          type: 'danger',
          title: 'Message',
          textBody: 'No Internet Connection.Please check your internet connection.',
          buttonText: 'Okay',
          okButtonStyle: styles.confirmButton,
          okButtonTextStyle: styles.confirmButtonText,
          callback: () => {  
            Popup.hide();
          },
        });
        this.setState({refreshing:false});
      }
    
    });
    
  }



  componentDidMount(){
    this.fetch_data()
  }


  // render payout item
  render_payout_item = (item,index)=>(
       
    <Animatable.View animation={"slideInLeft"} delay={index / 100}>
     <Card style={styles.card_style}>
          <Card.Title 
              title      = {item.first_name+' '+item.last_name} 
              titleStyle = {styles.card_title_style}
              subtitle   = {
                            <View>
                              <Text>
                                <Icon 
                                    name   = "calendar" 
                                    family = "fontawesome" 
                                    color  = {Colors.base} 
                                    size   = {15} 
                                /> 
                                {"\t\t"}
                                <Moment 
                                    element = {Text}    
                                    style   = 
                                    {{fontWeight:'Gotham_light'}}  
                                    fromNow
                                > 
                                  {item.transac_date}
                                </Moment>
                              </Text>
                            </View>
                          }        
              left      =  {
                              ()=>(
                                <View>  
                                  <Icon 
                                    name   = "ticket" 
                                    family = "fontawesome" 
                                    color  = {Colors.blue_green} 
                                    size   = {36} 
                                  /> 
                                </View>
                              )
                            }                                  
          />      
        </Card>
    </Animatable.View>  
  )

  // render payout empty
  render_payout_empty = (item)=>{    
    return (
    this.state.refreshing ? 
    // card placeholder loader
      <SkeletonPlaceholder highlightColor = {Colors.blue_green} >
        <View style = {{ flexDirection: "row",marginTop:20}}>  
            <View style  = {{ marginLeft: 20 }}>            
              <View style = {{marginTop: 6, width: (Layout.width  / 100) * 85, height:  (Layout.height  / 100) * 10, borderRadius: 4 }} />            
            </View>          
        </View>

        <View style = {{ flexDirection: "row",marginTop:20}}>                
            <View style = {{ marginLeft: 20 }}>            
              <View style = {{marginTop: 6, width: (Layout.width  / 100) * 85, height:  (Layout.height  / 100) * 10, borderRadius: 4 }} />            
            </View>
        </View>    
      </SkeletonPlaceholder> 
      :
      <Image source={Images.no_data_bg} style={styles.logo}  resizeMode={'cover'}/>        
    )};




  render() {

    return (
      <View style={styles.container}>
        <View style={styles.back}>
          <Text style={styles.application_number_label}>
               Your Application Number
          </Text>
          <Text style={styles.application_number}>
            {this.state.params.batch_info.application_number}
          </Text>    
        </View>
        <View style={styles.summary_container}>            
          <Text style={styles.total_amount_label}>Total Amount:</Text>
          <NumberFormat
          value={this.state.params.batch_info.amount}
          displayType={"text"}
          decimalScale={2}
          thousandSeparator={true}  
                        
          renderText={(values) => (
            <Text style={styles.total_amount} adjustsFontSizeToFit>
              {"₱" + values}
            </Text>
          )}
        />                                    
      </View>

      
      <FlatList                 
      
        refreshControl        = {
                                  <RefreshControl
                                    onRefresh  = {this.fetch_data}
                                    refreshing = {this.state.refreshing}    
                                    // enabled    = {this.state.selected_filter == 'All' || this.state.selected_filter == '' ? true :false}
                                  />
                                }          
        data                  = {this.state.payout_transaction_list}                                
        renderItem            = {({item,index})=>this.render_payout_item(item,index)}
        ListEmptyComponent    = {this.render_payout_empty}
        contentContainerStyle = {{flexGrow:0,paddingBottom:90}}
        style                 = {styles.payout_flatlist}          
        
        
        
      />   
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
    width:(Layout.width / 100) *  90,
    height:(Layout.height / 100) * 30,
    left:20,
    alignSelf:'center',        
  },
  card_style:{
    borderColor:Colors.fade,
    borderWidth:1,
    borderRadius:15,    
    height:(Layout.height / 100) * 10,
    width:(Layout.width / 100) * 90,
    marginBottom:10
  },
  card_title_style:{
    fontFamily:"Gotham_light",
    fontSize:20,
    fontWeight:'bold',
    color:Colors.header_text,
    fontStyle:'italic'  
  },
  back:{
    backgroundColor:Colors.light_green,
    width:(Layout.width / 100 ) * 100,
    height:(Layout.height / 100 ) * 25,
  },
  summary_container:{        
    width:(Layout.width / 100 ) * 90,
    left:(Layout.width / 100 ) * 5,
    bottom:(Layout.width / 100 ) * 20,
    borderRadius:20,
    elevation:20,
    height:(Layout.height / 100 ) * 15,        
    backgroundColor:Colors.light
  },
  total_amount_label:{
    top:(Layout.height / 100 ) * 2,  
    left:(Layout.width / 100 ) * 5,    
    fontSize:12,
    fontFamily:'Gotham_light',
    fontWeight:'bold',    
    color:Colors.fade,  
  },
  application_number_label:{  
    top:(Layout.height / 100 ) * 7,  
    left:(Layout.width / 100 ) * 5,    
    fontSize:14,
    fontFamily:'Gotham_light',
    fontWeight:'bold',    
    color:Colors.dark,    
  },
  total_amount:{
    top:(Layout.height / 100 ) * 5,      
    fontSize:16,
    fontFamily:'Gotham_bold',
    color:Colors.light_green,
    textAlign:'center'
  },
  application_number:{
    top:(Layout.height / 100 ) * 7,     
    fontSize:25,
    fontFamily:'Gotham_bold',
    fontStyle:'italic',
    fontWeight:'bold',
    color:Colors.light,
    textAlign:'center'
  },
  status:{
    top:(Layout.height / 100 ) * 17,     
    fontSize:30,
    fontFamily:'Gotham_bold',    
    fontWeight:'bold',
    color:Colors.light,
    textAlign:'center'
  },  
  payout_flatlist:{    
    top:(Layout.height/100) * 2,
    left:(Layout.width/100) * 3,   
    width:(Layout.width/100) * 100,   
    height:(Layout.height/100) * 60,    
    backgroundColor:Colors.light,
    flexGrow:0,    
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
