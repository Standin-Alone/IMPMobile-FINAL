import React, {Component} from 'react';
import {View,Text, StyleSheet, Keyboard,Image,FlatList,RefreshControl} from 'react-native';
import Timeline from 'react-native-timeline-flatlist'
import Layout from '../constants/Layout';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import Colors from '../constants/Colors';
import { layer } from '@fortawesome/fontawesome-svg-core';
import NetInfo from "@react-native-community/netinfo";
import * as ipConfig from '../ipconfig';
import axios from 'axios';

export default class PayoutTracking extends Component {
  constructor(props) {
    super(props);
    this.state = {
      params:this.props.route.params,
      payout_transaction_list:[],
      data:[]
    };

    






  }



  
  fetch_data = () =>{
      
        
    this.setState({refreshing:true,selected_filter:'All'});
    NetInfo.fetch().then(async (response) => {

      
      const batch_id    = this.state.params.batch_info.batch_id;    
      console.warn(batch_id);
      if (response.isConnected && response.isInternetReachable) {            
      const  result = await axios.get(
        ipConfig.ipAddress+ "/get-payout-transaction-list/"+batch_id+"/"+0,         
        ).catch((error)=>error.response.data.message);
        
        // if status is 200
        if (result.status == 200) {       
          
          this.setState({ payout_transaction_list:result.data[0],
                          refreshing:false,
                          data: [
                            { title: result.data[0].approved_by_consolidator === null  ? 'For Consolidation' : 'Consolidated',
                              icon:<FontAwesome5 name={result.data[0].approved_by_consolidator === null ? 'hourglass-half' : 'check-circle'} size={30} style={{opacity: 1}}  color = {result.data[0].approved_by_consolidator === null ? Colors.muted : Colors.green}/>,
                              description: result.data[0].approved_by_consolidator === null ? 'Your payout is ready to consolidate by the RFO Focal.' : '' ,
                              opacity:1
                            },
                            { title: result.data[0].approved_by_reviewer === null  ?  'For Reviewing' : 'Reviewed',
                              icon:<FontAwesome5 name={result.data[0].approved_by_reviewer === null ? 'hourglass-half' : 'check-circle'} size={30} style={{opacity: result.data[0].approved_by_consolidator ===  null ? 0.4 : 1}} color = {result.data[0].approved_by_reviewer === null ? Colors.muted : Colors.green}  /> ,
                              description: result.data[0].approved_by_reviewer === null ? 'Your batch is ready to review.':'',
                              opacity: result.data[0].approved_by_consolidator === null ?  0.4 :  1
                            },  
                            { title: result.data[0].approved_by_approver === null ?  'For Approval' : 'Approved',
                              icon:<FontAwesome5 name={result.data[0].approved_by_approver === null ? 'hourglass-half' : 'check-circle'} size={30} style={{opacity: result.data[0].approved_by_reviewer ===  null ? 0.4 : 1}}  color = {result.data[0].approved_by_approver === null ? Colors.muted : Colors.green}   />,
                              description: result.data[0].approved_by_approver  === null ? 'Your batch is ready to approve.': '',
                              opacity:  result.data[0].approved_by_reviewer === null ?  0.4  : 1
                            },

                            { title: result.data[0].approved_by_approver !== null &&  result.data[0].approved_by_reviewer !== null  && result.data[0].approved_by_consolidator !== null && result.data[0].iscomplete == 0 ?  'Submitted to the Bank' : result.data[0].iscomplete == 1 ? 'Submitted to the Bank' : 'For Submission to DBP',
                              icon:<FontAwesome5 name={result.data[0].approved_by_approver !== null &&  result.data[0].approved_by_reviewer !== null  && result.data[0].approved_by_consolidator !== null && result.data[0].iscomplete == 0 ? 'check-circle' : result.data[0].iscomplete == 1 ?  'check-circle' :'hourglass-half'} size={30}  style={{opacity: result.data[0].approved_by_reviewer ===  null ? 0.4 : 1}}  color = {result.data[0].approved_by_approver !== null &&  result.data[0].approved_by_reviewer !== null  && result.data[0].approved_by_consolidator !== null && result.data[0].iscomplete == 0 ? Colors.green  :  result.data[0].iscomplete == 1 ? Colors.green   : Colors.muted} />,
                              description: result.data[0].approved_by_approver !== null &&  result.data[0].approved_by_reviewer !== null  && result.data[0].approved_by_consolidator !== null && result.data[0].iscomplete == 0 ? 'Your batch has been sent to the central to send your payout to the bank.' : '',
                              opacity: result.data[0].approved_by_approver === null ?  0.4  : 1
                            },

                            { title: result.data[0].approved_by_approver !== null &&  result.data[0].approved_by_reviewer !== null  && result.data[0].approved_by_consolidator !== null && result.data[0].iscomplete == 1 ? 'Done' : 'Done' ,
                              icon:<FontAwesome5 name={result.data[0].approved_by_approver !== null &&  result.data[0].approved_by_reviewer !== null  && result.data[0].approved_by_consolidator !== null && result.data[0].iscomplete == 1 ? 'check-circle' : result.data[0].iscomplete == 1 ?  'check-circle' : 'hourglass-half'} size={30} style={{opacity: result.data[0].approved_by_reviewer ===  null ? 0.4 : 1}} color = {result.data[0].approved_by_approver !== null &&  result.data[0].approved_by_reviewer !== null  && result.data[0].approved_by_consolidator !== null && result.data[0].iscomplete == 1 ? Colors.green : Colors.muted}  />,
                              description:'Your batch payout has been sucessfully sent to the bank.',
                              opacity: result.data[0].approved_by_approver !== null &&  result.data[0].approved_by_reviewer !== null  && result.data[0].approved_by_consolidator !== null && result.data[0].iscomplete == 1 ? 1  : 0.4
                            },        
                            
                            ]
                        
                        
                        
                        })                    
          
        }

        


        this.setState({refreshing:false});
      } else {
        Popup.show({
          type: 'danger',
          title: 'Message',
          textBody: 'No Internet Connection.Please check your internet connection.',
          buttonText: 'Okay',
          okButtonStyle: styles.confirmButton,
          okButtonTextStyle: styles.confirmButtonText,
          callback: () => {  
            Popup.hide();
          },
        });
        this.setState({refreshing:false});
      }
    
    });
    
  }


  componentDidMount(){
    this.fetch_data()
  }
  render() {

    return (
      <View style={styles.container}>
          <View style={styles.timelineContainer}>          
            <Timeline
              data={this.state.data}
              innerCircle={'icon'}
              titleStyle={styles.timelineTitle}
              circleSize={40}
              circleColor={Colors.primary_bg_color}
              lineColor={Colors.muted}
              showTime={false}
              
              renderDetail={(rowData, sectionID, rowID) =>
              (<View style={{ opacity:rowData.opacity }}>
                  <Text style={styles.detailText} adjustsFontSizeToFit>{rowData.title}</Text>
                  <View>
                    <Text style={styles.detailDesc} adjustsFontSizeToFit>{rowData.description}</Text>
                  </View>
              </View>)}
              
            />
          </View>
     </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  timelineContainer:{
    flex:1,
    top:(Layout.width / 100) * 20,    
  },
  timelineTitle:{
    fontSize:30
  },
  detailText:{
    fontWeight:'bold',
    fontSize:30

  },
  detailDesc:{

  }
});
