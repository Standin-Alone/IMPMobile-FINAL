import React, {Component} from 'react';
import {View,Text, StyleSheet,FlatList,Image,Pressable} from 'react-native';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
// import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { FontAwesomeIcon}  from '@fortawesome/react-native-fontawesome'
import { faCartPlus,faEdit,faInfoCircle} from '@fortawesome/free-solid-svg-icons'
import Icon from 'react-native-vector-icons/FontAwesome';
import { Card } from 'react-native-paper';
import NumericInput from "react-native-numeric-input";
import Button from 'apsl-react-native-button';
import NumberFormat from 'react-number-format';
import Swipeable from "react-native-gesture-handler/Swipeable";
import {  Popup} from 'react-native-popup-confirm-toast';
import NetInfo from "@react-native-community/netinfo";
import axios from 'axios';
import * as ipConfig from '../../ipconfig';
import Spinner from 'react-native-spinkit';
import Modal from "react-native-modal";
import FakeCurrencyInput from 'react-native-currency-input';
export default class ViewCartScreen extends Component {  
  constructor(props:any) {
    super(props);
    this.state = {          
        params:this.props.route.params,     
        data:[],
        total:0,
        new_data:[],
        show_spinner:false,
        show_edit_modal:false,
        edit_total_amount_value:0,
        refreshing:false
    };

       
    this.props.navigation.setOptions( ()=>({
      headerTransparent:true,
      headerTitle:"My Cart",
      headerTitleStyle:{fontFamily:'Gotham_bold'},
      headerRight: () => (
          // go to selected commodity screen
        <Pressable          
        onPress={  () => {                                      
            
            
          
        }}
        style={({ pressed }) => ({
          opacity: pressed ? 0.5 : 1,    
          right:(Layout.width / 100 ) * 10        
        })}>
        
        <FontAwesomeIcon icon={faCartPlus} size={25} color={Colors.green}  transform="fa-fade"  />       
      </Pressable>
      ),
  }))

  }

  
  async refreshCart(nextProps){
  
    await this.setState({data:nextProps.route.params.cart,total:  Number(nextProps.route.params.cart.reduce((prev, current) => prev + parseFloat(current.total_amount), 0)).toFixed(2)});       
        
 }

