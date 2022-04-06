import React, {Component} from 'react';
import {View,Text, StyleSheet,FlatList,Image,BackHandler} from 'react-native';
import Colors from '../../constants/Colors';
import Images from '../../constants/Images';
import Layout from '../../constants/Layout';
// import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { FontAwesomeIcon} from '@fortawesome/react-native-fontawesome'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import NetInfo from "@react-native-community/netinfo";
import axios from 'axios';
import * as ipConfig from '../../ipconfig';
import { Card } from 'react-native-paper';
import Button from 'apsl-react-native-button';
import {  Popup} from 'react-native-popup-confirm-toast';
import { SharedElement } from 'react-navigation-shared-element';
import Spinner from 'react-native-spinkit';
import NumberFormat from 'react-number-format';

export default class CommodityScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {          
        params:this.props.route.params,     
        data:[],        
        cart:[],
        new_csf_commodities:[],
        show_spinner:false


        
    };


    
  }


  componentDidMount() {
    
    if(this.state.params.hasOwnProperty('cart')){
      this.setState({cart:this.state.params.cart,
      });    
      
    }

    this.setState({data:this.state.params.program_items,
    
    });
    
  }

  // commodity that has been added  to the cart
  myCart  = (data)=>{

    this.setState(prevState => ({
      cart: [...prevState.cart, data.cart],
    }));
    
    
  }



  gotoSelectedCommodityScreen = (item) =>{


    

    let categories = [
      {label: 'Complete (14-14-14)', value: 'Complete (14-14-14)'},
      {label: 'Complete (16-16-16)', value: 'Complete (16-16-16)'},
      {label: 'Urea - Prilled (46-0-0)', value: 'Urea - Prilled (46-0-0)'},
      {label: 'Urea - Granular (46-0-0)', value: 'Urea - Granular (46-0-0)'},
      {label: 'Ammonium Sulfate (21-0-0)', value: 'Ammonium Sulfate (21-0-0)'},
      {label: 'Ammonium Phosphate (16-20-0)', value: 'Ammonium Phosphate (16-20-0)'},
      {label: 'Muriate of Potash (0-0-60)', value: 'Muriate of Potash (0-0-60)'},
      {label: 'Others (to be specified/indicated)', value: 'others'},
    ];

    let data = {
        reference_no: this.state.params.data[0].reference_no,
        supplier_id: this.state.params.supplier_id,

    };  


    let cart_categories = [];

    if(this.state.cart.length != 0){

      this.state.cart.map(item_cart=>{

        cart_categories.push(item_cart.item_category)
      })

    }
    
    

    this.props.navigation.push('SelectedCommodityScreen',{
      item:item,
      voucher_info:this.state.params.data[0],   
      unit_types:this.state.params.unit_types,      
      my_cart : this.myCart.bind(this),
      categories: cart_categories,
      time:this.state.params.time,
      total_amount:this.state.cart.reduce((prev, current) => prev + parseFloat(current.total_amount), 0)
      
    })

    // // check internet connection  
    //   NetInfo.fetch().then((response)=>{
              
    //   if(response.isConnected){
        
    //   // check if category has draft
    //   axios.post(ipConfig.ipAddress+'/check-if-category-has-draft',data).then((response)=>{         
    //         let result = response.data;
    //         console.warn(response.data);
    //         if(result['message'] == 'true'){

    //           this.props.navigation.push('SelectedCommodityScreen',{
    //             item:item,
    //             voucher_info:this.state.params.data[0],      
    //             my_cart : this.myCart.bind(this),
    //             categories: cart_categories
                
    //           })
              
    //         }else{
    //           this.props.navigation.push('SelectedCommodityScreen',{
    //             item:item,
    //             voucher_info:this.state.params.data[0],      
    //             my_cart : this.myCart.bind(this),
    //             categories: cart_categories
    //           })
    //         }
    //   }).catch(err => console.warn(err.response.data))
    // }else{
    //   Popup.show({
    //     type: 'danger',
    //     title: 'Error!',
    //     textBody: 'No internet connection. Please check your internet connectivity.',
    //     buttonText: 'Ok',
    //     okButtonStyle: styles.confirmButton,
    //     okButtonTextStyle: styles.confirmButtonText,
    //     callback: () => {
    //       this.setState({show_spinner:false});
    //       Popup.hide();
          
    //     },
    //   });

    // }

    // });
  

  }

  renderCommodity = (item, index) => (
    <Card elevation={10} style={styles.card}>

      <SharedElement id={item.item_id}>
        <Card.Cover
          resizeMode="contain"
          source={{ uri: "data:image/jpeg;base64," + item.base64 }}
          style={{borderTopLeftRadius:15,borderTopRightRadius:15}}
        />
      </SharedElement>
      
      <Card.Title
        title={item.item_name }
        titleStyle={styles.card_title}                
        right={() => (
          <Button
          textStyle={styles.add_to_cart_txt}
          style={styles.add_to_cart_btn}
          activityIndicatorColor={Colors.light}
          activeOpacity={100}
          isLoading={this.state.isLoading}
          disabledStyle={{opacity: 1}}
          onPress ={()=>this.gotoSelectedCommodityScreen(item)}
          >                  
            <FontAwesomeIcon icon={faPlusCircle} size={20} color={Colors.light} style={{left:20}} transform="fa-fade"  />       
            Add 
        </Button>
        )}
      />
      <Card.Content></Card.Content>
    </Card>
  );
  

  emptyCommodity = () => (
    <Card elevation={20} style={styles.card}>
      <Card.Title title="None" />
    </Card>
  );


  returnCart = (new_cart)=>{
 
    this.setState({cart:new_cart}); 
    
    this.setState({new_csf_commodities:this.state.data.filter((item) =>    
    !this.state.cart.find((value) => value.name === item.item_name)
    ? item : null
    )})
  }


 // go to view cart screen
 handleViewCart = async () => {

  this.setState({show_spinner:true});
  
  if(this.state.cart.length !=0){
      

      let data = {
          cart:this.state.cart
      }
      
      
      // check internet connection
      NetInfo.fetch().then((response)=>{
              
      if(response.isConnected && response.isInternetReachable){
        
      // SAVE TO CART AS DRAFT
      axios.post(ipConfig.ipAddress+'/save-to-cart',data).then((response)=>{              
        this.setState({show_spinner:false});
        let result = response.data;



        if(result['message'] == 'true'){


          
              this.props.navigation.navigate("ViewCartScreen", {
                cart: data.cart,
                available_balance: this.state.params.data[0].Available_Balance,
                voucher_info:this.state.params.data,
                supplier_id: this.state.params.supplier_id,
                full_name: this.state.params.full_name,
                user_id: this.state.params.user_id,
                return_cart : this.returnCart.bind(this),
                data:this.state.params.data,
                time:this.state.params.time
                
            });
        

        

        }else{  
          console.warn(response.data)
          Popup.show({
            type: 'danger',
            title: 'Error!',
            textBody: 'Something went wrong.',
            buttonText: 'Ok',
            okButtonStyle: styles.confirmButton,
            okButtonTextStyle: styles.confirmButtonText,
            callback: () => {            
              Popup.hide();
            },
          });

        }              
        }).catch((err)=>
          {
            console.warn(err.response.data)
            this.setState({show_spinner:false});
          }        
          );
      
      
      
      }else{
        Popup.show({
          type: 'danger',
          title: 'Error!',
          textBody: 'No internet connection. Please check your internet connectivity.',
          buttonText: 'Ok',
          okButtonStyle: styles.confirmButton,
          okButtonTextStyle: styles.confirmButtonText,
          callback: () => {
            this.setState({show_spinner:false});
            Popup.hide();
            
          },
        });

      }

    })

 
    
  }else{
    Popup.show({
      type: 'warning',              
      title: 'Warning!',
      textBody: "You don't have commodities in your cart.",                
      buttonText:'Ok',
      okButtonStyle:styles.confirmButton,
      okButtonTextStyle: styles.confirmButtonText,
      callback: () => {    
        this.setState({show_spinner:false});
        Popup.hide()                                    
      },              
    })
  }


 }


 
  render() {
    let sum = 0.00;
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

      {/* COMMODITIES LIST */}      
      
        <FlatList
          nestedScrollEnabled
          data={
            
            this.state.cart.reduce((prev, current) => prev + parseFloat(current.total_amount), 0) >= this.state.params.data[0].amount_val ? []: this.state.data

            // this.state.data.filter((item) =>
        
            // !this.state.cart.find((value) => value.name === item.item_name)
            // ? item : null
            // )
          }
          extraData={this.state.new_csf_commodities}
          style={styles.flat_list}
          ListEmptyComponent={() => this.emptyCommodity()}
          renderItem={({ item, index }) => this.renderCommodity(item, index)}
          keyExtractor={(item) => item.name}
        />      

      {/*  Go to View Cart Screen */}
      <View style={{flex: 1}}>
        <View style={{position: 'absolute', left: 0, right: 0, bottom: 0}}>
        <Button
            textStyle={styles.next_txt}
            style={styles.next_btn}
            activityIndicatorColor={'white'}
            isLoading={this.state.isLoading}
            disabledStyle={{opacity: 1}} 
            onPress = {this.handleViewCart}
          > 
          <NumberFormat 
              // value={(this.state.cart.map((prev) => {
              //                                   sum += prev.total_amount;
              //                                   return sum;
              //                             }) == 0 ? "0.00": parseFloat(sum))} 
            value={this.state.cart.reduce((prev, current) => prev + parseFloat(current.total_amount), 0)} 
            displayType={'text'} 
            thousandSeparator={true} 
            prefix={'₱'}
            decimalScale={2}
            renderText={(value)=>(
              <Text  numberOfLines={2} style={styles.next_txt} >                
                {'● '+ this.state.cart.length + ' '+(this.state.cart.length > 1 ? 'items' : 'item')+' ● ' + (value == '₱0' ? '₱0.00' : value) }
              </Text>
            )}
          />
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
  card: {
    marginTop: 10,
    marginHorizontal: 2,
    marginBottom: 20,
    borderRadius: 15,
    borderWidth:1,
  },
  card_title:{
    fontFamily:'Gotham_bold'
  },
  commodity:{

      width:150,
      height:150,
      top:(Layout.height / 100) * 8,
      alignSelf:'center',       
  },
  commodity_image: {
    top: 5,
    height: (Layout.height / 100) * 35,
    width: (Layout.width / 100) * 100,
    overflow: "hidden",    
    borderBottomWidth: 1,
  },
  flat_list: {
    marginTop: (Layout.height / 100) * 10,
    marginBottom: (Layout.height / 100) * -2,
    width: (Layout.width / 100) * 92,
    alignSelf: "center",
  },
  next_txt:{
    color:Colors.light,  
    fontSize:15,
    fontFamily:'Gotham_bold',
    
  },
  
  next_btn:{        
    elevation:1,
    
    width: (Layout.width / 100) * 90,
    left: (Layout.width / 100) * 5,
    borderColor: Colors.green,
    backgroundColor: Colors.green,    
  },
  add_to_cart_txt:{
    color:Colors.light,    
    fontFamily:'Gotham_bold',
    fontSize:10
  },
  add_to_cart_btn:{
    borderColor:'#ddd',
    backgroundColor:Colors.green,
    width: (Layout.width / 100) * 40,
    right:10
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
    
    elevation:2,
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
