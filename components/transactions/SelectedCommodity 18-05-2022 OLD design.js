import React, {Component} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import Colors from '../../constants/Colors';


import Layout from '../../constants/Layout';
import * as Animatable from 'react-native-animatable';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';

import RNPickerSelect from 'react-native-picker-select';
import Button from 'apsl-react-native-button';
import NumberFormat from 'react-number-format';
import {Fumi} from 'react-native-textinput-effects';
import NumericInput from 'react-native-numeric-input';
import {Popup} from 'react-native-popup-confirm-toast';
import {SharedElement} from 'react-navigation-shared-element';
import AsyncStorage from "@react-native-async-storage/async-storage";
import FakeCurrencyInput from 'react-native-currency-input';
import {Picker} from '@react-native-picker/picker';
import NetInfo from "@react-native-community/netinfo";
import axios from 'axios';
import * as ipConfig from '../../ipconfig';
import Spinner from 'react-native-spinkit';

export default class SelectedCommodityScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      params: this.props.route.params,
      focus_amount: false,
      focus_unit:false,
      amount: '',
      quantity: 1.0,
      total_amount: 0,
      error: false,
      message: '',      
      selected_commodity: [],
      fertilizer_category:'',
      categories:[],
      unit_types:this.props.route.params.unit_types,
      unit_type:'',
      is_amount_exceed:false,
      added_cash_amount : 0,
      pickerStyle :{ inputAndroid: {
        width: (Layout.width / 100) * 70,        
        left: (Layout.width / 100) * 5,                
        fontFamily: 'Gotham_bold',
        borderWidth: 1,   
        paddingLeft:20,                 
        borderColor:'#ddd',  
        backgroundColor: '#F7F7F7',
        fontSize: 16,
      },
      placeholder:{
        color:'#a3a3a3',
        zIndex:1,
        paddingLeft:20,
        borderRadius: 5,
        borderColor:Colors.fade
        }
      
      }
      
    };
  }


  //  add to cart button
  addToCart = async (price, ) => {
  
    if ((price != 0.00  || price != 0 ) &&
        this.state.fertilizer_category != ''
        && this.state.unit_type != ''
        && price != null    && this.state.params.item.has_category== '1'      
      ) {

           
      let data = {
        sub_id: this.state.params.item.sub_id,
        image: this.state.params.item.base64,
        name: this.state.params.item.item_name,
        unit_measure: this.state.params.item.unit_measure,
        ceiling_amount: this.state.params.item.ceiling_amount,
        total_amount: this.state.total_amount,
        quantity: this.state.quantity,
        price: this.state.amount,
        reference_no: this.state.params.voucher_info.reference_no,
        item_category: this.state.fertilizer_category,
        unit_type: this.state.unit_type,
        cash_added: (this.state.params.voucher_info.amount_val - this.state.params.total_amount) - this.state.total_amount < 0 ? this.state.total_amount - (this.state.params.voucher_info.amount_val - this.state.params.total_amount) : 0 ,
        supplier_id: await AsyncStorage.getItem('supplier_id')
      };

      


      Popup.show({
        type: 'success',
        title: 'Success!',
        textBody: 'Successfully added to your cart.',
        buttonText: 'Okay',
        okButtonStyle: styles.confirmButton,
        okButtonTextStyle: styles.confirmButtonText,
        callback: () => {
          Popup.hide();          
          this.props.route.params.my_cart({cart: data});
          this.props.navigation.goBack();
        },
      });


   



    }else if ((price != 0.00  || price != 0 ) &&  this.state.params.item.has_category == '0'    ){
      
      let data = {
        sub_id: this.state.params.item.sub_id,
        image: this.state.params.item.base64,
        name: this.state.params.item.item_name,
        unit_measure: this.state.params.item.unit_measure,
        ceiling_amount: this.state.params.item.ceiling_amount,
        total_amount: this.state.total_amount,
        quantity: this.state.quantity,
        price: this.state.amount,
        reference_no: this.state.params.voucher_info.reference_no,
        item_category: this.state.fertilizer_category,
        supplier_id: await AsyncStorage.getItem('supplier_id')
      };

      


      Popup.show({
        type: 'success',
        title: 'Success!',
        textBody: 'Successfully added to your cart.',
        buttonText: 'Okay',
        okButtonStyle: styles.confirmButton,
        okButtonTextStyle: styles.confirmButtonText,
        callback: () => {
          Popup.hide();
          console.warn(data);
          this.props.route.params.my_cart({cart: data});
          this.props.navigation.goBack();
        },
      });


      
    } else if (price == 0 || price == null || isNaN(price)) {
      Popup.show({
        type: 'danger',
        title: 'Error!',
        textBody: 'Please enter your total amount of commodity.',
        buttonText: 'Ok',
        okButtonStyle: styles.confirmButton,
        okButtonTextStyle: styles.confirmButtonText,
        callback: () => {
          Popup.hide();
          this.setState({error:true,focus_amount:false})
        },
      });
    }else if (this.state.fertilizer_category == '' && this.state.params.item.has_category == '1'){
  
      Popup.show({
        type: 'danger',
        title: 'Error!',
        textBody: 'Please select category.',
        buttonText: 'Ok',
        okButtonStyle: styles.confirmButton,
        okButtonTextStyle: styles.confirmButtonText,
        callback: () => {
          Popup.hide();
        },
      });
    }
    else if (this.state.unit_type == ''){
      
          Popup.show({
            type: 'danger',
            title: 'Error!',
            textBody: 'Please select unit type.',
            buttonText: 'Ok',
            okButtonStyle: styles.confirmButton,
            okButtonTextStyle: styles.confirmButtonText,
            callback: () => {
              Popup.hide();
            },
          });
        }
  };


  componentDidMount() {
    
    this.props.navigation.setOptions({
      headerTitle:'Commodity',
      headerTransparent:true,
      transitionSpec:{
                    open:{animation:'timing',config:{duration:500}},
                    close:{animation:'timing',config:{duration:500}}
                },
      cardStyleInterpolator:({current:{progress}})=>{
          return {
              cardStyle:{
                  opacity:progress
              }
          }
      },                                            
      headerRight:()=>(
        <Button
        textStyle={styles.add_to_cart_txt}
        style={styles.add_to_cart_btn}
        activityIndicatorColor={Colors.light}
        activeOpacity={100}
        disabledStyle={{opacity: 1}}        
        onPress = { ()=> this.addToCart(
          this.state.total_amount              
        )}
        >
         Done
      </Button>
      )

    });

    let categories = [
      {label: 'Complete (14-14-14)', value: 'Complete (14-14-14)'},
      {label: 'Complete (16-16-16)', value: 'Complete (16-16-16)'},
      {label: 'Urea - Prilled (46-0-0)', value: 'Urea - Prilled (46-0-0)'},
      {label: 'Urea - Granular (46-0-0)', value: 'Urea - Granular (46-0-0)'},
      {label: 'Ammonium Sulfate (21-0-0)', value: 'Ammonium Sulfate (21-0-0)'},
      {label: 'Ammonium Phosphate (16-20-0)', value: 'Ammonium Phosphate (16-20-0)'},
      {label: 'Muriate of Potash (0-0-60)', value: 'Muriate of Potash (0-0-60)'},
      {label: 'Other grades', value: 'Other grades'},
    ];  

    let index = categories.length - 1;
    while (index >= 0) {
      if (this.state.params.categories.indexOf(categories[index].label) > (-1)) {
        categories.splice(index, 1);
      }
      index -= 1;
    }


    this.setState({categories:categories})
    
  }





  //quantity function
  handleQuantity = value => {
    
    var total_amount = parseFloat(this.state.total_amount) ;

    
      this.setState({
        total_amount: isNaN(total_amount) ? 0 : total_amount,
        quantity: value,
        error: false,
      });
  
  };

  // amount textbox value change
  amountValueChange = values => {
    const {formattedValue, value} = values;

    var converted_value = parseFloat(value);
    var total_amount = converted_value;    

    
    
    
    if (
      isNaN(converted_value) ||
      total_amount != 0    && !isNaN(total_amount)
    ) {
      
      this.setState({
        total_amount: value,
        error: false,
      });
    } else {
      
      this.setState({
        total_amount: value,
        error: true,
        message: 'You exceed on the limit price ',
      });
    }
  };  

 


  // render amount text box
  renderAmountText = (values) => {
    console.warn(values)
    return (
      <Fumi
        label={'Enter total amount of commodity'}
        iconClass={Ionicons}
        iconName={'pricetag'}
        iconColor={Colors.green}
        iconSize={20}
        iconWidth={40}
        inputPadding={16}                
        style={[
          styles.amount,
          {
            borderColor:
              this.state.focus_amount == true || this.state.total_amount.length != 0
                ? Colors.light_green
                : this.state.error == true 
                ? Colors.danger
                : Colors.light,
          },
        ]}
        onFocus={() => this.setState({focus_amount: true})}
        onBlur={() => this.setState({focus_amount: false})}
        onChangeText={value => { 
          this.setState({total_amount: Number(value)
            .toFixed(2)
            .replace(/\d(?=(\d{3})+\.)/g, '$&,')});

        //   if((value + this.state.total_amount) <= this.state.voucher_info.amount || value == 0){      
        //   this.setState({total_amount: Number(value)
        //     .toFixed(2)
        //     .replace(/\d(?=(\d{3})+\.)/g, '$&,'),is_amount_exceed:false});
        // }else{

        //   this.setState({is_amount_exceed:true});
        // }
            
        }}
        
        value={values}
        keyboardType="number-pad"
      />
    );
  };

  render() {
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
        <SharedElement id={this.state.params.item.item_id}>
          <Image
            source={{
              uri: 'data:image/jpeg;base64,' + this.state.params.item.base64,
            }}
            style={styles.commodity_image}
          />
        </SharedElement>

        <Animatable.Text style={styles.commodity_title} adjustsFontSizeToFit>          
          {this.state.params.item.item_name} 
          {/* ({this.state.params.item.unit_measure}) */}
        </Animatable.Text>


        <View>
        <View  style={{ top: (Layout.height / 100) * 20, }}>            
            <Animatable.Text style={styles.total_amount_label} adjustsFontSizeToFit>          
              Total Amount:
            </Animatable.Text>
            <FakeCurrencyInput
                value={this.state.total_amount}
                onChangeValue={(value)=>{
                
                  this.setState({total_amount:value}) 

                  if((value + this.state.total_amount) <= this.state.params.voucher_info.amount_val || value == 0){                
          
                    this.setState({total_amount: value,is_amount_exceed:false});
                  }else{
          
                    this.setState({is_amount_exceed:true});
                  }
                  
                }}

                onFocus={()=>this.setState({focus_amount:true})}
                onBlur={()=>this.setState({focus_amount:false})}
                prefix="₱"
                delimiter=","
                separator="."
                minValue={0}
                precision={2}          
                style={[
                  styles.amount,
                  {
                    borderColor:
                      this.state.focus_amount ||  this.state.total_amount != 0
                        ? Colors.light_green
                        : this.state.error == true 
                        ? Colors.danger
                        : Colors.light,
                        backgroundColor: this.state.focus_amount == true || this.state.total_amount != '' ? Colors.light_green_tint:Colors.label,
                  },
                ]}           
              /> 
          </View> 


        <View style={{ flexDirection:'row',top: (Layout.height / 100) * 23, }}>
            <View>
            <Animatable.Text style={styles.quantity_amount_label} adjustsFontSizeToFit>          
              Quantity:
            </Animatable.Text>

            <NumericInput          
                separatorWidth={0}         
                  value={this.state.quantity}
                  onChange={value => this.handleQuantity(value)}
                  minValue={1}
                  maxValue={99999}
                  totalWidth={(Layout.width / 100) * 40}
                  totalHeight={(Layout.height / 100) * 5}
                  iconSize={25}
                  initValue={this.state.quantity}
                  step={0.1}
                  valueType="real"
                  rounded
                  iconStyle={{color: 'white'}}
                  inputStyle={styles.quantity_input}
                  containerStyle={styles.quantity}
                  rightButtonBackgroundColor={Colors.light_green}
                  leftButtonBackgroundColor={Colors.danger}
                  upDownButtonsBackgroundColor={Colors.light_green}
                />
            </View>

            <View>
              <Animatable.Text style={styles.quantity_amount_label} adjustsFontSizeToFit>          
                Unit Type:
              </Animatable.Text>
              <RNPickerSelect
                  onValueChange={value =>{                                                   
                    this.setState({unit_type:value})              
                  }} 
                  useNativeAndroidPickerStyle={false}                                      
                  onFocus = {()=>this.setState({focus_unit:true})}
                  onBlur = {()=>this.setState({focus_unit:false})}              
                  value={this.state.unit_type}
                  style = {{ inputAndroid: {
                    width: (Layout.width / 100) * 50,        
                    left: (Layout.width / 100) * 5,                
                    fontFamily: 'Gotham_bold',
                    borderWidth: 1,   
                    paddingLeft:20,         
                    color:'#a3a3a3',
                    borderColor: this.state.focus_unit == true || this.state.unit_type != '' ? Colors.light_green : Colors.fade,
                    backgroundColor: this.state.focus_unit == true || this.state.unit_type != '' ? Colors.light_green_tint:'transparent',
                    fontSize: 16,
                  },
                  placeholder:{
                    color:'#a3a3a3',                
                    zIndex:1,
                    paddingLeft:10,
                    borderRadius: 5,
                    borderWidth:1,
                    borderColor: this.state.focus_unit == true || this.state.unit_type != '' ? Colors.light_green : Colors.fade,
                    }
                  
                  }}                        
                  placeholder={{
                    label: 'Select Unit Type',
                    value: '',                
                  }}
                  items={this.state.unit_types}
                />
              </View>
        </View>

        {/* select fertilize category */}
        {this.state.params.item.has_category == '1'?
        <View style={{ top: (Layout.height / 100) * 26, }}>
          <Animatable.Text style={styles.category_label} adjustsFontSizeToFit>          
              Fertilizer Category:
          </Animatable.Text>
          
          <RNPickerSelect
                  onValueChange={value =>{                                                   
                    this.setState({fertilizer_category:value})              
                  }} 
                  useNativeAndroidPickerStyle={false}                                      
                  onFocus = {()=>this.setState({focus_unit:true})}
                  onBlur = {()=>this.setState({focus_unit:false})}              
                  value={this.state.fertilizer_category}
                  style = {{ inputAndroid: {
                    width: (Layout.width / 100) * 90,        
                    left: (Layout.width / 100) * 5,                
                    fontFamily: 'Gotham_bold',
                    borderWidth: 1,   
                    paddingLeft:20,         
                    color:'#a3a3a3',
                    borderColor: this.state.focus_unit == true || this.state.fertilizer_category != '' ? Colors.light_green : Colors.fade,
                    backgroundColor: this.state.focus_unit == true || this.state.fertilizer_category != '' ? Colors.light_green_tint:'transparent',
                    fontSize: 16,
                  },
                  placeholder:{
                    color:'#a3a3a3',                
                    zIndex:1,
                    paddingLeft:10,
                    borderRadius: 5,
                    borderWidth:1,
                    borderColor: this.state.focus_unit == true || this.state.fertilizer_category  != '' ? Colors.light_green : Colors.fade,
                    }
                  
                  }}                        
                  placeholder={{
                    label: 'Select Category',
                    value: '',                
                  }}
                  items={this.state.categories}
                />
          </View>
            
          : null}

    {/* display total amount */}
    <View style={{ top: (Layout.height / 100) * 30 }}>    
    <NumberFormat
          value={(this.state.params.voucher_info.amount_val - this.state.params.total_amount) - this.state.total_amount < 0 ? 0 : (this.state.params.voucher_info.amount_val - this.state.params.total_amount) - this.state.total_amount  }
          displayType={'text'}
          decimalScale={2}
          fixedDecimalScale={true}
          thousandSeparator={true}
          renderText={(result, props) => (

            <View style={{ flexDirection:'row'}}>              
            <Animatable.Text
              adjustsFontSizeToFit
              style={[styles.total_amount, {fontSize: 15}]}>
              {'Remaining Balance: '}      
            </Animatable.Text>
            <View style={{flex:1, alignItems:'flex-end',right:50 }}>
              <Animatable.Text
                adjustsFontSizeToFit
                style={[styles.total_amount, {color: Colors.blue_green}]}>
                ₱ {result}
              </Animatable.Text>
              </View>
            </View>
          )}
        />
      
      <NumberFormat
            value={(this.state.params.voucher_info.amount_val - this.state.params.total_amount) - this.state.total_amount < 0 ? this.state.total_amount - (this.state.params.voucher_info.amount_val - this.state.params.total_amount) : 0 }
            displayType={'text'}
            decimalScale={2}
            fixedDecimalScale={true}
            thousandSeparator={true}
            renderText={(result, props) => (

              <View style={{ flexDirection:'row'}}>              
              <Animatable.Text
                adjustsFontSizeToFit
                style={[styles.total_amount, {fontSize: 15}]}>
                {'Cash Added: '}                
              </Animatable.Text>
              <View style={{flex:1, alignItems:'flex-end',right:50 }}>
                <Animatable.Text
                  adjustsFontSizeToFit
                  style={[styles.total_amount, {color: Colors.danger}]}>
                  ₱ {result}
                </Animatable.Text>
                </View>
              </View>
            )}
          />
   
      </View>


            {/* 
       {this.state.is_amount_exceed ?
        <>
            <Animatable.Text style={styles.added_cash_amount_label} adjustsFontSizeToFit>          
                  Additional Cash:
              </Animatable.Text>
              <FakeCurrencyInput
                  value={this.state.added_cash_amount}
                  onChangeValue={(value)=>{
                    this.setState({added_cash_amount:value})                        
                  }}

                  onFocus={()=>this.setState({focus_added_cash_amount:true})}
                  onBlur={()=>this.setState({focus_added_cash_amount:false})}
                  prefix="₱"
                  delimiter=","
                  separator="."
                  minValue={0}
                  precision={2}          
                  style={[
                    styles.added_cash_amount,
                    {
                      borderColor:
                        this.state.focus_added_cash_amount == true
                          ? Colors.light_green
                          : this.state.error == true 
                          ? Colors.danger
                          : Colors.light,
                    },
                  ]}     
                        
                />
                </>
                : null
        }
         */}

         
              

            <View style={{ flexDirection:'row' ,top: (Layout.height / 100) * 20,}}>            
            {/* <RNPickerSelect
              onValueChange={value =>{                               
                console.warn(value);
                this.setState({fertilizer_category:value})              
              }} 
              useNativeAndroidPickerStyle={false}                                      
              onFocus = {()=>this.setState({focus_unit:true})}
              onBlur = {()=>this.setState({focus_unit:false})}              
              value={this.state.fertilizer_category}
              style = {{ inputAndroid: {
                width: (Layout.width / 100) * 70,        
                left: (Layout.width / 100) * 5,                
                fontFamily: 'Gotham_bold',
                borderWidth: 1,   
                paddingLeft:20,         
                color:'#a3a3a3',
                borderColor: this.state.focus_unit == true || this.state.fertilizer_category != '' ? Colors.light_green : Colors.fade,
                backgroundColor: this.state.focus_unit == true || this.state.fertilizer_category != '' ? Colors.light_green_tint:'transparent',
                fontSize: 16,
              },
              placeholder:{
                color:'#a3a3a3',                
                zIndex:1,
                paddingLeft:20,
                borderRadius: 5,
                borderWidth:1,
                borderColor: this.state.focus_unit == true || this.state.fertilizer_category != '' ? Colors.light_green : Colors.fade,
                }
              
              }}                        
              placeholder={{
                label: 'Select Unit Measurement',
                value: '',                
              }}
              items={this.state.categories}
            /> */}

            </View> 
        </View>
         {/* Quantity Input */}
         {/* <NumericInput          
         separatorWidth={0}         
          value={this.state.quantity}
          onChange={value => this.handleQuantity(value)}
          minValue={1}
          maxValue={99999}
          totalWidth={(Layout.width / 100) * 40}
          totalHeight={(Layout.height / 100) * 5}
          iconSize={25}
          initValue={this.state.quantity}
          step={0.1}
          valueType="real"
          rounded
          iconStyle={{color: 'white'}}
          inputStyle={styles.quantity_input}
          containerStyle={styles.quantity}
          rightButtonBackgroundColor={Colors.light_green}
          leftButtonBackgroundColor={Colors.light_green}
          upDownButtonsBackgroundColor={Colors.light_green}
        /> */}


        {/* Enter Amount Start  */}
        {/* <NumberFormat
                value={this.state.total_amount}
                displayType={'text'}
                decimalScale={2}                                
                
                thousandSeparator={true}                
                thousandsGroupStyle={'thousand'}
                onValueChange={values => console.warn(values)}
                renderText={(result, props) =>
                  this.renderAmountText(result)
                }
              /> */}

        {/* <Animatable.Text style={styles.total_amount_label} adjustsFontSizeToFit>          
            Total Amount:
        </Animatable.Text> */}
      
      {/* <FakeCurrencyInput
            value={this.state.total_amount}
            onChangeValue={(value)=>{
            
              this.setState({total_amount:value}) 


              if((value + this.state.total_amount) <= this.state.params.voucher_info.amount_val || value == 0){                
      
                this.setState({total_amount: value,is_amount_exceed:false});
              }else{
      
                this.setState({is_amount_exceed:true});
              }
              
            }}

            onFocus={()=>this.setState({focus_amount:true})}
            onBlur={()=>this.setState({focus_amount:false})}
            prefix="₱"
            delimiter=","
            separator="."
            minValue={0}
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
          /> */}
{/* 
          <RNPickerSelect
              onValueChange={value =>{                               
                this.setState({fertilizer_category:value})              
              }}
                              
         
              value={this.state.fertilizer_category}
              style = {pickerStyle}                        
              placeholder={{
                label: 'Select fertilizer category...',
                value: '',                
              }}
              items={this.state.categories}
            /> */}


        {/* Select category if the commodity has category*/}                

        {/* select fertilize category */}
        {/* {this.state.params.item.has_category == '1'?
        <View>
          <Animatable.Text style={styles.category_label} adjustsFontSizeToFit>          
              Fertilizer Category:
          </Animatable.Text>
          
          <RNPickerSelect
              onValueChange={value =>{                               
                this.setState({fertilizer_category:value})              
              }}
                              
         
              value={this.state.fertilizer_category}
              style = {pickerStyle}                        
              placeholder={{
                label: 'Select fertilizer category...',
                value: '',                
              }}
              items={this.state.categories}
            />
          </View>
            
          : null} */}

        {/* display total amount */}
{/* 
             <NumberFormat
                value={(this.state.params.voucher_info.amount_val - this.state.total_amount)} 
                displayType={'text'}
                decimalScale={2}
                fixedDecimalScale={true}
                thousandSeparator={true}
                renderText={(result, props) => (
                  <Animatable.Text
                    adjustsFontSizeToFit
                    style={[styles.total_amount, {fontSize: 15}]}>
                    {'Remaining Balance: '}

                    <Animatable.Text
                      adjustsFontSizeToFit
                      style={[styles.total_amount, {color: Colors.blue_green}]}>
                      ₱ {result}
                    </Animatable.Text>
                  </Animatable.Text>
                )}
              />  */}

   
         

        {/* <View style={{flex: 1}}>
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              
            }}>
            <Button
              textStyle={styles.add_to_cart_txt}
              style={styles.add_to_cart_btn}
              activityIndicatorColor={Colors.light}
              activeOpacity={100}
              disabledStyle={{opacity: 1}}
              onPress = { ()=> this.addToCart(
                this.state.total_amount              
              )}
              >
              Add to Cart
            </Button>
          </View>
        </View> */}

      </View>
    );
  }
} 



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  commodity_image: {
    width: (Layout.width / 100) * 20,
    height: (Layout.height / 100) * 20,
    top: (Layout.height / 100) * 8,
    alignSelf: 'center',
  },
  add_to_cart_txt: {
    color: Colors.light_green,
    fontFamily: 'Gotham_bold',
    fontSize:16
  },

  add_to_cart_btn: {
    top: (Layout.width / 100) * 1,    
    width: (Layout.width / 100) * 20,    
    left: (Layout.width / 100) * 30,
    borderColor: Colors.light,
    zIndex:-1
  },
  amount: {
    width: (Layout.width / 100) * 90,    
    left: (Layout.width / 100) * 5,
    fontFamily: 'Gotham_bold',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#F7F7F7',    
    color:Colors.green,
    fontSize: 20,
  },
  added_cash_amount: {
    width: (Layout.width / 100) * 90,
    top: (Layout.height / 100) * 35,
    left: (Layout.width / 100) * 5,
    fontFamily: 'Gotham_bold',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#F7F7F7',    
    color:Colors.green,
    fontSize: 20,
  },
  commodity_title: {
    top: (Layout.height / 100) * 15,
    left: 10,
    fontSize: 20,
    fontFamily: 'Gotham_bold',
    color: Colors.header_text,
  },
  total_amount_label: {
    
    left: 20,
    fontSize: 17,
    fontFamily: 'Gotham_bold',
    color: Colors.header_text,
  },
  quantity_amount_label: {
    
    left: 20,
    fontSize: 17,
    fontFamily: 'Gotham_bold',
    color: Colors.header_text,
  },
  added_cash_amount_label: {
    top: (Layout.height / 100) * 35,
    left: 20,
    fontSize: 17,
    fontFamily: 'Gotham_bold',
    color: Colors.header_text,
  },
  category_label: {
    
    left: 20,
    fontSize: 17,
    fontFamily: 'Gotham_bold',
    color: Colors.header_text,
  },
  ceiling_amount: {
    top: (Layout.height / 100) * 20,
    left: 10,
    fontSize: 30,
    fontFamily: 'Gotham_bold',
    color: Colors.header_text,
  },
  total_amount: {
    
    left: 30,
    fontSize: 25,
    fontFamily: 'Gotham_bold',
    color: Colors.header_text,
  },
  quantity: {    
    
    left: (Layout.width / 100) * 4,    
    borderWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  quantity_input: {
    
    color:Colors.header_text,
    borderWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  quantity_error: {
    position: 'absolute',
    top: (Layout.height / 100) * 35,
    left: (Layout.width / 100) * 5,
    fontFamily: 'Gotham_light',
    color: Colors.danger,
  },
  warning: {
    position: 'absolute',
    top: (Layout.height / 100) * 35,
    left: (Layout.width / 100) * 5,
    fontFamily: 'Gotham_light',
    color: Colors.danger,
  },
  fertilizer_category_warning: {
    position: 'absolute',
    top: (Layout.height / 100) * 45,
    left: (Layout.width / 100) * 5,
    fontFamily: 'Gotham_light',
    color: Colors.danger,
  },
  confirmButton: {
    backgroundColor: 'white',
    color: Colors.green,
    borderColor: Colors.green,
    borderWidth: 1,
  },
  confirmButtonText: {
    color: Colors.green,
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