  componentDidMount() {
    
    // header options
      this.props.navigation.setOptions({
        headerTransparent:true,
        headerTitle:"My Cart",
        headerTitleStyle:{fontFamily:'Gotham_bold'},
        headerRight: () => (
          // go to selected commodity screen
          
          <Pressable          
          onPress={  () => {                  
            
            this.props.navigation.navigate('CommodityScreen',this.state.params);
          }}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,    
            right:(Layout.width / 100 ) * 10        
          })}>          
          <FontAwesomeIcon icon={faCartPlus} size={25} color={Colors.green}  transform="fa-fade"  />       
        </Pressable>
        ),
  })

  this.setState({data:this.state.params.cart,total:  Number(this.state.params.cart.reduce((prev, current) => prev + parseFloat(current.total_amount), 0)).toFixed(2)});    
           
  }

  componentWillReceiveProps(nextProps){
    this.refreshCart(nextProps)
  }

 
  // delete item function
  rightContent = (delete_index : any,item : any) => (
    <View style={{ top:(Layout.height / 100) * 5}}>
      <Icon
        name="trash"
        family="entypo"
        color={Colors.danger}
        size={50}
        onPress={() => {

          
          let new_data = this.state.data;
          console.warn(delete_index);
          // remove delete 
          new_data.splice(delete_index, delete_index + 1);
          
          this.setState({new_data:new_data,total:Number(new_data.reduce((prev, current) => prev + parseFloat(current.total_amount), 0)).toFixed(2)});
          this.setState({show_spinner:true});

          if(new_data.length  == 0){
            
            // check internet connection                            
            NetInfo.fetch().then((response)=>{

              if(response.isConnected && response.isInternetReachable){

              let payload = {
                  cart:[item]
              }

              // save to cart as draft
              axios.post(ipConfig.ipAddress+'/delete-cart',payload).then((response)=>{              
                
                  this.state.params.return_cart(new_data)
                  this.setState({show_spinner:false});
                  this.props.navigation.goBack();                  
                  

              }).catch(err=>{
                console.warn(err) 
                this.setState({show_spinner:false});
              });

              }else{
                Popup.show({
                  type: 'danger',
                  title: 'Error!',
                  textBody: 'No internet connection. Please check your internet connectivity.',
                  buttonText: 'Ok',
                  okButtonStyle: styles.confirmButton,
                  okButtonTextStyle: styles.confirmButtonText,
                  callback: () => {
                    
                    Popup.hide();                    
                  },
                });
                this.setState({show_spinner:false});
              }
            });
          }else{
            this.setState({show_spinner:false});
          }          
        }}
      />
  
    </View>
  );

  // quantity function 
  handleQuantity =    async (item,index,value)=> {
    var total_amount = parseFloat(item.total_amount);
 
          console.warn(value);
      
      this.setState((prevState) => {
        
        if (prevState.data[index].name == item.name) {
          prevState.data[index].total_amount = total_amount;
          prevState.data[index].quantity = value.toString().includes('-') ? 0.00 : value;
          prevState.data[index].status = "success";
          
        }
      },
      ()=>{

        this.setState({total: this.state.data.reduce((prev, current) => prev + parseFloat(current.total_amount), 0).toFixed(2)})
      }
      
      );
      

        
    
    

  }
  
  // quantity
  numericInput = (item, index) => (
    <NumericInput
      // editable={FarmerProfileScreen}
      value={item.quantity}
      onChange={(value) =>this.handleQuantity(item,index,value)}
      minValue={1}
      maxValue={99999}
      totalWidth={150}
      totalHeight={40}
      iconSize={25}
      initValue={item.quantity}
      step={0.1}
      valueType="real"
      rounded
      iconStyle={{ color: "white" }}
      containerStyle={{right:(Layout.width / 100) * 41,bottom:(Layout.height / 100) * 2,position:'absolute'}}
      rightButtonBackgroundColor={Colors.light_green}
      leftButtonBackgroundColor={Colors.light_green}
    />
  );

  update_total_amount = (item,index)=>{
    this.setState((prevState) => {
                
      if (prevState.data[index].name == item.name) {
        prevState.data[index].total_amount = this.state.edit_total_amount_value;
    
        
      }
    },
    ()=>{

      this.setState({total: this.state.data.reduce((prev, current) => prev + parseFloat(current.total_amount), 0).toFixed(2)})
    }
    
    );
    this.setState({show_edit_modal:false})

  }


  cancel_button = ()=>{
    this.setState({show_edit_modal:false})
  }


  // render item
  renderItem = (item, index) => (
    <Swipeable renderRightActions={() => this.rightContent(index,item)}>             
      <Card elevation={20} style={styles.card}>
        <Card.Title
          title={(item.item_category != '' ? item.item_category : item.name) + " (" + item.unit_measure + ")"}          
          left={() => (
            <Image
              source={{ uri: "data:Image/jpeg;base64," + item.image }}
              style={styles.commodity_image}
              resizeMode={'contain'}
            />
          )}
          subtitle={       
                      
          <NumberFormat
            value={item.total_amount}
            displayType={"text"}
            decimalScale={2}
            thousandSeparator={true}                
            renderText={(values) => (
              <Text style={{
                fontFamily: "calibri-light",
                color: Colors.base,
                fontSize: 15,
              }} adjustsFontSizeToFit>                              
                ₱{values} 
              </Text>
            )}
          />
          }
          
          titleStyle={{ fontFamily: "Gotham_bold", fontWeight: "bold",fontSize:15 }}          
        />
        <Card.Content style={{marginTop:20,marginLeft:(Layout.height / 100 ) * 40}}>  

        {/* quantity component */}
        {this.numericInput(item, index)}

        {/* edit price button */}
        <Pressable          
          onPress={  () => {                        
              this.setState({show_edit_modal:true,edit_item:item,edit_index:index,edit_total_amount_value:item.total_amount});
          }}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            
          })}>
          <FontAwesomeIcon icon={faEdit} size={20} color={Colors.dark_blue} style={{left:20}} transform="fa-fade"  />       
        </Pressable>
        </Card.Content>
      </Card>
    </Swipeable>
  );


