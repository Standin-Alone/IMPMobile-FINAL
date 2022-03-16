
import { createDrawerNavigator } from '@react-navigation/drawer';
import LoginScreen from '../components/LoginScreen';
const Drawer = createDrawerNavigator();


const DrawerNavigator = () => {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="LoginScreen" component={LoginScreen} />      
    </Drawer.Navigator>
  )
}

export default DrawerNavigator