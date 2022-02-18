import React, {Component} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import Colors from '../../constants/Colors';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Layout from '../../constants/Layout';
import * as Animatable from 'react-native-animatable';
import * as Yup from 'yup';
import {Formik} from 'formik';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNPickerSelect from 'react-native-picker-select';
import Button from 'apsl-react-native-button';
import NumberFormat from 'react-number-format';
import {Fumi} from 'react-native-textinput-effects';
import NumericInput from 'react-native-numeric-input';
import {Popup} from 'react-native-popup-confirm-toast';
import {SharedElement} from 'react-navigation-shared-element';

export default class SelectedCommodityScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      params: this.props.route.params,
      focus_amount: false,
      amount: '',
      quantity: 1.0,
      total_amount: 0.0,
      error: false,
      message: '',
      validation: Yup.object({
        amount: Yup.number()
          .typeError('Amount must be a number.')
          .required('Please enter your amount.')
          .notOneOf([0], 'Please enter your amount.'),

      fertilizer_category:Yup.string().required('Please select fertilizer type')
      }),
      selected_commodity: [],
    };
  }

  componentDidMount() {}
  //  add to cart button
  addToCart = (price, limit_price) => {
    if (price <= limit_price ||    // condition for one time transaction of fertilizer
      (this.state.params.item.ceiling_amount == 0.00 && 
        this.state.params.voucher_info.one_time_transaction == 1)) {
      let data = {
        sub_id: this.state.params.item.sub_id,
        image: this.state.params.item.base64,
        name: this.state.params.item.item_name,
        unit_measure: this.state.params.item.unit_measure,
        ceiling_amount: this.state.params.item.ceiling_amount,
        total_amount: this.state.total_amount,
        quantity: this.state.quantity,
        price: this.state.amount,
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
    } else if (isNaN(price)) {
      Popup.show({
        type: 'danger',
        title: 'Error!',
        textBody: 'Please enter your amount and quantity of commodity.',
        buttonText: 'Ok',
        okButtonStyle: styles.confirmButton,
        okButtonTextStyle: styles.confirmButtonText,
        callback: () => {
          Popup.hide();
        },
      });
    } else if (price == 0) {
      Popup.show({
        type: 'danger',
        title: 'Error!',
        textBody: 'Please enter your amount and quantity of commodity.',
        buttonText: 'Ok',
        okButtonStyle: styles.confirmButton,
        okButtonTextStyle: styles.confirmButtonText,
        callback: () => {
          Popup.hide();
        },
      });
    }
  };

  //quantity function
  handleQuantity = value => {
    
    var total_amount = parseFloat(this.state.amount) * value;

    if (
      isNaN(this.state.amount) ||
      total_amount <= this.state.params.item.ceiling_amount ||
      // condition for one time transaction of fertilizer
      (this.state.params.item.ceiling_amount == 0.00 && 
        this.state.params.voucher_info.one_time_transaction == 1)
    ) {
      this.setState({
        total_amount: total_amount,
        quantity: value,
        error: false,
      });
    } else {
      this.setState({
        total_amount: total_amount,
        quantity: value,
        message: 'You exceed on the price limit ',
        error: true,
      });
    }
  };

  // amount textbox value change
  amountValueChange = values => {
    const {formattedValue, value} = values;

    var converted_value = parseFloat(value);
    var total_amount = converted_value * this.state.quantity;    
    if (
      isNaN(converted_value) ||
      total_amount <= this.state.params.item.ceiling_amount ||
      // condition for one time transaction of fertilizer
      (this.state.params.item.ceiling_amount == 0.00 &&
        this.state.params.voucher_info.one_time_transaction == 1)
    ) {
      this.setState({
        total_amount: total_amount,
        error: false,
      });
    } else {
      this.setState({
        total_amount: total_amount,
        error: true,
        message: 'You exceed on the limit price ',
      });
    }
  };

  // render amount text box
  renderAmountText = (values, errors, touched, setFieldValue) => {
    return (
      <Fumi
        label={'Enter your amount'}
        iconClass={Ionicons}
        iconName={'pricetag'}
        iconColor={Colors.green}
        iconSize={20}
        iconWidth={40}
        inputPadding={16}
        maxLength={7}
        style={[
          styles.amount,
          {
            borderColor:
              this.state.focus_amount == true || this.state.amount.length != 0
                ? Colors.light_green
                : this.state.error == true || (errors.amount && touched.amount)
                ? Colors.danger
                : Colors.light,
          },
        ]}
        onFocus={() => this.setState({focus_amount: true})}
        onBlur={() => this.setState({focus_amount: false})}
        onChangeText={value => {
          setFieldValue('amount', value);
          this.setState({amount: value});
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

        <Animatable.Text style={styles.commodity_title}>
          <FontAwesomeIcon
            name="info-circle"
            color={Colors.blue_green}
            size={20}
          />{' '}
          {this.state.params.item.item_name} (
          {this.state.params.item.unit_measure})
        </Animatable.Text>
        {/* Quantity Input */}
        <NumericInput
          type='up-down'
          value={this.state.quantity}
          onChange={value => this.handleQuantity(value)}
          minValue={1}
          maxValue={99999}
          totalWidth={240}
          totalHeight={50}
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

        {this.state.params.item.ceiling_amount != 0.0 && (
          <Animatable.Text style={styles.ceiling_amount}>
            {' '}
            {'₱' + this.state.params.item.ceiling_amount}{' '}
          </Animatable.Text>
        )}

        <Formik
          initialValues={{amount: 0,fertilizer_category:''}}
          validationSchema={this.state.validation}
          onSubmit={values =>
            this.addToCart(
              this.state.total_amount,
              this.state.params.item.ceiling_amount,
            )
          }
          // validateOnChange={false}
        >
          {({
            values,
            setFieldValue,
            errors,
            setFieldTouched,
            touched,
            isValid,
            handleSubmit,
          }) => (
            <View>
              <NumberFormat
                value={this.state.amount}
                displayType={'text'}
                decimalScale={2}
                thousandSeparator={true}
                onValueChange={values => this.amountValueChange(values)}
                renderText={(result, props) =>
                  this.renderAmountText(result, errors, touched, setFieldValue)
                }
              />

              {/* display error amount here */}
              {errors.amount && touched.amount ? (
                <Text style={[styles.warning]}>
                  <Icon name="exclamation-triangle" size={20} /> {errors.amount}
                </Text>
              ) : null}

              {this.state.error == true ? (
                <Text style={styles.quantity_error}>
                  <Icon name="exclamation-triangle" size={20} />{' '}
                  {this.state.message}{' '}
                </Text>
              ) : null}


              {/* select fertilize category */}
              <RNPickerSelect
                onValueChange={value =>{ 
                  
                  setFieldValue('fertilizer_category',value);
                  this.setState({fertilizer_category:value})
                
                }}
              
                value={values.fertilizer_category}
                style = {pickerStyle}
                placeholder={{
                  label: 'Select fertilizer category...',
                  value: '',
                  
                }}
                items={[
                  {label: 'Complete (14-14-14)', value: 'Complete (14-14-14)'},
                  {label: 'Complete 16-16-16)', value: 'Complete 16-16-16)'},
                  {label: 'Urea - Prilled (46-0-0)', value: 'Urea - Prilled (46-0-0)'},
                  {label: 'Urea - Granular (46-0-0)', value: 'Urea - Granular (46-0-0)'},
                  {label: 'Ammonium Sulfate (21-0-0)', value: 'Ammonium Sulfate (21-0-0)'},
                  {label: 'Ammonium Phosphate (16-20-0)', value: 'Ammonium Phosphate (16-20-0)'},
                  {label: 'Muriate of Potash (0-0-60)', value: 'Muriate of Potash (0-0-60)'},
                  {label: 'Others (to be specified/indicated)', value: 'others'},
                ]}
              />

               {/* display error category here */}
              {errors.fertilizer_category && touched.fertilizer_category ? (
                <Text style={[styles.fertilizer_category_warning]}>
                  <Icon name="exclamation-triangle" size={20} /> {errors.fertilizer_category}
                </Text>
              ) : null}

          

              {/* display total amount */}

              <NumberFormat
                value={this.state.total_amount}
                displayType={'text'}
                decimalScale={2}
                fixedDecimalScale={true}
                thousandSeparator={true}
                renderText={(result, props) => (
                  <Animatable.Text
                    style={[styles.total_amount, {fontSize: 15}]}>
                    {'Total Amount: '}

                    <Animatable.Text
                      style={[styles.total_amount, {color: Colors.blue_green}]}>
                      ₱ {result}
                    </Animatable.Text>
                  </Animatable.Text>
                )}
              />

              <View style={{flex: 1}}>
                <View
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    top: (Layout.height / 100) * 38,
                  }}>
                  <Button
                    textStyle={styles.add_to_cart_txt}
                    style={styles.add_to_cart_btn}
                    activityIndicatorColor={Colors.light}
                    activeOpacity={100}
                    disabledStyle={{opacity: 1}}
                    onPress={handleSubmit}>
                    Add to Cart
                  </Button>
                </View>
              </View>
            </View>
          )}
        </Formik>
      </View>
    );
  }
} 


const pickerStyle = { inputAndroid: {
  width: (Layout.width / 100) * 90,
  top: (Layout.height / 100) * 30,
  left: (Layout.width / 100) * 5,
  fontFamily: 'Gotham_bold',
  borderWidth: 1,
  borderRadius: 10,
  backgroundColor: '#F7F7F7',
  fontSize: 20,
},
placeholder:{
  color:'#a3a3a3'
}

}

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
    color: Colors.light,
    fontFamily: 'Gotham_bold',
  },

  add_to_cart_btn: {
    width: (Layout.width / 100) * 90,
    left: (Layout.width / 100) * 5,
    borderColor: Colors.green,
    backgroundColor: Colors.green,
  },
  amount: {
    width: (Layout.width / 100) * 90,
    top: (Layout.height / 100) * 25,
    left: (Layout.width / 100) * 5,
    fontFamily: 'Gotham_bold',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#F7F7F7',
    fontSize: 20,
  },
  commodity_title: {
    top: (Layout.height / 100) * 15,
    left: 10,
    fontSize: 14,
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
    left: (Layout.width / 100) * 60,
    width: (Layout.width / 100) * 35,    
    
    borderWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  quantity_input: {
    width: (Layout.width / 100) * 8,
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