// check out button
handleCheckOut = ()=>{
  this.setState({show_spinner:true});
  let dataToSend = {
    voucher_info: this.state.params.voucher_info[0],
    cart:this.state.data,
    total_amount:this.state.total,
    supplier_id: this.state.params.supplier_id,
    full_name: this.state.params.full_name,
    user_id: this.state.params.user_id
  }



  let count_error= 0 ;

  this.state.data.map(prevState => prevState.status  == 'error' ? count_error++ : 0);
  
  // check internet connection
  NetInfo.fetch().then((response)=>{
        
  if(response.isConnected && response.isInternetReachable){

  if (count_error == 0 ){
    // THIS CONDITION IS FOR ONE TIME TRANSACTION ONLY
      
    let total_float = parseFloat(this.state.total);
    let available_balance_float = parseFloat(this.state.params.available_balance);
    // condition for other program that has one time transaction
    if((total_float >= available_balance_float) && dataToSend.voucher_info.one_time_transaction == '1'   && this.state.data.some(item => item.quantity != 0) ){
      
      let data = {
        cart:this.state.data
      }
          
        // update cart
        axios.post(ipConfig.ipAddress+'/checkout-update-cart',data).then((response)=>{              
          let result = response.data['message'];
          if(result == 'true'){
            this.props.navigation.navigate('AttachmentScreen',dataToSend);
          }else{
            console.warn(response.data);
          }
          this.setState({show_spinner:false});
        }).catch(err=>{
          console.warn(err)
          this.setState({show_spinner:false});
        });
          

    }else if (this.state.data.some(item => item.quantity <= 0)){
      Popup.show({
        type: 'danger',
        title: 'Message',
        textBody: 'Quantity of the commodity cannot be 0. Please check your items in cart.',
        buttonText: 'Okay',
        okButtonStyle: styles.confirmButton,
        okButtonTextStyle: styles.confirmButtonText,
        callback: () => {  
          Popup.hide();
          this.setState({show_spinner:false});
        },
      });
    }
    // condition for cash and food
    else if ((total_float >= available_balance_float) && dataToSend.voucher_info.one_time_transaction == '0'   && this.state.data.some(item => item.quantity != 0) ){
        let data = {
          cart:this.state.data
        }
          
        // update cart
        axios.post(ipConfig.ipAddress+'/checkout-update-cart',data).then((response)=>{              
          let result = response.data['message'];
          
          if(result == 'true'){
            this.props.navigation.navigate('AttachmentScreen',dataToSend);
          }
          this.setState({show_spinner:false});
        }).catch(err=>{
          console.warn(err)
          this.setState({show_spinner:false});
        });
    }else{      

      
      Popup.show({
        type: 'warning',              
        title: 'Message',
        textBody: `You have still remaining balance of ₱${(this.state.params.available_balance - this.state.total) < 0 ? 0.00 :  (this.state.params.available_balance - this.state.total).toFixed(2)}`,                
        buttonText:"I understand",
        okButtonStyle:styles.confirmButton,
        okButtonTextStyle: styles.confirmButtonText,
        callback: () => {
          this.setState({show_spinner:false});                  
          Popup.hide()                                              
        },              
      })

    }
  } 

  }else{
    this.setState({show_spinner:false}); 
    Popup.show({
      type: 'danger',
      title: 'Message',
      textBody: 'No internet connection.Please check your internet connectivity.',
      buttonText: 'Okay',
      okButtonStyle: styles.confirmButton,
      okButtonTextStyle: styles.confirmButtonText,
      callback: () => {  
        Popup.hide();
      },
    });

  }}); 
  
} 

