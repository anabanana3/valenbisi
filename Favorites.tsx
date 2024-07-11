import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Region, StopsData } from './Map';
import { faHeart, faCircle, faBicycle, faSquareParking, faLocationArrow, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { getDistance } from 'geolib';
import * as Location from 'expo-location';
export type ItemProps = {
    item: StopsData;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
};
export const getColorStyle = (item: any) => {
    if (item.properties.available > 0 && item.properties.free > 0) return "#A8D45A";
    else if (item.properties.free === 0) return "#FFC300";
    else if (item.properties.available === 0) return "#FF5733";
}
let timeout: any = undefined;
export const Favorites = ({ navigation }: any) => {
    const [items, setItems] = useState<StopsData[] | undefined>(undefined);
    const [currLoc, setCurrLoc] = useState<Region | undefined>(undefined);
    const [error, setError] = useState(false);
    useEffect(() => {
        loadData();
        if (!currLoc) getCurrentLocation();
        reloadData()
    }, [])

    async function loadData() {
        const it = await getStops();
        //console.log('it', items)
        if (!items || (it && it.length !== items.length)) setItems(it);
    }
    const getStops = async () => {
        const data: StopsData[] | undefined = await getData();
        return data;
    }
    const reloadData = () => {
        if (timeout) clearTimeout(timeout);
        console.log('reloadFav')

        setTimeout(() => reloadData(), 5000);
        loadData();
    }
    console.log('favorites')
    const getCurrentLocation = async () => {
        //comprobar permiso de localizacion
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('No hay permisos de localización');
            return;
        }
        //Obtener posición GPS
        let location = await Location.getCurrentPositionAsync({});
        let region = {
            latitude: parseFloat(location.coords.latitude.toString()),
            longitude: parseFloat(location.coords.longitude.toString()),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
        }
        setCurrLoc(region);
    }

    const Item = ({ item, onPress, backgroundColor, textColor }: ItemProps) => {
        let distance: number | string = currLoc ? getDistance({ latitude: item.geometry.coordinates[1], longitude: item.geometry.coordinates[0] }, { latitude: currLoc.latitude, longitude: currLoc.longitude }) : 0;
        let km = false;
        if (distance > 1000) {
            distance = (distance / 1000).toFixed(2);
            km = true;
        }
        const isFav = true;
        return (
            <TouchableOpacity onPress={onPress} style={[styles.item, { backgroundColor }]}>
                <Text style={[styles.title, { color: textColor }]}>{<FontAwesomeIcon icon={faHeart} size={20} color={isFav ? "#C70039" : textColor} />}{" "}{item.properties.name}</Text>
                <Text style={[styles.textItalic, { color: textColor }]}>{item.properties.address}</Text>
                <View style={styles.border}>
                    <Text style={[styles.subtitle, { color: textColor }]}>
                        <FontAwesomeIcon icon={faCircle} size={25} color={getColorStyle(item)} />{" "}

                        <FontAwesomeIcon icon={faBicycle} size={25} color={textColor} />{" " + item.properties.available}
                        {" "}
                        <FontAwesomeIcon icon={faSquareParking} size={25} color={textColor} />{" " + item.properties.free}
                        {"           "}
                        <FontAwesomeIcon icon={faLocationArrow} size={25} color={textColor} />{" " + distance + (km ? "km" : "m")}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };
    const [selectedId, setSelectedId] = useState<string>();

    const renderItem = ({ item }: { item: StopsData }) => {
        const backgroundColor = /*item.properties.number === selectedId ? '#1a73e8' :*/ '#fff';
        const color = /*item.properties.number === selectedId ? 'white' :*/ 'black';
        const onPress = () => {
            setSelectedId(item.properties.number);
            console.log('press');
            navigation.navigate('Detalle', { item: item, currLoc: currLoc, setFav: setItems });
        }

        return (
            <Item
                item={item}
                onPress={() => { onPress() }}
                backgroundColor={backgroundColor}
                textColor={color}
            />
        );
    };
    const loading = () => {
        setTimeout(() => {
            if (!items || items.length === 0) setError(true);
        }, 10000)
        return (
            <ActivityIndicator size="large" />
        )
    }
    //console.log('vlc', VLCitems)
    return (
        <View style={items && items.length > 0 ? styles.container : styles.container2}>
            {items && items.length > 0 ? <FlatList data={items.sort((a, b) => {
                if (currLoc) {
                    const d1 = getDistance({ latitude: a.geometry.coordinates[1], longitude: a.geometry.coordinates[0] }, { latitude: currLoc.latitude, longitude: currLoc.longitude });
                    const d2 = getDistance({ latitude: b.geometry.coordinates[1], longitude: b.geometry.coordinates[0] }, { latitude: currLoc.latitude, longitude: currLoc.longitude });
                    if (d1 >= d2) return 1;
                    else return -1;
                }
                else return 0;
            })} renderItem={renderItem}
                keyExtractor={item => item.properties.number} extraData={selectedId}
            />
                :
                <View style={styles.container2}>
                    <Text style={styles.textCenter}>
                        <FontAwesomeIcon style={{ paddingLeft: '100%' }} icon={faHeart} size={25} color="#C70039" />
                    </Text>
                    <Text style={[styles.textItalic, styles.textCenter]}>
                        Todavía no tienes favoritos
                    </Text>
                </View>
            }
        </View>)
}


export const storeData = async (items: StopsData[]) => {
    try {
        const jsonValue = JSON.stringify(items)
        await AsyncStorage.setItem('@favorite_Stops', jsonValue)
    } catch (e) {
        // saving error
    }
}

export const getData = async () => {
    try {
        const value = await AsyncStorage.getItem('@favorite_Stops')
        if (value !== null) {
            return JSON.parse(value) as StopsData[];
        }
    } catch (e) {
        // error reading value
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 0,
    },
    container2: {
        flex: 1,
        justifyContent: 'center',
        textAlign: 'center',
    },
    item: {
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 22,
    },
    textItalic: {
        color: "#7b7b7b",
        fontWeight: "200",
        fontSize: 20
    },
    border: {
        borderColor: "#7b7b7b",
        padding: 3
    },
    textRight: {
        paddingLeft: 50
    },
    textCenter: {
        textAlign: 'center',
    }
});