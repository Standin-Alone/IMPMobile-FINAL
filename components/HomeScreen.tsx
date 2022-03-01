import React, {Component} from 'react';
import {View,Text, StyleSheet,FlatList,Modal} from 'react-native';
import {Fumi} from 'react-native-textinput-effects';
import Colors from '../constants/Colors';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Layout from '../constants/Layout';
import Button from 'apsl-react-native-button';
import * as Animatable from 'react-native-animatable';
import NetInfo from "@react-native-community/netinfo";
import axios from 'axios';
import * as ipConfig from '../ipconfig';
import * as Yup from 'yup';
import { Formik } from 'formik';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card } from 'react-native-paper';
import { createFilter } from "react-native-search-filter";
import Moment from 'react-moment';
import ImageViewer from "react-native-image-zoom-viewer";
import moment from 'moment';
import {  Popup} from 'react-native-popup-confirm-toast';
import Images from '../constants/Images';
const KEYS_TO_FILTERS = ["reference_no", "fullname"];
export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {          
        params:this.props.route.params,
        isFocus:false,
        full_name:'',
        today_vouchers_list:[],
        filter_buttons:['All','Today'],
        selected_filter:'All',
        search:'',
        refreshing:false,
        isShowImage:false,
        imageURI:null,
        currentPage:0
    };

  }
  


  fetchData = async () => {
    const supplier_id = await AsyncStorage.getItem("supplier_id");
    const currentPage = 1;
    
    this.setState({refreshing:true});
    NetInfo.fetch().then(async (response: any) => {
      if (response.isConnected) {
       
      const  result = await axios.get(
        ipConfig.ipAddress+ "/get-scanned-vouchers/"+supplier_id+"/"+0,         
        ).catch((error)=>error.response.data.message);
        if (result.status == 200) {            
          this.setState({today_vouchers_list:result.data,refreshing:false,currentPage:0})
                    
        }
        this.setState({refreshing:false});
      } else {
        // Alert.alert("Message", "No Internet Connection.");
        this.setState({refreshing:false});
      }

    
    });
  };
  


   
  // load more scanned vouchers
   loadMore = async ()=>{
      
    let addPage = this.state.currentPage;


    this.setState({refreshing:true});
    const supplier_id = await AsyncStorage.getItem("supplier_id");
    NetInfo.fetch().then((response: any) => {
      if (response.isConnected) {
        axios
          .get(
            ipConfig.ipAddress+ "/get-scanned-vouchers/"+supplier_id+"/"+addPage,    
          )
          .then((response) => {
            
            if (response.status == 200) {  

              if(response.data.length){
                
                let new_data = response.data;                
                   
                this.setState({today_vouchers_list: [...new Set(this.state.today_vouchers_list),...new_data]});
                
                

                
       
                
              } 
            }

                   
            this.setState({refreshing:false});
           
          })
          .catch((error) => {
            
            console.warn(error.response);
            this.setState({refreshing:false});
          });
      } else {
        alert('No internet')
      }
    });
  }


   getScannedVouchers = async () => {
    const supplier_id = await AsyncStorage.getItem("supplier_id");
    let page = 0;
    this.setState({refreshing:true});
        
    NetInfo.fetch().then((response: any) => {
      if (response.isConnected) {
        axios
          .get(
            ipConfig.ipAddress+ "/get-scanned-vouchers/"+supplier_id+"/"+page
          )
          .then((response) => {
            if (response.status == 200) {

              this.setState({today_vouchers_list:response.data,currentPage:0})
              this.setState({refreshing:false});

            }

            this.setState({refreshing:false});
          })
          .catch((error) => {
            // Alert.alert('Error!','Something went wrong.')
            console.warn(error.response.data.message);
            this.setState({refreshing:false});
          });
      } else {
        Popup.show({
          type: 'danger',              
          title: 'Message',
          textBody: "No internet connection.",                
          buttonText:'Ok',
          okButtonStyle:styles.confirmButton,
          okButtonTextStyle: styles.confirmButtonText,
          callback: () => {                
            Popup.hide()                                    
          },              
        })
   
      }
    });

  };

  
  async componentDidMount(){

    this.fetchData();
    this.setState({full_name:await AsyncStorage.getItem('full_name')})

  }

  emptyComponent = () =>(
    <Card      
      style     = {styles.empty_card}      
    >      
      <Card.Cover source={Images.no_data_bg}  resizeMode="cover" width={200} height={10}/>
    </Card>
  )
  

     // got to summary 
   goToSummary = (item) =>{  
    
    NetInfo.fetch().then(async (response: any) => {
      
      if (response.isConnected) {
        
        axios.get(ipConfig.ipAddress + "/get-transaction-history/"+item.reference_no).then((response)=>{                    
          // push to summary screen 
          
          this.props.navigation.push('SummaryScreen',{transactions:response.data,fullname:item.fullname,current_balance:item.current_balance,voucher_info:item});
        }).catch(err=>{
          
          console.warn(err.response)
          
        })        
      } else {
        alert('No Internet Connection.Pleae check your internet connection.')        
      }
    });
  }

  // show image
  showImage = (uri: any) => {
    
    this.setState({isShowImage:true,imageURI:uri})    
  };

  
   leftComponent = () =>(  <Icon name="ticket" family="fontawesome" color={Colors.base} size={30} />)
   rightComponent = (item) =>(  
              <Icon
                 name="eye"                  
                 color={Colors.light_green} 
                 size={30}  
                 style={{right:30}} 
                 onPress={()=>this.goToSummary(item)}
                 />
                 )
  renderItem =  (item,index) =>  
  ( 
    <Card
      elevation = {1}
      style     = {styles.card}
      onPress   = {()=>this.showImage(item.base64)}
    >
        <Card.Title        
        title    = {item.reference_no}
        subtitle = {<View><Text><Icon name="clock-o" family="fontawesome" color={Colors.base} size={15} /> <Moment element={Text}    style    = {{color:Colors.muted}}  fromNow>{item.transac_date}</Moment></Text></View>}        
        left     = {this.leftComponent}
        right    = {()=>this.rightComponent(item)}
      />
      <Card.Cover source={{uri:'data:image/jpeg;base64,'+item.base64}}          
          resizeMode='cover'
          resizeMethod='resize'
        style={{height:(Layout.height/100) * 30}}
        
      />
    
       
    </Card>
  )

  // filter button function
  filterButtonFunction = (item)=>{
    if(item == 'All'){

      this.setState({refreshing:true,selected_filter:item})
      this.fetchData();
    }else if (item == 'Today'){
      
      // filter by today's date transactions
      let get_today_transactions = this.state.today_vouchers_list ? this.state.today_vouchers_list.filter((voucher_items)=>
            moment().format('YYYY-MM-DD') == moment(voucher_items.transac_date).format('YYYY-MM-DD') 
          ): [];

      this.setState({selected_filter:item,today_vouchers_list:get_today_transactions})
    }
  } 
  renderFilterButtons  = (item) =>(
    <Button
      style= {[styles.filter_button_style,{borderColor: this.state.selected_filter == item ? Colors.blue_green : '#ddd'}]}
      onPress= {()=>this.filterButtonFunction(item)}
    >
      {item}
    </Button>
  )
  render() {

    const filteredVouchers = this.state.today_vouchers_list.filter(
      createFilter(this.state.search, KEYS_TO_FILTERS)
    );

    return (
      <View style={styles.container}>        
        
        <Animatable.Text style={styles.greetings} animation="fadeInDownBig" >Hello, John Edcel</Animatable.Text>        
        <Animatable.Text style={styles.question} animation="fadeInDownBig" >What voucher transaction do you want to search?</Animatable.Text>        
        <Fumi
            label={'Search by reference number'}
            iconClass={FontAwesomeIcon}
            iconName={'search'}
            iconColor={Colors.green}
            iconSize={20}
            iconWidth={40}
            inputPadding={16}
                        
            style={[
              styles.search_text_input,
              {
                borderColor:
                  this.state.isFocus == true
                    ? Colors.green
                    : '#ddd',
              },
            ]}
            onBlur={() => this.setState({isFocus: false})}
            onFocus={() => this.setState({isFocus: true})}
            onChangeText={value => this.setState({search: value})}
            keyboardType="email-address"
          />
          {/* filter buttons */}
          <FlatList       
            horizontal
            data={this.state.filter_buttons}                             
            renderItem={({item,index})=>this.renderFilterButtons(item)}
            style={styles.flatlist_filter_buttons}
          />

        <Animatable.Text style={styles.recent_title}><FontAwesomeIcon name="info-circle" color={Colors.blue_green} size={16}/>  List of Transactions</Animatable.Text>
        <FlatList       
          showsHorizontalScrollIndicator={false}
          
          onRefresh={this.getScannedVouchers}
          refreshing={this.state.refreshing}                                  
          data={this.state.today_vouchers_list ? filteredVouchers : null}
          extraData = {this.state.today_vouchers_list}
          ListEmptyComponent={this.emptyComponent}
          renderItem={({ item, index }) =>  this.renderItem(item,index)}               
          contentContainerStyle={{flexGrow:0,paddingBottom:90}}
          style={styles.today_voucher_flatlist}
          keyExtractor={(item,index)=>index}          
          
          onEndReachedThreshold={0.1} // so when you are at 5 pixel from the bottom react run onEndReached function
          onEndReached={async ({distanceFromEnd}) => {     
          
              
             if (distanceFromEnd > 0 ) 
              { 

                await this.setState((prevState) => ({currentPage:prevState.currentPage + 2}));
                await this.loadMore();
              }
              
            
        
          }}


        />

        <Modal
          visible={this.state.isShowImage}
          transparent={true}
          onRequestClose={() => this.setState({isShowImage:false})}
          animationType="fade"
        >
          <ImageViewer
            imageUrls={[{ url: "data:image/jpeg;base64," + this.state.imageURI }]}
            index={0}
          />
        </Modal>
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  // card:{
  //   top:(Layout.height/100) * 15,
  //   width:(Layout.width/100) * 20,    
  //   left:10
  // },
  card_cover:{    
    width:  100,
    height: 100
  },
  today_voucher_flatlist:{
    top:(Layout.height/100) * 16,
    width:(Layout.width/100) * 100,   
    height:(Layout.height/100) * 60,    
    backgroundColor:Colors.light,
    flexGrow:0,    
  },
  card: {
    flex: 1,
    borderRadius: 5,        
    top:10,
    width:(Layout.width/100) * 100,         
    backgroundColor:Colors.light,
    alignSelf: "center",
    marginBottom: 20,
  },
  empty_card: {
    height:200,
    borderRadius: 5,            
    top:10,
    width:(Layout.width/100) * 90,         
    marginRight:(Layout.width/100) * 10  ,
    left:10,
    alignSelf: "center",
    marginBottom: 20,
  },
  recent_title:{
    top:(Layout.height/100) * 15,
    left:10,
    fontFamily:'Gotham_bold',
    color:Colors.header_text
  },
  other_transactions:{
    top:(Layout.height/100) * 20,
    left:10,
    fontFamily:'Gotham_bold',
    color:Colors.header_text
  },
  greetings:{
    fontFamily:'Gotham_bold',
    top:(Layout.height/100) * 5,
    color:Colors.blue_green,    
    left:10,
    fontSize:25,      
  },
  question:{
    fontFamily:"Gotham_light",
    fontSize:12,
    top:(Layout.height/100) * 8,
    left:(Layout.width / 100) * 3,
  },
  search_text_input:{
    top:(Layout.height/100) * 10,    
    borderWidth:1,
    left:(Layout.width / 100) * 3,
    width:(Layout.width / 100) * 95,
    borderRadius:15,
    borderColor:'#ddd'
  },
  filter_button_style:{
    height:30,
    top:(Layout.height/100) * 1,
    marginLeft:(Layout.width / 100) * 5,
    borderRadius:20,
    borderColor:Colors.blue_green,
    width:(Layout.width / 100) * 25,
  },
  flatlist_filter_buttons:{
    flexGrow:0,
    
    top:(Layout.height/100) * 12,
    height:(Layout.height/100) * 5,
  }

});
