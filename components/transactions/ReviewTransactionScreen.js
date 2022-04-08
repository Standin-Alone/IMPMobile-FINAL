import React, {Component} from 'react';
import {View,Text, StyleSheet,FlatList,Image,Modal,BackHandler,TouchableOpacity} from 'react-native';
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
import ImageViewer from "react-native-image-zoom-viewer";
import Spinner from 'react-native-spinkit';
import {  Popup} from 'react-native-popup-confirm-toast';
import Carousel from 'react-native-snap-carousel';
import DeviceInfo from 'react-native-device-info';
import BackgroundTimer from 'react-native-background-timer';
import { constants } from 'fs';
export default class ReviewTransactionScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {          
        params:this.props.route.params,
        showImage:false,
        imageURI:'',
        image_name:'',
        show_spinner:false
                
    };

    
  
  }

  handleGoBack = () => {
 
    this.props.navigation.goBack();
  }

  // show image
  showImage = (uri,item_name) => {      
      this.setState({showImage:true,imageURI:uri,image_name:item_name});      
  };
  
  
  // render item

  renderItem = (item, index) => (
    
      <Card elevation={5} style={styles.card}>
        <Card.Title
          title={(item.item_category != '' ? item.item_category : item.name)  + " (" + item.quantity + item.unit_measure + ")"}
          left={() => (
            <Image
              source={{ uri: "data:Image/jpeg;base64," + item.image }}
              style={styles.commodity_image}
            />
          )}
          subtitle={
            <NumberFormat
              value={item.total_amount}
              displayType={"text"}
              decimalScale={2}
              prefix={'₱'}
              thousandSeparator={true}            
              renderText={(result, props) => this.renderCommodityAmount(result)}
            />
          }
          
          titleStyle={{ fontFamily: "calibri-light", fontWeight: "bold",fontSize:12 }}
          
        />
        <Card.Content style={{marginTop:20}}>  
          {item.status == "error" ? (
            <Text style={styles.spiel}> {item.message} </Text>
            ) : null}
        </Card.Content>
      </Card>    
  );


    // render attachments

    renderAttachments = (item, index) => (

      item.name == 'Valid ID' ? 
      (      

        <View   style={{flexDirection:'row'}}>  
        <TouchableOpacity onPress={() => this.showImage(item.file[0].front,item.name+' (Front)')}>
          <Image
            source={{uri: "data:image/jpeg;base64," + item.file[0].front}}
            style={styles.attachments_cover}
          />                  
        </TouchableOpacity >                
        <TouchableOpacity onPress={() => this.showImage(item.file[0].back,item.name+' (Back)')}>
          <Image
            source={{uri: "data:image/jpeg;base64," + item.file[0].back}}
            style={styles.attachments_cover}
          />        
        </TouchableOpacity >                
        </View>
      
      ): item.name == 'Other Documents' ? 

      item.file.map(item_other_documents=>    
      (
        <TouchableOpacity onPress={() => this.showImage(item_other_documents,item.name)}>
          <Image
            source={{uri: "data:image/jpeg;base64," + item_other_documents}}
            style={styles.attachments_cover}
          />           
        </TouchableOpacity>
      )    
      )
   
      :
      
      (       

        <TouchableOpacity onPress={() => this.showImage(item.file,item.name)}>
          <Image
            source={{uri: "data:image/jpeg;base64," + item.file}}
            style={styles.attachments_cover}          
          />         
       </TouchableOpacity>
      )


  );

  renderTotalAmountText = (result)=>(
    <Text style={styles.total_amount}>
      PHP {result}
    </Text>
  )

  renderCommodityAmount = (result)=>(
    <Text style={styles.commodity_amount}>
       {result}
    </Text>
  )

  // transact voucher button
  handleGetTransact = () =>{
    let self = this;
    let formData = new FormData();
    this.setState({show_spinner:true});  
    let voucher_info = {
      voucher_id          : this.state.params.voucher_info.voucher_id,      
      reference_no        : this.state.params.voucher_info.reference_no,
      rsbsa_no            : this.state.params.voucher_info.rsbsa_no,
      supplier_id         : this.state.params.supplier_id,
      fund_id             : this.state.params.voucher_info.fund_id,
      user_id             : this.state.params.user_id,
      full_name           : this.state.params.full_name,
      current_balance     : this.state.params.voucher_info.amount_val,      
      latitude            :this.state.params.latitude,
      longitude           :this.state.params.longitude,
      program             : this.state.params.voucher_info.shortname,
      one_time_transaction:this.state.params.one_time_transaction,
      cash_added          : this.state.params.cash_added,
      

    };
    formData.append("voucher_info", JSON.stringify(voucher_info));
    formData.append("commodity", JSON.stringify(this.state.params.cart));
    formData.append("attachments", JSON.stringify(this.state.params.attachments));


    // check if internet connection is back again
    NetInfo.fetch().then((state)=>{ 
     
      if(state.isConnected && state.isInternetReachable){

      // check imp mobile application version
      axios.get(ipConfig.ipAddress + '/check_utility/' + DeviceInfo.getVersion()).then(async response => {
        
        // close app if  maintenenace
        if (response.data['maintenance'] == '1') {

          this.setState({show_spinner:false});              
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

          this.setState({show_spinner:false});              
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
       
      // SHOW CONFIRMATION
      Popup.show({
        type: 'confirm',
        title: 'Warning',
        textBody: 'Do you want submit your transaction?',        
        buttonText: 'CONFIRM',
        confirmText:'Cancel',                                 
        callback: () => {

          this.setState({show_spinner:true});
          Popup.hide()                 
          
          // get transact        
          setTimeout(()=>{

            axios
            .post(ipConfig.ipAddress+ "/submit-voucher", formData)
            .then((response) => {       
              
              console.warn(response.data[0].Message)
              if(response.data == 'success'){
                this.setState({show_spinner:false});
                Popup.show({
                  type: 'success',              
                  title: 'Message',
                  textBody: 'Transaction Complete',                
                  buttonText:"Go back to home.",
                  okButtonStyle:styles.confirmButton,
                  okButtonTextStyle: styles.confirmButtonText,
                  callback: () => {    
                                
                    Popup.hide()                 
                                        
                    BackgroundTimer.clearTimeout(this.state.params.time);         
                    this.props.navigation.reset({
                      index: 0,
                      routes: [{ name: 'Root' }]
                    });
    
                  },              
                })
          
              } else  if(response.data == 'claimed'){

                Popup.show({
                  type: 'danger',              
                  title: 'Message',
                  textBody: "This voucher is already fully claimed.",                
                  buttonText:'Ok',
                  okButtonStyle:styles.confirmButton,
                  okButtonTextStyle: styles.confirmButtonText,
                  callback: () => {    
                    this.setState({show_spinner:false});    
                    
                    BackgroundTimer.clearTimeout(this.state.params.timer);                          
                    Popup.hide()      

                    this.props.navigation.reset({
                      index: 0,
                      routes: [{ name: 'Root' }]
                    });                              
                  },              
                })
              }else{  
            
                this.setState({show_spinner:false});
                Popup.hide();
                
                Popup.show({
                  type: 'danger',
                  title: 'Message',
                  textBody: 'Error uploading due to unstable connection. Please try again.',
                  buttonText: 'Okay',
                  okButtonStyle: styles.confirmButton,
                  okButtonTextStyle: styles.confirmButtonText,
                  callback: () => {  
                    Popup.hide();
                  },
                });
              } 
            })
            .catch(function (error) {   
              self.setState({show_spinner:false});
              console.warn(error.response)                                                    
            });  
          },2000)
            
          
        },
        okButtonStyle:styles.confirmButton,
        okButtonTextStyle: styles.confirmButtonText
      
      })
    }

    }).catch(err => { 
          console.warn(err.response)  
          self.setState({show_spinner:false});
    });

  }else{
    Popup.show({
      type: 'danger',
      title: 'Message',
      textBody: 'No internet connection. Please check your internet connectivity.',
      buttonText: 'Okay',
      okButtonStyle: styles.confirmButton,
      okButtonTextStyle: styles.confirmButtonText,
      callback: () => {  
        Popup.hide();
      },
    });
  }
  });
  }

  
  render() {
 
    return (
      <View  style={styles.container}>     

      
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
        
           
         <LinearGradient colors={['#A9F99E', Colors.green, Colors.blue_green]} style={styles.cover}>
          <FontAwesomeIcon name="arrow-left" color={Colors.light} style={styles.go_back} size={30} onPress={this.handleGoBack}/>          
            <Text style={styles.screenTitle}>Review Transaction</Text>
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

      <View style={{ flexDirection:'row',top:(Layout.height /100) * 15 }}>            
          <View style={{  left:20 }}>
            <Text style={{ fontFamily:'Gotham_bold' }}>
              Birthday:              
            </Text>
          </View>
        <View style={{flex:1, alignItems:'flex-end',right:20 }}>
          <Text  style={{ fontFamily:'Gotham_bold' }} >                       
            <Moment element={Text} format={'MMMM DD, YYYY'}>{this.state.params.voucher_info.birthday}</Moment>            
          </Text>
        </View>            
      </View>



      <FlatList
          horizontal
          data={this.state.params.attachments}
          extraData={this.state.params.attachments}
          style={styles.flat_list_attachment}
          
          contentContainerStyle={styles.flat_list_attachment_content}
          renderItem={({ item, index }) => this.renderAttachments(item, index)}
          keyExtractor={(item) => item.name}
        />


      <Animatable.Text animation="slideInLeft" numberOfLines={2} style={styles.cart}><FontAwesomeIcon name="info-circle" color={Colors.blue_green} size={16}/> Farmers' Cart { '('+this.state.params.cart.length +  (this.state.params.cart.length > 1 ? ' Items)': ' item)')}</Animatable.Text>        
      <FlatList
          horizontal
          data={this.state.params.cart}
          extraData={this.state.params.cart}
          style={styles.flat_list}
          contentContainerStyle={styles.flat_list_content}
          
          renderItem={({ item, index }) => this.renderItem(item, index)}
          keyExtractor={(item,index) => index}
        />

      

          
      <View style={{flex: 1}}>

        
        <View style={{position: 'absolute', left: 0, right: 0, bottom: 0}}>


        
          <Text style={styles.total_amount_title}>
              Total Amount:
          </Text>

          <NumberFormat
              value={this.state.params.total_amount}
              displayType={"text"}
              decimalScale={2}
              thousandSeparator={true}     
              
              renderText={(result, props) => this.renderTotalAmountText(result)}
            />
        
        {/* view attachments modal */}
        <LinearGradient colors={['#80ff72','#7ee8fa']}    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.next_btn}>

          
          <Button
            textStyle={styles.next_txt}
            style={{ borderWidth:0 }}
            activityIndicatorColor={Colors.light}
            activeOpacity={100}
            isLoading={this.state.isLoading}
            disabledStyle={{opacity: 1}}    
            onPress = {this.handleGetTransact}        
            >
              Submit
          </Button>
          </LinearGradient>
        </View>
      </View>
      <Modal
          visible={this.state.showImage}
          transparent={true}
          onRequestClose={() => this.setState({showImage:false})}
          animationType="fade"
        >
          <ImageViewer
            imageUrls={[{ url: "data:image/jpeg;base64," + this.state.imageURI }]}
            index={0}

            renderIndicator={(currentIndex, allSize) => ( 
            <Text style={styles.render_indicator}> 
                {currentIndex + '/' + allSize} 
            </Text> )}            
            renderHeader={()=>(
                <View style={styles.image_viewer}>
                    <Text style={styles.image_viewer_header}>{this.state.image_name}</Text>
                    
                </View>
            )}
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
  flat_list:{
    top: (Layout.height / 100 ) * 25,    
    marginBottom:100,
    overflow:'scroll'
  },
  flat_list_content:{
    height: (Layout.height / 100 ) * 16,    
    flexDirection:'row',
    justifyContent:'space-between',
    overflow:'scroll'
  },
  commodity_image: {
    
    width: (Layout.width / 100 ) * 10,
    height: '100%',
    justifyContent:'center',
    overflow: "hidden",    
    
  },
  card: {
    marginTop: (Layout.height / 100 ) * 2,
    marginHorizontal: (Layout.width / 100 ) * 2,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth:1,
    height:(Layout.height / 100 ) * 10,
    borderColor:Colors.blue_green
  },
  flat_list_attachment:{
    top: (Layout.height / 100 ) * 20,            
    height: (Layout.height / 100 ) * 10,     
    left:(Layout.width / 100 ) * 1,
  },
  flat_list_attachment_content:{    
    overflow:'scroll'
  },
  card_attachment: {    
    marginHorizontal: (Layout.width / 100 ) * 2,
    marginBottom: 10,    
    borderRadius: 10,
    borderWidth:1,
    height:(Layout.height / 100 ) * 20,
    width:(Layout.width / 100 ) * 94,  
    borderColor:Colors.blue_green
  },
  attachments_cover:{
    top: (Layout.height / 100 ) * 5,   
    height:(Layout.height / 100 ) * 15,
    width:(Layout.width / 100 ) * 25,       
    marginHorizontal:5,
    borderRadius:20
  },
  card_attachments_title:{ 
    fontFamily: "Gotham_bold",     
    fontSize:16,
    left:20,
    alignSelf:'center'
  },
  cover:{
    height:(Layout.height / 100 ) * 16,    
    
    borderBottomLeftRadius:35,
    borderBottomRightRadius:35
  },
  logo:{    
    width:150,
    height:150,
    top:(Layout.height / 100) * 5,
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
    color:Colors.header_text
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
    left: (Layout.width / 100) * 1,
    top:(Layout.height / 100) * 20,
    color:Colors.dark
  },
  cart:{
    fontFamily:'Gotham_bold',
    fontSize:16,    
    left: (Layout.width / 100) * 1,
    top:(Layout.height / 100) * 25,
    color:Colors.dark
  },
  next_btn:{        
    width: (Layout.width / 100) * 40,
    left: (Layout.width / 100) * 55,
    height: (Layout.width / 100) * 9,
    bottom:(Layout.height / 100) * 1,
    borderRadius:10,
    
    backgroundColor:'red',
    borderWidth:0,
  },
  next_txt:{
    
    color:Colors.light,    
    fontFamily:'Gotham_bold',
  },
  total_amount_title:{
    top:(Layout.height / 100) * 2,
    left:5,
    fontFamily:'Gotham_bold',
    fontSize:12,    
  },
  total_amount:{
    top:(Layout.height / 100) * 2,
    left:5,
    fontFamily:'Gotham_bold',
    color:Colors.blue_green,
    fontSize:18,    
  },
  commodity_amount:{
    top:(Layout.height / 100) * 4,
    left:5,
    fontFamily:'Gotham_bold',
    color:Colors.muted,
    fontSize:12,    
  },
  go_back:{
    top:(Layout.height / 100) * 2,      
    left: (Layout.width / 100) * 5,
    position:'absolute'
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
  },
  image_viewer:{
    backgroundColor:'',
    flexDirection:"row",
    top:(Layout.height / 100) * 5,
    left:(Layout.width / 100) * 5
  },
  image_viewer_header:{
    
    fontFamily:'Gotham_bold',
    color:Colors.light,
    fontSize:18,   
    
    
  },
  render_indicator:{ 
    alignSelf: 'center', 
    position: 'absolute' ,
    fontFamily:'Gotham_bold',
    color:Colors.light,
    fontSize:18,  
    top:(Layout.height / 100) * 90
  },
  screenTitle:{
    top:(Layout.height / 100) * 2,      
    textAlign:'center',
    fontFamily:"Gotham_bold",
    fontSize:20,
    color:Colors.light
  }
});