// START RENDER HERE
 
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



        {/* Items Flatlist */}
        <FlatList
          nestedScrollEnabled
          refreshing={this.state.refreshing}
          data={this.state.data}
          extraData={this.state.new_data}
          style={styles.flat_list}
          contentContainerStyle={{paddingBottom:90}}
          renderItem={({ item, index }) => this.renderItem(item, index)}
          keyExtractor={(item,index) => index}
        />


        {/* edit total amount modal */}
        <Modal isVisible={this.state.show_edit_modal}>
                <View style={{  width:(Layout.width / 100) * 90, height:(Layout.height / 100) * 20,backgroundColor:Colors.light,borderRadius:20,}}>
                  <Text style={styles.edit_total_amount_label}>Edit Total Amount</Text>
                </View>
                <FakeCurrencyInput
                  value={this.state.edit_total_amount_value}
                  onChangeValue={(value)=>{                                  
                    this.setState({edit_total_amount_value:value})
                  }}
                  prefix="₱"
                  delimiter=","
                  separator="."
                  precision={2}          
                  style={[
                    styles.amount,
                    {
                      borderColor:
                        this.state.focus_amount == true
                          ? Colors.light_green
                          : this.state.error == true 
                          ? Colors.danger
                          : Colors.light,
                    },
                  ]}           
                />

                
                <View style={{flexDirection:"row",bottom:(Layout.height / 100) * 14}}>
                  <Button
                      textStyle={styles.update_button_txt}
                      style={styles.cancel_button}
                      activityIndicatorColor={'white'}
                      isLoading={this.state.isLoading}
                      disabledStyle={{opacity: 1}}      
                      onPress={this.cancel_button}           
                    >
                    Cancel
                  </Button> 
                    <Button
                      textStyle={styles.update_button_txt}
                      style={styles.update_button}
                      activityIndicatorColor={'white'}
                      isLoading={this.state.isLoading}
                      disabledStyle={{opacity: 1}}                 
                      onPress={()=>this.update_total_amount(this.state.edit_item,this.state.edit_index)}
                    >
                    Update
                  </Button>  
                </View>
              </Modal>
       
        

      <View style={{flex: 1}}>
         {/* Cart Summary Details */}
         <Card style={styles.cart_details} elevation={1}>
        <Card.Title title={" Details"} titleStyle={styles.details_title} left={()=><FontAwesomeIcon icon={faInfoCircle} size={25} color={Colors.blue_green}  transform="fa-fade"  />       }/>
        <Card.Content>
          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detail_info_title} adjustsFontSizeToFit>Voucher Balance:</Text>
            </View>
            <View style={{ flex: 1 }}>

            <NumberFormat
                  value={this.state.params.available_balance}
                  displayType={"text"}
                  decimalScale={2}
                  thousandSeparator={true}                
                  renderText={(values) => (
                    <Text style={styles.detail_info_value} adjustsFontSizeToFit>                              
                      ₱{values}
                    </Text>
                  )}
                />
              
            </View>
          </View>

          <View style={{ flexDirection: "row", marginBottom: 5 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detail_info_title}  adjustsFontSizeToFit>Total:</Text>
            </View>
            <View style={{ flex: 1 }}>
              <NumberFormat
                  value={this.state.total}
                  displayType={"text"}
                  decimalScale={2}
                  thousandSeparator={true}                
                  renderText={(values) => (
                    <Text style={styles.detail_info_value} adjustsFontSizeToFit>                              
                      ₱{values}
                    </Text>
                  )}
              />
              
            </View>
          </View>

          <View style={{ flexDirection: "row", marginBottom: 5 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detail_info_title} adjustsFontSizeToFit>
                - - - - - - - - - - - - - - - - - - - - - - - - - 
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", marginBottom: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detail_info_title} adjustsFontSizeToFit>Remaining Balance:</Text>
            </View>
            <View style={{ flex: 1 }}>
            <NumberFormat
                  value={(this.state.params.available_balance - this.state.total) < 0 ? 0.00 :  (this.state.params.available_balance - this.state.total) }
                  displayType={"text"}
                  decimalScale={2}
                  thousandSeparator={true}   
                  fixedDecimalScale={true}             
                  renderText={(values) => (
                    <Text style={styles.remaining_balance} adjustsFontSizeToFit>                              
                      ₱{values}
                    </Text>
                  )}
              />
              
            </View>
          </View>

          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detail_info_title} adjustsFontSizeToFit>Additional Payment:</Text>
            </View>
            <View style={{ flex: 1 }}>
            <NumberFormat
                  value={(this.state.params.available_balance - this.state.total) < 0 ? (this.state.total -this.state.params.available_balance  ) : 0.00 }
                  displayType={"text"}
                  decimalScale={2}
                  thousandSeparator={true}   
                  fixedDecimalScale={true}             
                  renderText={(values) => (
                    <Text style={styles.additional_payment} adjustsFontSizeToFit>                              
                      ₱{values}
                    </Text>
                  )}
              />
              
            </View>
          </View>


        </Card.Content>
      </Card>
        <View style={{position: 'absolute', left: 0, right: 0, bottom: 0}}>
       

          
        <Button
            textStyle={styles.next_txt}
            style={styles.next_btn}
            activityIndicatorColor={'white'}
            isLoading={this.state.isLoading}
            disabledStyle={{opacity: 1}} 
            onPress = {this.handleCheckOut}               
          >
           Checkout
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
  flat_list:{
    top: (Layout.height / 100 ) * 10,
    height:(Layout.height/100) * 5, 
    
  },
  card: {
    marginTop: (Layout.height / 100 ) * 2,
    marginHorizontal: (Layout.width / 100 ) * 1,
    borderWidth:1,
    marginBottom: 10,
    borderRadius: 10,
  },
  amount: {
    width: (Layout.width / 100) * 84,    
    bottom: (Layout.height / 100) * 15,    
    left: (Layout.width / 100) * 4,
    fontFamily: 'Gotham_bold',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#F7F7F7',
    color:Colors.green,
    fontSize: 20,
  },
  commodity_image: {
    top: (Layout.height / 100 ) * 2,
    right: (Layout.width / 100) * 1,
    height:  (Layout.height / 100) * 15,
    width:  (Layout.width / 100) * 15,    
    borderBottomWidth: 1,
  },
  cart_details: {
    top: (Layout.height / 100 ) * 6,
    height: (Layout.height / 100) * 40,
    marginHorizontal: (Layout.width / 100) * 2,    
    borderRadius: 20,
    borderWidth:1,
    flex:0.7,
    bottom: (Layout.height / 100 ) * 1,        
  },
  detail_info_title: {
    color: "#9E9FA0",
    justifyContent: "flex-start",
    fontFamily: "Gotham_light",
    fontSize: 15,
  },
  detail_info_value: {   
    fontFamily: "Gotham_light",
    fontSize: 20,
    bottom:(Layout.height / 100 ) * 1,
    fontWeight:'bold',
    justifyContent: "flex-start",
  },
  details_title: {
    fontFamily: "Gotham_light",
    fontSize: 25,
    fontWeight: "bold",
    right:(Layout.width / 100) * 7
  },
  remaining_balance: {
    color: Colors.blue_green,
    fontFamily: "Gotham_light",
    fontSize: 20,
    fontWeight: "bold",
    justifyContent: "flex-start",
  },
  additional_payment: {
    color: Colors.danger,
    fontFamily: "Gotham_light",
    fontSize: 20,
    fontWeight: "bold",
    justifyContent: "flex-start",
  },
  
  next_txt:{
    color:Colors.light,  
    fontSize:15,
    fontFamily:'Gotham_bold',    
  },  
  next_btn:{        
    width: (Layout.width / 100) * 90,
    left: (Layout.width / 100) * 5,
    borderColor: Colors.green,
    backgroundColor: Colors.green,    
  },
  spiel: {    
    bottom: 10,
    fontFamily: "calibri-light",
    color: Colors.light,
    backgroundColor:'#ff5b57cc',
    borderRadius:5,     
    padding:10 
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
    zIndex:2,
    elevation:2,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  edit_total_amount_label: {
    top: (Layout.height / 100) * 2,
    left: 20,
    fontSize: 17,
    fontFamily: 'Gotham_bold',
    color: Colors.header_text,
  },
  update_button_txt:{
    color:Colors.light,  
    fontSize:15,
    fontFamily:'Gotham_bold',    
  },  
  update_button:{        
    width: (Layout.width / 100) * 40,
    left: (Layout.width / 100) * 5,
    
    borderColor: Colors.dark_blue,
    backgroundColor: Colors.dark_blue,    
  },
  cancel_button:{        
    marginRight:10,
    width: (Layout.width / 100) * 40,
    left: (Layout.width / 100) * 5,
    borderColor: Colors.danger,
    backgroundColor: Colors.danger,    
  },
});
