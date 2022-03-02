import React, {Component} from 'react';
import {View,Text, StyleSheet,FlatList,Image,Modal} from 'react-native';
import Colors from '../../constants/Colors';
import Images from '../../constants/Images';
import Layout from '../../constants/Layout';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { Card } from 'react-native-paper';
import Geolocation from '@react-native-community/geolocation';
import {launchCamera} from 'react-native-image-picker';
import ImageViewer from "react-native-image-zoom-viewer";
import ImageResizer from 'react-native-image-resizer';
import Button from 'apsl-react-native-button';
import {  Popup} from 'react-native-popup-confirm-toast';
import {  dump, insert,ImageIFD,GPSIFD,ExifIFD,GPSHelper} from "piexifjs";
// import Spinner from "react-native-loading-spinner-overlay";
import Spinner from 'react-native-spinkit';
import * as RNFS from 'react-native-fs';
import Swipeable from "react-native-gesture-handler/Swipeable";
import Icon from 'react-native-vector-icons/FontAwesome';
export default class AttachmentScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {          
        params:this.props.route.params,          
        latitude:'',
        longitude:'',
        show_spinner:false,
        other_documents_count:1,
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
            {
              name: "Other Documents",
              file: [],
            },
        
            
          ],
          showProgress:true,
          showImage:false,
          imageURI:''
    };
  }



  // show image
   showImage = (uri: any) => {
    this.setState({showImage:true,imageURI:uri});
    
  };



  rotateImage = async (uri) =>{
  const rotated_image = await   ImageResizer.createResizedImage('data:image/JPEG,'+uri, 1920, 1080, 'JPEG', 50, 90, RNFS.DocumentDirectoryPath);
  const convert_rotated_image_to_base64 = await RNFS.readFile(rotated_image.uri,'base64');
 
  return convert_rotated_image_to_base64;
}



   // Take Photo Button
 openCamera = async (document_type) => {
    
    let checkLocation = false;
     
    this.setState({show_spinner:true});
    Geolocation.getCurrentPosition(async (openLocation)=>{
            
    
      
 

    this.setState({showProgress:true})
    // check if location is open
    if(openLocation){
      
      
        // launch camera
       let getImagePicker = await launchCamera({
        mediaType: 'photo',
        includeBase64: true, 
        quality:0.5                   
      });
      

      
      if (!getImagePicker.didCancel) {

        
        getImagePicker.assets.map(async response => {
        

        // validate file type


        if(response.type == 'image/jpeg' || response.type == 'image/jpg') {
            this.setState({latitude:openLocation.coords.latitude,longitude:openLocation.coords.longitude})
            let image_rotate = await this.rotateImage(response.base64);
            
            

            
            // get geo tag
            let base64_uri_exif = this.geotagging(image_rotate,openLocation);
            
                this.setState({show_spinner:false});
            if (response.cancelled != true) {
              this.state.attachments.map((item, index) => {


                
                if (document_type == 'Other Documents' && item.name == 'Other Documents') {

                  
                  let attachmentState = [...this.state.attachments];
                  attachmentState[index].file.push(base64_uri_exif);
                  
                  this.setState({attachments:attachmentState})
                }else if (document_type == item.name) {

                  
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
            }else{
              this.setState({show_spinner:false});
            }
          } else{

            Popup.show({
              type: 'warning',              
              title: 'Message',
              textBody: "Your file format is not valid.",                
              buttonText:'I understand',
              okButtonStyle:styles.confirmButton,
              okButtonTextStyle: styles.confirmButtonText,
              callback: () => {                  
                Popup.hide()                                    
                
              },              
            })
          }
        });
       
       


      }else{
        this.setState({show_spinner:false});
      }


    
    }else{
    
      Popup.show({
        type: 'warning',              
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

// right content of swipeable
// delete item function
rightContent = (delete_index : any,item : any) => (
  <View style={{ top:(Layout.height / 100) * 5}}>
    <Icon
      name="trash"
      family="entypo"
      color={Colors.danger}
      size={50}
      onPress={() => {

        
        let new_data = this.state.attachments;

        new_data.map((item_result)=>{
          if(item_result.name == 'Other Documents'){
            // remove file of other documents
            item_result.file.splice(delete_index, delete_index + 1);
          }
        });


        this.setState({attachments:new_data})
        
        
        
        
      
        
      

        
     

        
      }}
    />

  </View>
);

// render card in flatlist
 renderItem = (item, index) => {
    return (

           // condition for other documents
    item.name == 'Other Documents' ?

    (     
      item.file.length == 0 ?
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
      :


      item.file.map((item_other_documents,index)=>(
    
        <View>
          {index == 0 &&
            <Text style={styles.title}> <FontAwesomeIcon name="info-circle" color={Colors.blue_green} size={25}/> {item.name}</Text>
          }

          <Swipeable renderRightActions={() => this.rightContent(index,item_other_documents)}>             
            <Card
              elevation={10}
              style={styles.card}
              onPress={() => this.showImage(item_other_documents)}
            >
              <Card.Cover
                resizeMode="contain"
                source={{ uri: "data:image/jpeg;base64," + item_other_documents }}
              />
              <Card.Actions>
                <Text
                  style={styles.retake}
                  onPress={() => this.openCamera(item.name)}
                >
                  Press here to retake photo...
                </Text>
              </Card.Actions>
            </Card>      
            </Swipeable>

            {item.file.length == (index +1) &&

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
            }
            

          </View>
        
      ))    
    )  
    
    :
    
    item.file == null ? (
      <View>
        <Text style={styles.title}> <FontAwesomeIcon name="info-circle" color={Colors.blue_green} size={25}/> {item.name} <Text style={[styles.title,{color:Colors.danger}]}>*</Text></Text>
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
    ) : 
 
    
        
    
    // valid id condition if both front and back is null
    item.name == "Valid ID" &&
      item.file[0].front == null &&
      item.file[0].back == null ? (
      <View>
        <Text style={styles.title}> <FontAwesomeIcon name="info-circle" color={Colors.blue_green} size={25}/> {item.name} <Text style={[styles.title,{color:Colors.danger}]}>*</Text></Text>
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
        <Text style={styles.title}> <FontAwesomeIcon name="info-circle" color={Colors.blue_green} size={25}/> {item.name} </Text>
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
            style={styles.card_add_icon}
          />
          
          <Text style={styles.card_text}>Press to add back side of ID</Text>

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
    )
    )};


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
        let newBase64 = insert(exifBtyes,'data:image/jpeg;base64,'+response);    
    
        return newBase64.replace('data:image/jpeg;base64,','');
                
      }


  // go to next screen Review Transaction
  handleGoToReview = ()=>{
    
    
    Geolocation.getCurrentPosition(async (geo_response)=>{


    if(geo_response){
    let parameters = {
      voucher_info: this.state.params.voucher_info,
      cart:this.state.params.cart,
      total_amount:this.state.params.total_amount,
      supplier_id: this.state.params.supplier_id,
      full_name: this.state.params.full_name,
      user_id: this.state.params.user_id,
      attachments:this.state.attachments,
      latitude:geo_response.coords.latitude,
      longitude:geo_response.coords.longitude
    }

    let check_null = 0 ;
    this.state.attachments.map((item) => {
      if (item.name == "Valid ID") {
        if (item.file[0].front == null) {
          check_null++;
        }
        if (item.file[0].back == null) {
          check_null++;
        }
      } else {
        
        if (item.file == null) {
          check_null++;
        }       
      }
    });
    
    if(check_null == 0){
      this.props.navigation.navigate('ReviewTransactionScreen',parameters);
    }else{
      Popup.show({
        type: 'warning',              
        title: 'Message',
        textBody: 'Please complete all required attachments.',                
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
      textBody: "Please turn on your location first.",                
      buttonText:'Okay',
      okButtonStyle:styles.confirmButton,
      okButtonTextStyle: styles.confirmButtonText,
      callback: () => {                  
        Popup.hide()                                    
        
      },              
    })
  }
  },(err)=>{
    console.warn(err)

  },{
    
    timeout: 20000, maximumAge: 3600000 

  });
    
    

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


        {/* attachments flatlist */}
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
              
          
        <Button
            textStyle={styles.next_txt}
            style={styles.next_btn}
            activityIndicatorColor={'white'}
            isLoading={this.state.isLoading}
            disabledStyle={{opacity: 1}} 
            onPress={this.handleGoToReview}
          >
            Review Transaction 
          </Button>  
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
    width: (Layout.width / 100) * 90,
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
    width: (Layout.width / 100) * 90,
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
  confirmButton:{
    backgroundColor:'white',
    color:Colors.green,
    borderColor:Colors.green,
    borderWidth:1
  },
  confirmButtonText:{  
    color:Colors.green,    
  },
  next_btn:{        
    width: (Layout.width / 100) * 90,
    left: (Layout.width / 100) * 5,
    borderColor: Colors.green,
    backgroundColor: Colors.green,    
  },
  next_txt:{
    color:Colors.light,    
    fontFamily:'Gotham_bold',
  }, 
  other_document_button:{        
    width: (Layout.width / 100) * 90,
    left: (Layout.width / 100) * 1,
    borderColor: Colors.dark_blue,
    backgroundColor: Colors.dark_blue,    
  },
  other_document_txt:{
    color:Colors.light,    
    fontFamily:'Gotham_bold',
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
