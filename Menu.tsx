import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Search } from './Search';
import { StopList } from './StopList';
import { MapScreen } from './Map'
import { Favorites } from './Favorites';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart'
import { faList, faQrcode } from '@fortawesome/free-solid-svg-icons'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass'
import { faMapPin } from '@fortawesome/free-solid-svg-icons/faMapPin'
import { UserProfile, UserProps } from './UserProfiles';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { Detail } from './Detail';
import Scan from './Scan';

const DetailStack = createStackNavigator();
//Menus de tipo stack, para poder volver atrás al componente desde el que se ha mostrado el detalle de la parada
function StopListScreen() {
    return (
        <DetailStack.Navigator>
            <DetailStack.Screen name="Paradas" component={StopList} />
            <DetailStack.Screen name="Detalle" component={Detail} />
        </DetailStack.Navigator>
    );
}
function SearchScreen() {
    return (
        <DetailStack.Navigator>
            <DetailStack.Screen name="Buscar" component={Search} />
            <DetailStack.Screen name="Detalle" component={Detail} />
        </DetailStack.Navigator>
    );
}

function FavScreen() {
    return (
        <DetailStack.Navigator>
            <DetailStack.Screen name="Favoritos" component={Favorites} />
            <DetailStack.Screen name="Detalle" component={Detail} />
        </DetailStack.Navigator>
    );
}
function ScanScreen() {
    return (
        <DetailStack.Navigator>
            <DetailStack.Screen name="Escaner" component={Scan} />
            <DetailStack.Screen name="Detalle" component={Detail} />
        </DetailStack.Navigator>
    );
}
const Tab = createBottomTabNavigator();
//Menú principal de la aplicación, que  se muestra en la parte inferior
//Con initialRouteName indicamos la pantalla de inicio
export function MyMenu(props: UserProps) {
    return (
        <Tab.Navigator initialRouteName='Perfil'>
            <Tab.Screen name="Paradas2" component={StopListScreen} options={{
                tabBarIcon: ({ color, size, focused }) => (
                    <FontAwesomeIcon icon={faList} color={focused ? "#A8D45A" : undefined} size={20} />
                ),
                tabBarActiveTintColor: "#90B848",
                headerShown: false,
                title: "Paradas"
            }} />
            <Tab.Screen name="Buscar2" component={SearchScreen} options={{
                tabBarIcon: ({ color, size, focused }) => (
                    <FontAwesomeIcon icon={faMagnifyingGlass} color={focused ? "#A8D45A" : undefined} size={20} />
                ),
                tabBarActiveTintColor: "#90B848",
                headerShown: false,
                title: "Buscar"
            }} />
            <Tab.Screen name="Mapa" component={MapScreen} options={{
                tabBarIcon: ({ color, size, focused }) => (
                    <FontAwesomeIcon icon={faMapPin} color={focused ? "#A8D45A" : undefined} size={20} />
                ),
                tabBarActiveTintColor: "#90B848"
            }} />
            <Tab.Screen name="Escaner2" component={ScanScreen} options={{
                tabBarIcon: ({ color, size, focused }) => (
                    <FontAwesomeIcon icon={faQrcode} color={focused ? "#A8D45A" : undefined} size={20} />
                ),
                tabBarActiveTintColor: "#90B848",
                headerShown: false,
                title: "Escaner"
            }} />
            <Tab.Screen name="Favoritos2" component={FavScreen} options={{
                tabBarIcon: ({ color, size, focused }) => (
                    <FontAwesomeIcon icon={faHeart} color={focused ? "#A8D45A" : undefined} size={20} />
                ),
                tabBarActiveTintColor: "#90B848",
                headerShown: false,
                title: "Favoritos"
            }} />
            <Tab.Screen name="Perfil" children={() => <UserProfile user={props.user} logout={props.logout} />} options={{
                tabBarIcon: ({ color, size, focused }) => (
                    <FontAwesomeIcon icon={faUser} color={focused ? "#A8D45A" : undefined} size={20} />
                ),
                tabBarActiveTintColor: "#90B848"
            }} />
        </Tab.Navigator>
    );
}