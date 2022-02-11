import React, {Component} from 'react';
import {View,Text, StyleSheet,FlatList,Image} from 'react-native';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Card } from 'react-native-paper';
import NumericInput from "react-native-numeric-input";
import Button from 'apsl-react-native-button';
import NumberFormat from 'react-number-format';
import Swipeable from "react-native-gesture-handler/Swipeable";
import {  Popup} from 'react-native-popup-confirm-toast';
export default class ViewCartScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {          
        params:this.props.route.params,     
        data:[],
        total:0,
        new_data:[]
    };

  }


  componentDidMount(): void {
      this.setState({data:this.state.params.cart,total:  this.state.params.cart.reduce((prev, current) => prev + current.total_amount, 0).toFixed(2)});
    
  }


  rightContent = (delete_index) => (
    <View style={{ top:(Layout.height / 100) * 5}}>
      <Icon
        name="trash"
        family="entypo"
        color={Colors.danger}
        size={50}
        onPress={() => {
          let new_data = this.state.data;
          new_data.splice(delete_index, delete_index + 1);
          
          this.setState({new_data:new_data});
          if(this.state.data.length  == 0){
                        
            this.state.params.return_cart(new_data)
            this.props.navigation.goBack();
          }          
        }}
      />
  
    </View>
  );

  // quantity function 
  handleQuantity =   async (item,index,value)=> {

    var total_amount = parseFloat(item.price) * value;
    
 
          
  //   // set condition when total amount of item exceed in ceiling amount
    if(total_amount <= item.ceiling_amount ){  
      
      this.setState((prevState) => {
        
        if (prevState.data[index].name == item.name) {
          prevState.data[index].total_amount = total_amount;
          prevState.data[index].quantity = value;
          prevState.data[index].status = "success";
          
        }
      });
      

      
    
    this.setState({total: this.state.data.reduce((prev, current) => prev + current.total_amount, 0).toFixed(2)})
  }
  else{

    this.setState((prevState) => {
      if (prevState.data[index].name == item.name) {
        
        prevState.data[index].total_amount = total_amount;
        prevState.data[index].quantity = value;
        prevState.data[index].status = "error";
        prevState.data[index].message = "Your total amount of "+item.name+" exceed in limit amount of ₱"+item.ceiling_amount; 
        
      }
    });
    
   this.setState({total: this.state.data.reduce((prev, current) => prev + current.total_amount, 0).toFixed(2)})


  }    
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
      rightButtonBackgroundColor={Colors.light_green}
      leftButtonBackgroundColor={Colors.light_green}
    />
  );



  // render item

  renderItem = (item, index) => (
    <Swipeable renderRightActions={() => this.rightContent(index)}>
      <Card elevation={20} style={styles.card}>
        <Card.Title
          title={item.name + " (" + item.unit_measure + ")"}
          left={() => (
            <Image
              source={{ uri: "data:Image/jpeg;base64," + item.image }}
              style={styles.commodity_image}
            />
          )}
          subtitle={"₱" + parseFloat(item.total_amount).toFixed(2)}
          subtitleStyle={{
            fontFamily: "calibri-light",
            color: Colors.base,
            fontSize: 15,
          }}
          titleStyle={{ fontFamily: "calibri-light", fontWeight: "bold" }}
          right={() => this.numericInput(item, index)}
        />
        <Card.Content style={{marginTop:20}}>  
          {item.status == "error" ? (
            <Text style={styles.spiel}> {item.message} </Text>
            ) : null}
        </Card.Content>
      </Card>
    </Swipeable>
  );


// check out button
handleCheckOut = ()=>{
    
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
  
  if (count_error == 0 ){
    if(Number(this.state.total) <= Number(this.state.params.available_balance)){
      this.props.navigation.navigate('AttachmentScreen',dataToSend);
    } else{      

      
      Popup.show({
        type: 'warning',              
        title: 'Message',
        textBody: `Your total amount of ₱${total} exceed in you current balance of ₱${this.state.params.available_balance}`,                
        buttonText:"I understand",
        okButtonStyle:styles.confirmButton,
        okButtonTextStyle: styles.confirmButtonText,
        callback: () => {                  
          Popup.hide()                                              
        },              
      })

    }
  }else{    
       
    Popup.show({
      type: 'warning',              
      title: 'Message',
      textBody: "Commodities price exceed to your limit price.",                
      buttonText:"I understand",
      okButtonStyle:styles.confirmButton,
      okButtonTextStyle: styles.confirmButtonText,
      callback: () => {                  
        Popup.hide()                                    
      },              
    })
  }   

  
}
 
  render() {

    return (
      <View  style={styles.container}>        
        <FlatList
          nestedScrollEnabled
          data={this.state.data}
          extraData={this.state.new_data}
          style={styles.flat_list}
          renderItem={({ item, index }) => this.renderItem(item, index)}
          keyExtractor={(item) => item.name}
        />

       
        

      <View style={{flex: 1}}>
        <View style={{position: 'absolute', left: 0, right: 0, bottom: 0}}>
        {/* Cart Summary Details */}
        <Card style={styles.cart_details} elevation={10}>
        <Card.Title title={"Details"} titleStyle={styles.details_title} left={()=><FontAwesomeIcon name="info-circle" color={Colors.blue_green} size={20}/>}/>
        <Card.Content>
          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detail_info_title}>Current Balance:</Text>
            </View>
            <View style={{ flex: 1 }}>

            <NumberFormat
                  value={this.state.params.available_balance}
                  displayType={"text"}
                  decimalScale={2}
                  thousandSeparator={true}                
                  renderText={(values) => (
                    <Text style={styles.detail_info_value}>                              
                      ₱{values}
                    </Text>
                  )}
                />
              
            </View>
          </View>

          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detail_info_title}>Total:</Text>
            </View>
            <View style={{ flex: 1 }}>
              <NumberFormat
                  value={this.state.total}
                  displayType={"text"}
                  decimalScale={2}
                  thousandSeparator={true}                
                  renderText={(values) => (
                    <Text style={styles.detail_info_value}>                              
                      ₱{values}
                    </Text>
                  )}
              />
              
            </View>
          </View>

          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detail_info_title}>
                - - - - - - - - - - - - - - - - - - - - - - - - - 
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detail_info_title}>Remaining Balance:</Text>
            </View>
            <View style={{ flex: 1 }}>
            <NumberFormat
                  value={this.state.params.available_balance - this.state.total}
                  displayType={"text"}
                  decimalScale={2}
                  thousandSeparator={true}   
                  fixedDecimalScale={true}             
                  renderText={(values) => (
                    <Text style={styles.remaining_balance}>                              
                      ₱{values}
                    </Text>
                  )}
              />
              
            </View>
          </View>
        </Card.Content>
      </Card>

          
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
  },
  card: {
    marginTop: (Layout.height / 100 ) * 2,
    marginHorizontal: (Layout.width / 100 ) * 1,
    marginBottom: 10,
    borderRadius: 10,
  },
  commodity_image: {
    top: (Layout.height / 100 ) * 2,
    right:20,
    height: 60,
    width: 60,
    overflow: "hidden",    
    borderBottomWidth: 1,
  },
  cart_details: {
    height: (Layout.height / 100) * 33,
    marginHorizontal: (Layout.width / 100) * 2,    
    borderRadius: 20,
    bottom: (Layout.height / 100 ) * 2,        
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
    right:(Layout.width / 100) * 8
  },
  remaining_balance: {
    color: Colors.blue_green,
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
  
});
