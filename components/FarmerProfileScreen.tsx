import React, {Component} from 'react';
import {View,Text, StyleSheet,FlatList,Image} from 'react-native';
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
import { Card } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Images from '../constants/Images';
import Button from 'apsl-react-native-button';
import Moment from 'react-moment';
import NumberFormat from 'react-number-format';
import {Popup } from 'react-native-popup-confirm-toast';
import Spinner from 'react-native-spinkit';
export default class FarmerProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {          
        params:this.props.route.params,
        history:this.props.route.params.history,
        show_spinner:false
    };

  }

  componentDidUpdate() {
      
  }

  // render recent claiming
  renderHistory = (item,index)=>(
    <Card elevation={10} style={styles.card}>
        <Card.Title title={item.transac_by_fullname}  subtitle={<Moment element={Text} fromNow>{item.transac_date}</Moment>} 
          left={()=>
            <Icon
            name="history"
            family="FontAwesome"
            color={Colors.blue_green}
            size={30}
          />  
          }/>
        <Card.Content>
              <Text style={{left:55}}>Total Amount of  &#8369;{item.total_amount}</Text>
        </Card.Content>
    </Card>

  )

  // empty component
  emptyComponent = ()=>(             
    <Card elevation={10} style={styles.card}>
           <Card.Title title="No history of Claiming" />            
     </Card> 
  )

  
  handleGoBack = () => {
    this.props.navigation.reset({
      index: 0,
      routes: [{name: 'Root'}],
    })
  }

  returnCart = (new_cart)=>{
 
    
  }



  // go to commodity
  handleGoToCommodity = () => { 
    
    
    this.setState({show_spinner:true});
    
    let cart = [];
      // check internet connection
      NetInfo.fetch().then(async (response)=>{
        let data  = {
            supplier_id:await AsyncStorage.getItem('supplier_id'),
            reference_no:this.state.params.data[0].reference_no
        }

        if(response.isConnected){
          
        // check if voucher has draft transaction
        axios.post(ipConfig.ipAddress+'/check-draft-transaction',data).then((response)=>{              
          this.setState({show_spinner:false});
          let result = response.data;              
          
          if(result['message'] == 'true'){
                                
            if(result['draft_cart'].length != 0){


         

              // push  draft cart
              result['draft_cart'].map((item_cart)=>
                
                cart.push(
                  {
                    sub_id: item_cart.sub_program_id,
                    image: this.state.params.program_items.filter((item_program)=>item_program.sub_id == item_cart.sub_program_id)[0].base64,
                    name: this.state.params.program_items.filter((item_program)=>item_program.sub_id == item_cart.sub_program_id)[0].item_name,
                    unit_measure: this.state.params.program_items.filter((item_program)=>item_program.sub_id == item_cart.sub_program_id)[0].unit_measure,
                    ceiling_amount: this.state.params.program_items.filter((item_program)=>item_program.sub_id == item_cart.sub_program_id)[0].ceiling_amount,
                    total_amount: item_cart.total_amount,
                    quantity: item_cart.quantity,
                    price: item_cart.amount,
                    reference_no: this.state.params.data[0].reference_no,
                    item_category: item_cart.item_category,
                    supplier_id: data.supplier_id
                  }
                )
              )
                  

              // continue the last transaction to view cart screen
              this.props.navigation.navigate("ViewCartScreen", {
                  cart: cart,
                  available_balance: this.state.params.data[0].Available_Balance,
                  voucher_info:this.state.params.data,
                  supplier_id: this.state.params.supplier_id,
                  full_name: this.state.params.full_name,
                  user_id: this.state.params.user_id,
                  program_data :this.state.params.program_items,
                  program_items :this.state.params.program_items,
                  return_cart:this.returnCart.bind(this),             
                  data:this.state.params.data,
              });
                            
            }else{

                // go to commodity screen 
              this.props.navigation.navigate('CommodityScreen',this.state.params); 
            
            }

          }else{
            // go to commodity screen 
            this.props.navigation.navigate('CommodityScreen',this.state.params); 
          }
          

        }).catch(err=>{
          this.setState({show_spinner:false});
          console.warn(err)})

        }else{
          this.setState({show_spinner:false});
        }
        
      });
    


    




    // if(get_program == 'FS'){      
    //   this.props.navigation.navigate('FuelScreen',this.state.params);    
    // }else if(get_program == 'RRP2' ){
    //   // navigation.navigate('FertilizerScreen',params);    
    // }
    
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
          {/* Current Balance */}
          <NumberFormat value={this.state.params.data[0].Available_Balance} displayType={'text'} thousandSeparator={true} prefix={'₱'} 
            renderText={(value)=>(
              <Animatable.Text animation="slideInLeft" numberOfLines={2} style={styles.current_balance}>Current Balance: {value}
              </Animatable.Text>
            )}
          />
          {/* Farmer Image*/}
          <Animatable.Image animation="fadeInDownBig" source={Images.farmer} style={styles.logo} />            
      </LinearGradient>
              
      {/* Reference Number */}      
      <Animatable.Text animation="slideInLeft" numberOfLines={2} style={styles.reference_no}>#{this.state.params.data[0].reference_no}</Animatable.Text>        
      {/* Full Name */}      
      <Animatable.Text animation="slideInLeft" numberOfLines={2} style={styles.full_name}>{this.state.params.data[0].first_name} {this.state.params.data[0].last_name}</Animatable.Text>        
      {/* Location */}      
      <Animatable.Text animation="slideInLeft" delay={300}  numberOfLines={10}  style={styles.location}>
          <Ionicons name="location" color={Colors.blue_green}/>
                Barangay {this.state.params.data[0].Barangay}, {this.state.params.data[0].Municipality}, {this.state.params.data[0].Province}, {this.state.params.data[0].Region}</Animatable.Text>


      <Animatable.Text animation="slideInLeft" numberOfLines={2} style={styles.history_title}><FontAwesomeIcon name="info-circle" color={Colors.blue_green} size={16}/> Recent Claiming</Animatable.Text>        
   
      <FlatList
        horizontal
        data={this.state.history}
        ListEmptyComponent={this.emptyComponent}
        renderItem={({item,index})=>this.renderHistory(item,index)}
        nestedScrollEnabled
        style={styles.flat_list}
        
        showsHorizontalScrollIndicator={false}  
            
      />    
    
      
      <View style={{flex: 1}}>
        <View style={{position: 'absolute', left: 0, right: 0, bottom: 0}}>
          <Button
            textStyle={styles.next_txt}
            style={styles.next_btn}
            activityIndicatorColor={Colors.light}
            activeOpacity={100}
            isLoading={this.state.isLoading}
            disabledStyle={{opacity: 1}}
            onPress ={this.handleGoToCommodity}
            >
           Start Transaction
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
  cover:{
    height:150,
    borderBottomLeftRadius:35,
    borderBottomRightRadius:35
  },
  logo:{    
    width:150,
    height:150,
    top:(Layout.height / 100) * 8,
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
  current_balance:{
    alignSelf:'center',    
    top:(Layout.height / 100) * 5,
    fontFamily:'Gotham_bold',
    fontSize:15,
    color:Colors.light,
    position:'absolute',
    left: (Layout.width / 100) * 20,
  },
  history_title:{    
    fontFamily:'Gotham_bold',
    fontSize:16,    
    left: (Layout.width / 100) * 5,
    top:(Layout.height / 100) * 20,
    color:Colors.dark
  },
  next_txt:{
    color:Colors.light,    
    fontFamily:'Gotham_bold',
  },
  
  next_btn:{    
    
    width: (Layout.width / 100) * 90,
    left: (Layout.width / 100) * 5,
    borderColor: Colors.green,
    backgroundColor: Colors.green,    
  },
  card: {    
    marginLeft: (Layout.width / 100) * 1,
    height:(Layout.height / 100) * 20,
    borderRadius: 15,            
    borderWidth:1,
    width: (Layout.width / 100) * 90,
  },
  flat_list:{
    top:(Layout.height / 100) * 25,      
    height:(Layout.height / 100) * 30,
    flexGrow: 0,
    width: (Layout.width / 100) * 92,
  },
  go_back:{
    top:(Layout.height / 100) * 2,      
    left: (Layout.width / 100) * 5,
    position:'absolute'
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
