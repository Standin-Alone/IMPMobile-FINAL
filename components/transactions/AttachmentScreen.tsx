import React, {Component} from 'react';
import {View,Text, StyleSheet,FlatList,Image} from 'react-native';
import Colors from '../../constants/Colors';
import Images from '../../constants/Images';
import Layout from '../../constants/Layout';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import * as Animatable from 'react-native-animatable';
import NetInfo from "@react-native-community/netinfo";
import axios from 'axios';
import * as ipConfig from '../../ipconfig';
import * as Yup from 'yup';
import { Formik } from 'formik';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card } from 'react-native-paper';
import * as Location from "expo-location";
import {launchCamera} from 'react-native-image-picker';
import ImageViewer from "react-native-image-zoom-viewer";
import Button from 'apsl-react-native-button';
import {  Popup} from 'react-native-popup-confirm-toast';
import {  dump, insert,ImageIFD,GPSIFD,ExifIFD,GPSHelper} from "piexifjs";
import Spinner from "react-native-loading-spinner-overlay";
export default class AttachmentScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {          
        params:this.props.route.params,          
        attachments:[
            {
              name: "Farmer with Commodity",
              file: null,
            },
            {
              name: "Valid ID",
              file: [{ front: null, back: null }],
            },
            {
              name: "Receipt",
              file: null,
            },
          ],
          showProgress:false
    };
  }


 async componentDidMount() {


    try{
        const status_foreground =
          await Location.requestForegroundPermissionsAsync();
       
     
  
        if (status_foreground.status !== "granted") {
          
          this.setState({showProgress:false});
        }
  
       
          // if (navigation.isFocused()) {
          //   const backAction = () => {        
          //     let data = {
          //       reference_num : params.data[0].reference_no
          //     }
          //     axios.post(ip_config.ip_address + "evoucher/api/discard_transaction", data).then(()=>{
          //         AlertComponent.discard_transaction_alert(navigation);
          //     }).catch(()=>{
          //         alert('Error! Please try again.');
          //     })    
              
          //     return true
          //   };
          //   const backHandler = BackHandler.addEventListener(
          //     "hardwareBackPress",
          //     backAction(this)
          //   );
  
          //   return () => {backHandler.remove()
            
          //     BackHandler.removeEventListener("hardwareBackPress", backAction);
            
          //   };
          // }
     
    }catch(error){
        console.warn(error)
    }
  }



   // Take Photo Button
 openCamera = async (document_type) => {
    
    let checkLocation = false;

    let openLocation = await Location.hasServicesEnabledAsync();

    this.setState({showProgress:true})

    if(openLocation){
      let location ;
      setTimeout(async()=>{ 
        location = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Lowest}).then((response)=>{      
          console.warn(response)
          checkLocation = true;
          return response;
        }).catch((err)=>{
          console.warn(err)    
          this.setState({showProgress:false})
          checkLocation = false;          
        }); 

      }, 3000);
      
       let getImagePicker = await launchCamera({
        mediaType: 'photo',
        includeBase64: true,
      });
      

      if (!getImagePicker.didCancel) {


        getImagePicker.assets.map(async response => {
             // get geo tag
        let base64_uri_exif = this.geotagging(response,location);
    
        if (response.cancelled != true) {
          this.state.attachments.map((item, index) => {
            if (document_type == item.name) {
              let attachmentState = [...this.state.attachments];
              attachmentState[index].file = base64_uri_exif;
              
              this.setState({attachments:attachmentState})
            } else if (document_type == item.name + "(front)") {
              //set file of front page of id
              let attachmentState = [...this.state.attachments];
              attachmentState[index].file[0].front = base64_uri_exif;
              
              this.setState({attachments:attachmentState})
            } else if (document_type == item.name + "(back)") {
              // set file of back page of id
              let attachmentState = [...this.state.attachments];
              attachmentState[index].file[0].back = base64_uri_exif;                
              this.setState({attachments:attachmentState})
            }
          });
        }

            
        });
       
       


      }




    
    }else{
      setShowProgrSubmit(false);
      AlertComponent.spiel_message_alert("Message","Please turn on your location first.", "Ok")

      Popup.show({
        type: 'success',              
        title: 'Message',
        textBody: "Please turn on your location first.",                
        buttonText:'Okay',
        okButtonStyle:styles.confirmButton,
        okButtonTextStyle: styles.confirmButtonText,
        callback: () => {                  
          Popup.hide()                                    
          this.props.route.params.my_cart({cart:data});
          this.props.navigation.goBack();
        },              
      })
    }


  };
  
