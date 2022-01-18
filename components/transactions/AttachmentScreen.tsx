import React, {Component} from 'react';
import {View,Text, StyleSheet,FlatList,Image,Modal} from 'react-native';
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
import { Card } from 'react-native-paper';
import Geolocation from '@react-native-community/geolocation';
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
          showProgress:false,
          showImage:false,
          imageURI:''
    };
  }


 async componentDidMount() {



     
    
  }



  // show image
   showImage = (uri: any) => {
    this.setState({showImage:true,imageURI:uri});
    
  };




   // Take Photo Button
 openCamera = async (document_type) => {
    
    let checkLocation = false;
     
    
    Geolocation.getCurrentPosition(async (openLocation)=>{
            
    
      
 

    this.setState({showProgress:true})

    if(openLocation){
   
        
      
       let getImagePicker = await launchCamera({
        mediaType: 'photo',
        includeBase64: true,
      });
      

      if (!getImagePicker.didCancel) {


        getImagePicker.assets.map(async response => {
             // get geo tag
        let base64_uri_exif = this.geotagging(response,openLocation);
    
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
      
      

      Popup.show({
        type: 'success',              
        title: 'Message',
        textBody: "Please turn on your location first.",                
        buttonText:'Okay',
        okButtonStyle:styles.confirmButton,
        okButtonTextStyle: styles.confirmButtonText,
        callback: () => {                  
          Popup.hide()                                    
          
        },              
      })
    }
  })



  };
  
// render card in flatlist
 renderItem = (item, index) => {
    return item.file == null ? (
      <View>
        <Text style={styles.title}> <FontAwesomeIcon name="info-circle" color={Colors.blue_green} size={25}/> {item.name}</Text>
        <Button
          
          style={styles.card_none}
          onPress={() => this.openCamera(item.name)}
        >
          <Image
            source={Images.add_photo}
            style={styles.card_add_icon}
          />
          
          <Text style={styles.card_text}>Press to add picture</Text>
        </Button>
      </View>
    ) : // valid id condition if both front and back is null
    item.name == "Valid ID" &&
      item.file[0].front == null &&
      item.file[0].back == null ? (
      <View>
        <Text style={styles.title}> <FontAwesomeIcon name="info-circle" color={Colors.blue_green} size={25}/> {item.name}</Text>
        <Button
          
          style={styles.card_none}
          onPress={() => this.openCamera(item.name + "(front)")}
        >       
          <Image
            source={Images.add_photo}
            style={styles.card_add_icon}
          />
          
          <Text style={styles.card_text}>Press to add front side of ID</Text>


        </Button>

        <Button
          
          style={styles.card_none}
          onPress={() => this.openCamera(item.name + "(back)")}
        >
         
          <Image
            source={Images.add_photo}
            style={styles.card_add_icon}
          />
          
          <Text style={styles.card_text}>Press to add back side of ID</Text>

        </Button>
      </View>
    ) : // valid id condition
    item.name == "Valid ID" ? (
      <View>
        <Text style={styles.title}> <FontAwesomeIcon name="info-circle" color={Colors.blue_green} size={25}/> {item.name}</Text>
        {/* valid id front component */}
        {item.file[0].front == null ? (
          <Button
            
            style={styles.card_none}
            onPress={() => this.openCamera(item.name + "(front)")}
          >
            <Image
              source={Images.add_photo}
              style={{ height: 50, resizeMode: "contain" }}
            />
            <Text>Press to add front side of ID.</Text>
          </Button>
        ) : (
          <Card
            elevation={10}
            style={styles.card}
            onPress={() => this.showImage(item.file[0].front)}
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
                Press here to retake photo...
              </Text>
            </Card.Actions>
          </Card>
        )}
        {/* valid id back component */}
        {item.file[0].back == null ? (
          <Button
            
            style={styles.card_none}
            onPress={() => this.openCamera(item.name + "(back)")}
          >
            <Image
              source={Images.add_photo}
              style={{ height: 50, resizeMode: "center" }}
            />
            <Text style={{fontSize:100}}>Press to add back side of ID.</Text>
          </Button>
        ) : (
          <Card
            elevation={10}
            style={styles.card}
            onPress={() => this.showImage(item.file[0].back)}
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
                Press here to retake photo...
              </Text>
            </Card.Actions>
          </Card>
        )}
      </View>
    ) : (
      <View>
        <Text style={styles.title}><FontAwesomeIcon name="info-circle" color={Colors.blue_green} size={25}/>{item.name}</Text>
        <Card
          elevation={10}
          style={styles.card}
          onPress={() => this.showImage(item.file)}
        >
          <Card.Cover
            resizeMode="contain"
            source={{ uri: "data:image/jpeg;base64," + item.file }}
          />
          <Card.Actions>
            <Text style={styles.retake} onPress={() => this.openCamera(item.name)}>
              Press here to retake photo...
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
  card_text:{
    alignContent:'center',
    top:(Layout.height / 100) * 8
  },
  card_add_icon:{
     height: 50, 
     resizeMode: "contain" ,
     position:'absolute',
     alignSelf:'center'
  },
  title: {
    color: Colors.blue_green,
    justifyContent: "flex-start",
    fontFamily: "calibri-light",
    fontSize: 26,
  },
  retake: {
    color: Colors.green,
    fontFamily: "calibri-light",
    fontSize: 16,
    fontWeight: "100",
    left: (Layout.width / 100) * 40,
  },
});