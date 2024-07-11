import { faBicycle, faCircle, faCircleExclamation, faHeart, faLocationArrow, faSquareParking } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { getDistance } from 'geolib';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@rneui/themed';
import { StopsData } from './Map';
import { getColorStyle } from './StopList';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { getData, storeData } from './Favorites';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

export const Detail = ({ navigation, route }: any) => {
    const [fav, setFav] = useState<StopsData[] | undefined>([]);
    const item: StopsData = route.params.item;
    const currLoc = route.params.currLoc;
    //Calculamos a distancia, con los datos que nos pasan por parámetros
    let distance: number | string = currLoc ? getDistance({ latitude: item.geometry.coordinates[1], longitude: item.geometry.coordinates[0] }, { latitude: currLoc.latitude, longitude: currLoc.longitude }) : 0;
    let km = false;
    if (distance > 1000) {
        distance = (distance / 1000).toFixed(2);
        km = true;
    }
    //Obtenemos las paradas favoritas
    const getFavStops = async () => {
        const items = await getData();
        setFav(items);
    }
    useEffect(() => {
        getFavStops();
    })
    //Función para añadir/quitar la parada de favoritos a pulsar el corazón
    const onPress = () => {
        let items = fav ? fav : [];
        if (isFav) {
            const idx = items ? items.findIndex(f => f.properties.gid === item.properties.gid) : -1;
            idx >= 0 ? items!.splice(idx, 1) : items;
            setFav(items);
            storeData(items);
        } else {
            items.push(item);
            storeData(items);
            setFav(items);
        }
        //Para recargar las listas desde donde se llama
        route.params && route.params.setFav ? route.params.setFav(items) : null
    }
    const isFav = fav && !!fav.find(f => f.properties.gid === item.properties.gid) ? true : false;
    //Componente para mostrar los datos de la parada y un mapa en la parte inferior
    return (
        item ?
            <View style={styles.container}>
                <Button style={styles.button} onPress={onPress} type="clear" icon={<FontAwesomeIcon icon={isFav ? faHeart as IconProp : faHeartRegular as IconProp} size={45} color={isFav ? "#C70039" : "#000"} />} />
                <Text style={styles.textTitle}>{item.properties.name}</Text>
                <Text style={styles.textItalic}>{item.properties.address}</Text>
                <View style={styles.border}>
                    <Text style={[styles.subtitle]}>
                        <FontAwesomeIcon icon={faCircle} size={25} color={getColorStyle(item)} />{" "}

                        <FontAwesomeIcon icon={faBicycle} size={25} />{" " + item.properties.available}
                        {" "}
                        <FontAwesomeIcon icon={faSquareParking} size={25} />{" " + item.properties.free}
                        {"           "}
                        {distance > 0 ? <><FontAwesomeIcon icon={faLocationArrow} size={25} />{" " + distance + (km ? "km" : "m")}</> : <></>}
                    </Text>
                </View>
                <MapView
                    showsUserLocation={true}
                    provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                    style={styles.map}
                    initialRegion={{
                        latitude: item.geometry.coordinates[1],
                        longitude: item.geometry.coordinates[0],
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}>
                    <Marker key={item.properties.gid} title={item.properties.name} description={item.properties.address} pinColor={getColorStyle(item)} coordinate={{ latitude: item.geometry.coordinates[1], longitude: item.geometry.coordinates[0] }} ></Marker>
                </MapView>
            </View>
            :
            <View style={styles.container2}>
                <Text style={styles.textCenter}>
                    <FontAwesomeIcon style={{ paddingLeft: '100%' }} icon={faCircleExclamation} size={25} color="#C70039" />
                </Text>
                <Text style={[styles.textItalic, styles.textCenter]}>
                    Error al cargar los datos de la parada
                </Text>
            </View>
    )
};
//Estilos
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    container2: {
        flex: 1,
        justifyContent: 'center',
        textAlign: 'center',
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 30,
        borderRadius: 80
    },
    textTitle: {
        marginTop: 10,
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
    },
    textItalic: {
        color: "#7b7b7b",
        fontWeight: "200",
        fontSize: 20
    },
    button: {
        marginTop: 20
    },
    border: {
        borderColor: "#7b7b7b",
        padding: 3
    },
    subtitle: {
        fontSize: 22,
    },
    textCenter: {
        textAlign: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
        marginTop: '55%',
        height: '70%'
    },
});