// render card in flatlist
 renderItem = (item, index) => {
    return item.file == null ? (
      <View>
        <Text style={styles.title}> <FontAwesomeIcon name="info-circle" color={Colors.blue_green} size={25}/> {item.name}</Text>
        <Button
          color={Colors.base}
          style={styles.card_none}
          onPress={() => this.openCamera(item.name)}
        >
          <Image
            source={Images.add_photo}
            style={{ height: 50, resizeMode: "contain" }}
          />
          <Text>Click to add picture</Text>
        </Button>
      </View>
    ) : // valid id condition if both front and back is null
    item.name == "Valid ID" &&
      item.file[0].front == null &&
      item.file[0].back == null ? (
      <View>
        <Text style={styles.title}> <FontAwesomeIcon name="info-circle" color={Colors.blue_green} size={25}/> {item.name}</Text>
        <Button
          color={Colors.base}
          style={styles.card_none}
          onPress={() => this.openCamera(item.name + "(front)")}
        >
          <Image
            source={Images.add_photo}
            style={{ height: 50, resizeMode: "contain" }}
          />
          <Text>Click to add front page of id</Text>
        </Button>

        <Button
          color={Colors.base}
          style={styles.card_none}
          onPress={() => this.openCamera(item.name + "(back)")}
        >
          <Image
            source={Images.add_photo}
            style={{ height: 50, resizeMode: "contain" }}
          />
          <Text>Click to add back page of id</Text>
        </Button>
      </View>
    ) : // valid id condition
    item.name == "Valid ID" ? (
      <View>
        <Text style={styles.title}> <FontAwesomeIcon name="info-circle" color={Colors.blue_green} size={25}/> {item.name}</Text>
        {/* valid id front component */}
        {item.file[0].front == null ? (
          <Button
            color={Colors.base}
            style={styles.card_none}
            onPress={() => this.openCamera(item.name + "(front)")}
          >
            <Image
              source={Images.add_photo}
              style={{ height: 50, resizeMode: "contain" }}
            />
            <Text>Click to add front page of id.</Text>
          </Button>
        ) : (
          <Card
            elevation={10}
            style={styles.card}
            onPress={() => showImage(item.file[0].front)}
          >
            <Card.Cover
              resizeMode="contain"
              source={{ uri: "data:image/jpeg;base64," + item.file[0].front }}
            />
            <Card.Actions>
              <Text
                style={styles.retake}
                onPress={() => this.openCamera(item.name + "(front)")}
              >
                Click here to retake photo...
              </Text>
            </Card.Actions>
          </Card>
        )}
        {/* valid id back component */}
        {item.file[0].back == null ? (
          <Button
            color={Colors.base}
            style={styles.card_none}
            onPress={() => this.openCamera(item.name + "(back)")}
          >
            <Image
              source={Images.add_photo}
              style={{ height: 50, resizeMode: "contain" }}
            />
            <Text>Click to add back page of id.</Text>
          </Button>
        ) : (
          <Card
            elevation={10}
            style={styles.card}
            onPress={() => showImage(item.file[0].back)}
          >
            <Card.Cover
              resizeMode="contain"
              source={{ uri: "data:image/jpeg;base64," + item.file[0].back }}
            />
            <Card.Actions>
              <Text
                style={styles.retake}
                onPress={() => this.openCamera(item.name + "(back)")}
              >
                Click here to retake photo...
              </Text>
            </Card.Actions>
          </Card>
        )}
      </View>
    ) : (
      <View>
        <Text style={styles.title}>{item.name}</Text>
        <Card
          elevation={10}
          style={styles.card}
          onPress={() => showImage(item.file)}
        >
          <Card.Cover
            resizeMode="contain"
            source={{ uri: "data:image/jpeg;base64," + item.file }}
          />
          <Card.Actions>
            <Text style={styles.retake} onPress={() => this.openCamera(item.name)}>
              Click here to retake photo...
            </Text>
          </Card.Actions>
        </Card>
      </View>
    );
  };


    // GEO TAGGING
     geotagging = (response,param_loc)=>{

        let zeroth = {};
        let gps = {};
        let exif = {};
        zeroth[ImageIFD.Make] = "Make";
        // zeroth[ImageIFD.XResolution] = [777, 1];
        // zeroth[ImageIFD.YResolution] = [777, 1];
        // zeroth[ImageIFD.Software] = "Piexifjs";
        // exif[ExifIFD.DateTimeOriginal] = param_loc.timestamp;
        exif[ExifIFD.LensMake] = "LensMake";
        // exif[ExifIFD.Sharpness] = 777;
        gps[GPSIFD.GPSLatitude] = GPSHelper.degToDmsRational(param_loc.coords.latitude);
        gps[GPSIFD.GPSLongitude] = GPSHelper.degToDmsRational(param_loc.coords.longitude);
        gps[GPSIFD.GPSAltitude] = param_loc.coords.altitude;
        gps[GPSIFD.GPSLatitudeRef] = param_loc.coords.latitude < 0 ? 'S' : 'N';
        gps[GPSIFD.GPSLongitudeRef] = param_loc.coords.longitude < 0 ? 'W' : 'E';
    
        let exifObj = { "0th":zeroth,"Exif":exif, "GPS":gps};
        let exifBtyes = dump(exifObj);
        let newBase64 = insert(exifBtyes,'data:image/jpeg;base64,'+response.base64);    
    
        return newBase64.replace('data:image/jpeg;base64,','');
                
      }


  

  render() {

    return (
      <View  style={styles.container}>        
       <Spinner
        visible={this.state.showProgress}
        color={Colors.blue_green}
        size="large"
        indicatorStyle={{ height: 1 }}
      />
        <FlatList
            nestedScrollEnabled
            data={this.state.attachments}
            extraData={this.state.attachments}
            style={styles.flat_list}
            ListEmptyComponent={() => (
              <View>
                <Button
                  color={Colors.green}
                  style={styles.card_none}
                  onPress={this.openCamera}
                >
                  <Image
                    source={Images.add_photo}
                    style={{ height: 50, resizeMode: "contain" }}
                  />
                  <Text>Click to add picture.</Text>
                </Button>
              </View>
            )}
            renderItem={({ item, index }) => this.renderItem(item, index)}
            keyExtractor={(item) => item.name}
          />


      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  flat_list: {
    marginTop: (Layout.height / 100) * 10,
    marginBottom: (Layout.height / 100) * 2,
    width: (Layout.width / 100) * 92,
    alignSelf: "center",
  },
  card: {
    marginTop: 10,
    marginHorizontal: 2,
    marginBottom: 20,
    borderRadius: 15,

    width: (Layout.width / 100) * 92,
  },
  card_none: {
    backgroundColor: Colors.light_green,
    opacity:0.5,
    marginTop: 10,
    marginHorizontal: 2,
    marginBottom: 20,
    borderRadius: 15,
    height: 200,
    borderColor:Colors.blue_green,
    borderWidth:1,
    width: (Layout.width / 100) * 92,
  },
  title: {
    color: Colors.blue_green,
    justifyContent: "flex-start",
    fontFamily: "calibri-light",
    fontSize: 26,
  },
  retake: {
    color: Colors.base,
    fontFamily: "calibri-light",
    fontSize: 16,
    fontWeight: "100",
    left: (Layout.width / 100) * 40,
  },
});
