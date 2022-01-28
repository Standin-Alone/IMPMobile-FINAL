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
import Spinner from 'react-native-spinkit';
export default class FarmerProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {          
        params:this.props.route.params,
        history:this.props.route.params.history
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
    this.props.navigation.goBack();
  }

  handleGoToCommodity = () => { 
    let get_program = this.state.params.data[0].shortname;   
    console.warn(get_program);
    this.props.navigation.navigate('FuelScreen',this.state.params);    
    // if(get_program == 'FS'){      
    //   this.props.navigation.navigate('FuelScreen',this.state.params);    
    // }else if(get_program == 'RRP2' ){
    //   // navigation.navigate('FertilizerScreen',params);    
    // }
    
  }


  render() {
 
    return (
      <View  style={styles.container}>        

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
            Go to Commodities
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
  }
  
});
