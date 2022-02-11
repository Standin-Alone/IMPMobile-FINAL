import React, {Component} from 'react';
import {View,Text, StyleSheet,FlatList,Image,Modal} from 'react-native';
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
export default class ReviewTransactionScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {          
        params:this.props.route.params,
        showImage:false,
        imageURI:'',
        show_spinner:false
                
    };

    
  
  }

  handleGoBack = () => {
    this.props.navigation.goBack();
  }

  // show image
  showImage = (uri: any) => {      
      this.setState({showImage:true,imageURI:uri});      
  };
  
  
  // render item

  renderItem = (item, index) => (
    
      <Card elevation={20} style={styles.card}>
        <Card.Title
          title={item.name + " (" + item.quantity + item.unit_measure + ")"}
          left={() => (
            <Image
              source={{ uri: "data:Image/jpeg;base64," + item.image }}
              style={styles.commodity_image}
            />
          )}
          subtitle={"₱" + parseFloat(item.total_amount)}
          
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

      <View style={{flex:1,flexDirection:'row'}}>
      <Card elevation={20} 
            style={styles.card_attachment}
            onPress={() => this.showImage(item.file[0].front)}>
        <Card.Title
          title={item.name +' (Front)' }                        
          titleStyle={styles.card_attachments_title}          
        />
        <Card.Cover source={{uri: "data:image/jpeg;base64," + item.file[0].front}} resizeMode='contain' style={[styles.attachments_cover]}/>
      </Card>      

      <Card elevation={20} 
            style={styles.card_attachment}
            onPress={() => this.showImage(item.file[0].back)}
      >
        <Card.Title
          title={item.name  +' (Back)' }                      
          titleStyle={styles.card_attachments_title}          
        />
        <Card.Cover source={{uri: "data:image/jpeg;base64," + item.file[0].back}} resizeMode='contain' style={[styles.attachments_cover]}/>
      </Card>      

      </View>

      
      ):(

        <Card elevation={20} 
              style={styles.card_attachment}
              onPress={() => this.showImage(item.file)}>
        <Card.Title
          title={item.name}                            
          titleStyle={styles.card_attachments_title}          
        />
        <Card.Cover source={{uri: "data:image/jpeg;base64," + item.file}} resizeMode='contain' style={[styles.attachments_cover]}/>
      </Card>    
      )


  );

  renderTotalAmountText = (result)=>(
    <Text style={styles.total_amount}>
      PHP {result}
    </Text>
  )

  // transact voucher button
  handleGetTransact = () =>{
    
    let formData = new FormData();
    let voucher_info = {
      reference_no: this.state.params.voucher_info.reference_no,
      rsbsa_no: this.state.params.voucher_info.rsbsa_no,
      supplier_id: this.state.params.supplier_id,
      fund_id: this.state.params.voucher_info.fund_id,
      user_id: this.state.params.user_id,
      full_name: this.state.params.full_name,
      current_balance: this.state.params.voucher_info.amount_val,      
      latitude:this.state.params.latitude,
      longitude:this.state.params.longitude,
      program: this.state.params.voucher_info.shortname

    };
    formData.append("voucher_info", JSON.stringify(voucher_info));
    formData.append("commodity", JSON.stringify(this.state.params.cart));
    formData.append("attachments", JSON.stringify(this.state.params.attachments));

    Popup.show({
      type: 'confirm',
      title: 'Warning',
      textBody: 'Do you want submit your transaction?',
      
      buttonText: 'CONFIRM',
      confirmText:'Cancel',                                 
      callback: () => {

        
        Popup.hide()                 
        this.setState({show_spinner:true});
        // get transact

      

        setTimeout(()=>{

          axios
          .post(ipConfig.ipAddress+ "/submit-voucher-cfsmff", formData)
          .then((response) => {       
          
                
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
                                               
                  this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Root' }]
                  });
  
                },              
              })
        
            }else{
              this.setState({show_spinner:false});
              Popup.hide();
              alert("Error uploading due to unstable connection. Please try again.*");
            } 
          })
          .catch(function (error) {          
            this.setState({show_spinner:false});
            alert("Error occured!." + error.response);
            
          });  
        },2000)
           
        
      },
      okButtonStyle:styles.confirmButton,
      okButtonTextStyle: styles.confirmButtonText
    
    })






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
          keyExtractor={(item) => item.name}
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
      
          <Button
            textStyle={styles.next_txt}
            style={styles.next_btn}
            activityIndicatorColor={Colors.light}
            activeOpacity={100}
            isLoading={this.state.isLoading}
            disabledStyle={{opacity: 1}}    
            onPress = {this.handleGetTransact}        
            >
              Submit
          </Button>
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
    overflow:'scroll'
  },
  commodity_image: {
    top: (Layout.height / 100 ) * 1,
    right:20,
    height: 60,
    width: 60,
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
    top: (Layout.height / 100 ) * 22,            
    height: (Layout.height / 100 ) * 10,     
  },
  flat_list_attachment_content:{

    overflow:'scroll'
  },
  card_attachment: {    
    marginHorizontal: (Layout.width / 100 ) * 2,
    marginBottom: 10,    
    borderRadius: 10,
    borderWidth:1,
    height:(Layout.height / 100 ) * 5,
  
    borderColor:Colors.blue_green
  },
  attachments_cover:{
    width:100,
    height:100
  },
  card_attachments_title:{ 
    fontFamily: "calibri-light", 
    fontWeight: "bold",
    fontSize:8,
    alignSelf:'center'
  },
  cover:{
    height:150,
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
    borderColor: Colors.green,
    backgroundColor: Colors.green,    
  },
  next_txt:{
    color:Colors.light,    
    fontFamily:'Gotham_bold',
  },
  total_amount_title:{
    top:(Layout.height / 100) * 4,
    left:5,
    fontFamily:'Gotham_bold',
    fontSize:12,    
  },
  total_amount:{
    top:(Layout.height / 100) * 4,
    left:5,
    fontFamily:'Gotham_bold',
    color:Colors.blue_green,
    fontSize:18,    
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
  }
});
