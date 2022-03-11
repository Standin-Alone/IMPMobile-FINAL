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

export default class SelectedCommodityScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      params: this.props.route.params,
      focus_amount: false,
      amount: '',
      quantity: 1.0,
      total_amount: 0,
      error: false,
      message: '',      
      selected_commodity: [],
      fertilizer_category:'',
      categories:[]
    };
  }
  
  //  add to cart button
  addToCart = async (price, ) => {
  
    if ((price != 0.00  || price != 0 ) &&
        this.state.fertilizer_category != ''
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
        }}
        
        value={values}
        keyboardType="number-pad"
      />
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <SharedElement id={this.state.params.item.item_id}>
          <Image
            source={{
              uri: 'data:image/jpeg;base64,' + this.state.params.item.base64,
            }}
            style={styles.commodity_image}
          />
        </SharedElement>

        <Animatable.Text style={styles.commodity_title} adjustsFontSizeToFit>          
          {this.state.params.item.item_name} (
          {this.state.params.item.unit_measure})
        </Animatable.Text>

         {/* Quantity Input */}
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
          leftButtonBackgroundColor={Colors.light_green}
          upDownButtonsBackgroundColor={Colors.light_green}
        />


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

        <Animatable.Text style={styles.total_amount_label} adjustsFontSizeToFit>          
            Total Amount:
        </Animatable.Text>
      
      <FakeCurrencyInput
            value={this.state.total_amount}
            onChangeValue={(value)=>{
              this.setState({total_amount:value})                        
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
          />

        {/* Select category if the commodity has category*/}                

        {/* select fertilize category */}
        {this.state.params.item.has_category == '1'?
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
            
          : null}
            

             {/* display total amount */}

             {/* <NumberFormat
                value={this.state.total_amount}
                displayType={'text'}
                decimalScale={2}
                fixedDecimalScale={true}
                thousandSeparator={true}
                renderText={(result, props) => (
                  <Animatable.Text
                    adjustsFontSizeToFit
                    style={[styles.total_amount, {fontSize: 15}]}>
                    {'Total Amount: '}

                    <Animatable.Text
                      adjustsFontSizeToFit
                      style={[styles.total_amount, {color: Colors.blue_green}]}>
                      ₱ {result}
                    </Animatable.Text>
                  </Animatable.Text>
                )}
              /> */}


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


const pickerStyle = StyleSheet.create( { inputAndroid: {
  width: (Layout.width / 100) * 90,
  top: (Layout.height / 100) * 30,
  left: (Layout.width / 100) * 5,
  
  fontFamily: 'Gotham_bold',
  borderWidth: 0.5,    
  borderRadius: 50,
  backgroundColor: '#F7F7F7',
  fontSize: 20,
},
placeholder:{
  color:'#a3a3a3',
}

});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  commodity_image: {
    width: 250,
    height: 250,
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
    
  },
  amount: {
    width: (Layout.width / 100) * 90,
    top: (Layout.height / 100) * 25,
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
    top: (Layout.height / 100) * 25,
    left: 20,
    fontSize: 17,
    fontFamily: 'Gotham_bold',
    color: Colors.header_text,
  },
  category_label: {
    top: (Layout.height / 100) * 30,
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
    top: (Layout.height / 100) * 36,
    left: 30,
    fontSize: 25,
    fontFamily: 'Gotham_bold',
    color: Colors.header_text,
  },
  quantity: {
    position: 'absolute',
    top: (Layout.height / 100) * 52,
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
 
});
