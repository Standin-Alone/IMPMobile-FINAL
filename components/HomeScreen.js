import React, {Component} from 'react';
import {View,Text, StyleSheet,FlatList,Modal,Image,InteractionManager} from 'react-native';
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
import Spinner from 'react-native-spinkit';
const KEYS_TO_FILTERS = ["reference_no", "fullname"];
export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {          
        params:this.props.route.params,
        isFocus:false,
        merchant_name:'',
        vouchers_list:[],
        filter_buttons:['All','Today'],
        selected_filter:'All',
        search:'',
        refreshing:false,
        isShowImage:false,
        imageURI:null,
        currentPage:0,
        show_spinner:false,
        total_vouchers:0
    };
    
  }
  


  fetchData = async () => {
    const supplier_id = await AsyncStorage.getItem("supplier_id");
    
    const currentPage = 1;
    
    this.setState({refreshing:true});
    NetInfo.fetch().then(async (response) => {

      if (response.isConnected && response.isInternetReachable) {
       
      const  result = await axios.get(
        ipConfig.ipAddress+ "/get-scanned-vouchers/"+supplier_id+"/"+0,         
        ).catch((error)=>console.warn(error.response.data));
      console.warn(result.data['total_vouchers']);  
        if (result.status == 200) {   
          console.warn(result.data['total_vouchers']);
          this.setState({
                vouchers_list:result.data['scanned_vouchers'],
                refreshing:false,
                currentPage:0,
                total_vouchers:result.data['total_vouchers']
              })                    
        }
        
        this.setState({refreshing:false});
      } else {

        Popup.show({
          type: 'danger',
          title: 'Message',
          textBody: 'No Internet Connection.Please check your internet connection.',
          buttonText: 'Retry',
          okButtonStyle: styles.confirmButton,
          okButtonTextStyle: styles.confirmButtonText,
          callback: () => {  
            Popup.hide();    
            this.setState({show_spinner:false})                                           
          },
        });
        this.setState({refreshing:false});
        
      }

    
    });
  };
  


   
  // load more scanned vouchers
   loadMore = async ()=>{
      
    let addPage = this.state.currentPage;

    
    this.setState({refreshing:true});
    const supplier_id = await AsyncStorage.getItem("supplier_id");
    NetInfo.fetch().then((response) => {
      if (response.isConnected && response.isInternetReachable) {
        axios
          .get(
            ipConfig.ipAddress+ "/get-scanned-vouchers/"+supplier_id+"/"+addPage,    
          )
          .then((response) => {
            
            if (response.status == 200) {  

              if(response.data['scanned_vouchers'].length){                
                console.warn(response.data['scanned_vouchers'].length)
                let new_data = response.data['scanned_vouchers'];   
                console.warn(new_data);                                
                this.setState({vouchers_list: [...new Set(this.state.vouchers_list),...new_data]});              
              } 
            }

                   
            this.setState({refreshing:false,total_vouchers:response.data['total_vouchers']});
           
          })
          .catch((error) => {
            
            console.warn(error.response.data);
            this.setState({refreshing:false});
          });
      } else {
        Popup.show({
          type: 'danger',
          title: 'Message',
          textBody: 'No internet connection.Please check your internet connectivity.',
          buttonText: 'Okay',
          okButtonStyle: styles.confirmButton,
          okButtonTextStyle: styles.confirmButtonText,
          callback: () => {  
            Popup.hide();
                        
            this.setState({show_spinner:false})
           
          },
        });
      }
    });
  }


   getScannedVouchers = async () => {
    const supplier_id = await AsyncStorage.getItem("supplier_id");
    let page = 0;
    this.setState({refreshing:true});
        
    NetInfo.fetch().then((response) => {
      if (response.isConnected && response.isInternetReachable) {
        axios
          .get(
            ipConfig.ipAddress+ "/get-scanned-vouchers/"+supplier_id+"/"+page
          )
          .then((response) => {
            console.warn(response.data)
            if (response.status == 200) {

              this.setState({vouchers_list:response.data['scanned_vouchers'],currentPage:0,total_vouchers:response.data['total_vouchers']})
              this.setState({refreshing:false});

            }

            this.setState({refreshing:false});
          })
          .catch((error) => {                        
            this.setState({refreshing:false});
          });
      } else {
        Popup.show({
          type: 'danger',              
          title: 'Message',
          textBody: "No internet connection.Please check your internet connectivity.",                
          buttonText:'Ok',
          okButtonStyle:styles.confirmButton,
          okButtonTextStyle: styles.confirmButtonText,
          callback: () => {                
            Popup.hide()   
            this.setState({show_spinner:false})
            this.setState({refreshing:false});                                 
          },              
        })
   
      }
    });

  };

  
  async componentDidMount(){

    this.fetchData();
    let full_name = await AsyncStorage.getItem('full_name');
    
    let first_name = full_name?.split(' ')[0];
    this.setState({merchant_name:first_name})

  }

  emptyComponent = () =>(    
    this.state.refreshing ? 
    // card placeholder loader
    <SkeletonPlaceholder highlightColor={Colors.blue_green} >
      <View style={{ flexDirection: "row",marginTop:20}}>                
          <View style={{ marginLeft: 20 }}>
            <View style={{ flexDirection: "row"}}>
              <View style={{ width: 60, height: 60, borderRadius: 50 }} />  
              <View style={{  width: (Layout.width  / 100) * 40, height: 20, borderRadius: 4,top:20 ,left:5}}/>
            </View>            
            
            <View style={{marginTop: 6, width: (Layout.width  / 100) * 90, height:  (Layout.height  / 100) * 10, borderRadius: 4 }} />
            <View style={{ marginTop: 6, width: (Layout.width  / 100) * 30, height: 20, borderRadius: 4 }}/>
          </View>
      </View>

      <View style={{ flexDirection: "row",marginTop:20}}>                
          <View style={{ marginLeft: 20 }}>
            <View style={{ flexDirection: "row"}}>
              <View style={{ width: 60, height: 60, borderRadius: 50 }} />  
              <View style={{  width: (Layout.width  / 100) * 40, height: 20, borderRadius: 4,top:20 ,left:5}}/>
            </View>            
            
            <View style={{marginTop: 6, width: (Layout.width  / 100) * 90, height:  (Layout.height  / 100) * 10, borderRadius: 4 }} />
            <View style={{ marginTop: 6, width: (Layout.width  / 100) * 30, height: 20, borderRadius: 4 }}/>
          </View>
      </View>

      <View style={{ flexDirection: "row",marginTop:20}}>                
          <View style={{ marginLeft: 20 }}>
            <View style={{ flexDirection: "row"}}>
              <View style={{ width: 60, height: 60, borderRadius: 50 }} />  
              <View style={{  width: (Layout.width  / 100) * 40, height: 20, borderRadius: 4,top:20 ,left:5}}/>
            </View>            
            
            <View style={{marginTop: 6, width: (Layout.width  / 100) * 90, height:  (Layout.height  / 100) * 10, borderRadius: 4 }} />
            <View style={{ marginTop: 6, width: (Layout.width  / 100) * 30, height: 20, borderRadius: 4 }}/>
          </View>
      </View>
      </SkeletonPlaceholder> 
      :
      <Image source={Images.no_data_bg} style={styles.logo}  resizeMode={'cover'}/>          
    )
  

   // go to summary screen
   goToSummary = (item) =>{  
    this.setState({show_spinner:true})
    NetInfo.fetch().then(async (response) => {
      
      if (response.isConnected && response.isInternetReachable) {

        axios.get(ipConfig.ipAddress + "/get-transaction-history/"+item.reference_no).then((response)=>{                    
          // push to summary screen 
          this.setState({show_spinner:false})
          this.props.navigation.push('SummaryScreen',{transactions:response.data,fullname:item.fullname,current_balance:item.current_balance,voucher_info:item});
        }).catch(err=>{          
          console.warn(err.response)          
        });
      
      }else{
        Popup.show({
          type: 'danger',
          title: 'Message',
          textBody: 'No Internet Connection.Please check your internet connection.',
          buttonText: 'Retry',
          okButtonStyle: styles.confirmButton,
          okButtonTextStyle: styles.confirmButtonText,
          callback: () => {  
            Popup.hide();    
            this.setState({show_spinner:false})                                           
          },
        });
      }
    });
  }

  // show image
  showImage = (uri) => {

    let image_array = [];
    uri.map((item)=>{
      
      image_array.push({
        url:'data:image/jpeg;base64,'+item
      })
    })

    
    this.setState({isShowImage:true,imageURI:image_array})    
  };

  
   leftComponent = () =>(  <Fontisto name="ticket-alt" color={Colors.base} size={30} />)
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
        title    = {item.fullname}
        titleStyle = {{ fontFamily:'Gotham_bold',fontSize:15 }}
        subtitle = {(<View><Text>                 
          <Icon name="clock-o" family="fontawesome" color={Colors.base} size={15} />   
          {'\t'}{'\t'}  

            { !moment(item.transac_date).isSame( moment().startOf('day'), 'day') ? 
                moment(item.transac_date).format('MMMM DD, YYYY, h:mm a')   : 

              (
                <Moment element={Text}    style    = {{color:Colors.muted}}  fromNow>{item.transac_date}</Moment>
              )          
          }          
          </Text></View>)}        
        left     = {this.leftComponent}
        right    = {()=>this.rightComponent(item)}
      />
      
      <Card.Cover source={{uri:'data:image/jpeg;base64,'+item.base64[0]}}          
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
      let get_today_transactions = this.state.vouchers_list ? this.state.vouchers_list.filter((voucher_items)=>
            moment().format('YYYY-MM-DD') == moment(voucher_items.transac_date).format('YYYY-MM-DD') 
          ): [];

      this.setState({selected_filter:item,vouchers_list:get_today_transactions})
    }
  } 

  // render filter button
  renderFilterButtons  = (item) =>(
    <Button
      textStyle={{color:this.state.selected_filter == item ? Colors.light : Colors.fade,fontFamily:'Gotham_light',fontWeight:'bold'}}
      style= {[styles.filter_button_style,{
            borderColor: this.state.selected_filter == item ? Colors.blue_green : Colors.fade,
            backgroundColor:this.state.selected_filter == item ? Colors.blue_green : Colors.light}
          ]}      
      onPress= {()=>this.filterButtonFunction(item)}
    >
      {item + ' (' + (item == 'Today' ? this.state.vouchers_list.filter((voucher_items)=> moment().format('YYYY-MM-DD') == moment(voucher_items.transac_date).format('YYYY-MM-DD') ).length :this.state.total_vouchers ) + ')' }
    </Button>
  )
  render() {

    const filteredVouchers = this.state.vouchers_list.filter(
      createFilter(this.state.search, KEYS_TO_FILTERS)
    );

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
        <Animatable.Text style={styles.greetings} animation="fadeInDownBig" adjustsFontSizeToFit>Hello Merchant <Text style={[styles.greetings,{textTransform:'capitalize'}]}>{this.state.merchant_name}</Text></Animatable.Text>        
        <Animatable.Text style={styles.question} animation="fadeInDownBig" adjustsFontSizeToFit>Find voucher information here.</Animatable.Text>        
        <Fumi
            label={'Search by reference number'}
            labelStyle={styles.search_label}            
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
          data={this.state.vouchers_list ? filteredVouchers : null}
          extraData = {this.state.vouchers_list}
          ListEmptyComponent={this.emptyComponent}
          renderItem={({ item, index }) =>  this.renderItem(item,index)}               
          contentContainerStyle={{flexGrow:0,paddingBottom:90}}
          style={styles.voucher_flatlist}
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
            imageUrls={this.state.imageURI}
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
  logo:{
    width:(Layout.width / 100) *  90,
    height:(Layout.height / 100) * 30,
    alignSelf:'center',        
  },
  card_cover:{    
    width:  100,
    height: 100
  },
  voucher_flatlist:{
    top:(Layout.height/100) * 8,
    width:(Layout.width/100) * 100,   
    height:(Layout.height/100) * 70,    
    backgroundColor:Colors.light,
    flexGrow:0,    
  },
  card: {
    flex: 1,
    borderRadius: 5,            
    borderColor:Colors.fade,
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
    top:(Layout.height/100) * 8,
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
    top:(Layout.height/100) * 2,
    color:Colors.blue_green,    
    left:(Layout.width/100) * 8,
    fontSize:18,      
  },
  question:{
    fontFamily:"Gotham_light",
    fontSize:12,
    top:(Layout.height/100) * 4,
    left:(Layout.width / 100) * 3,
  },
  search_text_input:{
    top:(Layout.height/100) * 5,    
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
    fontFamily:"Gotham_light",
    fontWeight:'bold',
    borderColor:Colors.blue_green,
    color:Colors.light,
    width:(Layout.width / 100) * 25,
  },
  flatlist_filter_buttons:{
    flexGrow:0,     
    top:(Layout.height/100) * 6,
    height:(Layout.height/100) * 5,
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
  search_label:{
    fontFamily:'Gotham_light',
    fontWeight:'bold'
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
  },
});
