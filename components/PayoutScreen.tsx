import React, {Component} from 'react';
import {View,Text, StyleSheet,FlatList,Modal,Image,RefreshControl,Pressable} from 'react-native';
import {Fumi} from 'react-native-textinput-effects';
import Colors from '../constants/Colors';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Layout from '../constants/Layout';
import Button from 'apsl-react-native-button';
import * as Animatable from 'react-native-animatable';
import NetInfo from "@react-native-community/netinfo";
import axios from 'axios';
import * as ipConfig from '../ipconfig';
import Icon from 'react-native-vector-icons/FontAwesome';
import Fontisto from 'react-native-vector-icons/Fontisto';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card } from 'react-native-paper';
import { createFilter } from "react-native-search-filter";
import Moment from 'react-moment';
import ImageViewer from "react-native-image-zoom-viewer";
import moment from 'moment';
import {  Popup} from 'react-native-popup-confirm-toast';
import Images from '../constants/Images';
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import {RectButton} from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/Swipeable";

export default class PayoutScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {          
      filter_buttons :['All','Pending','Approve'],
      selected_filter:'All',
      current_page   :0,      
      payout_list    :[],
      payout_list_for_filter:[],
      refreshing     :false
    };

  }
  


  fetch_data = () =>{
      
        
    this.setState({refreshing:true,selected_filter:'All'});
    NetInfo.fetch().then(async (response: any) => {
      const supplier_id = await AsyncStorage.getItem("supplier_id");    
      if (response.isConnected) {            
      const  result = await axios.get(
        ipConfig.ipAddress+ "/get-payout-list/"+supplier_id+"/"+0,         
        ).catch((error)=>error.response.data.message);
        
        // if status is 200
        if (result.status == 200) {        
          
          this.setState({payout_list:result.data,refreshing:false,payout_list_for_filter:result.data})                    
          
        }

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

 

  
  async componentDidMount(){

    this.fetch_data()


  } 

  // filter button function
  filterButtonFunction = (item)=>{
    
    if(item == 'All'){

      this.setState({selected_filter:item})
      this.fetch_data();
      
    }else if (item == 'Pending'){
      
      // filter by today's date transactions
      let get_pending_payout = this.state.payout_list_for_filter ? this.state.payout_list.filter((payout_items)=>
            payout_items.dbp_batch_id == undefined  && payout_items.dbp_batch_id == undefined
          ): [];

      this.setState({selected_filter:item,payout_list_for_filter:get_pending_payout})
    }else if (item == 'Approve'){
      
      // filter by today's date transactions
      let get_pending_payout = this.state.payout_list_for_filter ? this.state.payout_list.filter((payout_items)=>
            payout_items.dbp_batch_id != null && payout_items.payout_endorse_approve == '1'
          ): [];

      this.setState({selected_filter:item,payout_list_for_filter:get_pending_payout})
    }
  } 


   // render filter button
   renderFilterButtons  = (item) =>(
    <Button
      textStyle={{color:this.state.selected_filter == item ? Colors.light : Colors.fade,fontFamily:'Gotham_light',fontWeight:'bold'}}
      style= {[styles.filter_button_style,{
            borderColor: this.state.selected_filter == item ? Colors.blue_green : Colors.light,
            backgroundColor:this.state.selected_filter == item ? Colors.blue_green : Colors.light}]}      
      onPress= {()=>this.filterButtonFunction(item)}
    >
      {item}
    </Button>
  )
  
  // swipeable right button
  right_buttons = (batch_info) =>(
    <View style={{ left:(Layout.width / 100) * 10,top:(Layout.height/ 100) * 2,paddingLeft:20}}>
      <Pressable
          onPress  = {() => { 
                  
            this.props.navigation.navigate('PayoutSummaryScreen',{batch_info:batch_info})
          }}
          style    = {({ pressed }) => ({
                        opacity: pressed ? 0.5 : 1,
                      })}>
            <Icon
              name     = "eye"        
              color    = {Colors.dark_blue}
              size     = {30}              
            />
        </Pressable>        
    </View>
  )

  // render payout item
  render_payout_item = (item,index)=>(
       
      <Animatable.View animation={"slideInLeft"} delay={index / 100}>
        <Swipeable renderRightActions={()=>this.right_buttons(item)}>       
        <Card style={styles.card_style}>
          <Card.Title 
              title      = {item.application_number} 
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
              right      =  {
                              ()=>(
                                <View>  
                                  <Text style={
                                                {
                                                  backgroundColor: item.dbp_batch_id == '' ?
                                                                    Colors.warning
                                                                    : item.payout_endorse_approve == '1' ?
                                                                    Colors.light_green
                                                                    :
                                                                    Colors.warning,                                                                                                              
                                                  padding:10,
                                                  right:(Layout.width/100) * 5,
                                                  fontFamily:'Gotham_bold',
                                                  color:Colors.light,
                                                  borderRadius:20
                                                }
                                              }>
                                    
                                    {
                                      item.dbp_batch_id == null ?
                                        
                                          <Icon 
                                            name   = "clock-o" 
                                            family = "fontawesome" 
                                            color  = {Colors.light} 
                                            size   = {15} 
                                          /> 
                                    
                                      : item.payout_endorse_approve == '1' ?
                                        <Fontisto 
                                        name   = "like"                                      
                                        color  = {Colors.light} 
                                        size   = {15} 
                                        /> 
                                      :
                                        <Icon 
                                          name   = "clock-o" 
                                          family = "fontawesome" 
                                          color  = {Colors.light} 
                                          size   = {15} 
                                        />     
                                    }
                                    
                                    {"\t"}                             
                                    {
                                      item.dbp_batch_id == null ?
                                      'Pending' 
                                      : item.payout_endorse_approve == '1' ?
                                      'Approved'
                                      :
                                      'Pending'     
                                    }
                                  </Text>
                                </View>
                              )
                            }                                  
          />      
        </Card>
        </Swipeable>
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
        <FlatList       
          horizontal
          data       = {this.state.filter_buttons}                             
          renderItem = {({item,index})=>this.renderFilterButtons(item)}
          style      = {styles.flatlist_filter_buttons}
        />   
        
        {/*Payout List*/}
        <FlatList                 
       
          refreshControl        = {
                                    <RefreshControl
                                      onRefresh  = {this.fetch_data}
                                      refreshing = {this.state.refreshing}    
                                      // enabled    = {this.state.selected_filter == 'All' || this.state.selected_filter == '' ? true :false}
                                    />
                                  }          
          data                  = {this.state.selected_filter == 'All' || this.state.selected_filter == '' ? this.state.payout_list : this.state.payout_list_for_filter}                                
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
    backgroundColor: Colors.light,
  },
  logo:{
    width:(Layout.width / 100) *  90,
    height:(Layout.height / 100) * 30,
    left:20,
    alignSelf:'center',        
  },
  flatlist_filter_buttons:{
    flexGrow:0,     
    top:(Layout.height/100) * 10,    
  },
  filter_button_style:{
    height:30,    
    marginLeft:(Layout.width / 100) * 5,
    borderRadius:20,
    fontFamily:"Gotham_light",
    fontWeight:'bold',
    borderColor:Colors.blue_green,
    color:Colors.light,
    width:(Layout.width / 100) * 25,
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
    fontSize:16,
    color:Colors.header_text,
    fontStyle:'italic'  
  },
  payout_flatlist:{    
    top:(Layout.height/100) * 10,
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
  view_button:{
    backgroundColor:'red',
    left:(Layout.width/100) * 20,
  }
});
