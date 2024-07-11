import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import Map, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import MapView from "react-native-map-clustering";
import * as Location from 'expo-location';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBicycle, faHeart, faRetweet, faSquareParking } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@rneui/themed';
import { getColorStyle } from './StopList';
import { getData } from './Favorites';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

export interface StopsData {
    geometry: { coordinates: Array<number>, type: string },
    properties: any,

}
//Estilos del mapa
const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    markerAvailable: {
        backgroundColor: "#A8D45A",
        padding: 5,
        borderRadius: 5,
    },
    markerHalf: {
        backgroundColor: "#FFC300",
        padding: 5,
        borderRadius: 5,
    },
    markerFull: {
        backgroundColor: "#FF5733",
        padding: 5,
        borderRadius: 5,
    },

    text: {
        color: "#FFF",
        fontWeight: "bold",
    },
    popup: {
        backgroundColor: "#fff",
        color: "#000",
        fontWeight: "bold",
        minWidth: '100%',
        borderColor: "#000",
        borderWidth: 2,
    },
    textItalic: {
        color: "#7b7b7b",
        fontWeight: "200",
    },
    textBold: {
        fontWeight: "bold",
    },
    buttonCallout: {
        flex: 1,
        flexDirection: 'row',
        position: 'absolute',
        bottom: 10,
        alignSelf: "center",
        justifyContent: "space-between",
        backgroundColor: "transparent",
        //borderWidth: 0.5,
        //borderRadius: 20
    },
    button: {
        marginBottom: 5,
    },
    touchableText: {
        fontSize: 24
    },
});
export const MapScreen = () => {
    const [region, setRegion] = useState<Region>({
        latitude: 39.513,
        longitude: -0.424,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });
    const [VLCitems, setVLCitems] = useState<StopsData[]>([]);
    const [customMarker, setCustomMarker] = useState<boolean>(true);
    const [fav, setFav] = useState<StopsData[] | undefined>([]);

    //Cargamos los datos de las paradas
    const loadData = () => {
        fetch('https://valencia.opendatasoft.com/api/explore/v2.1/catalog/datasets/valenbisi-disponibilitat-valenbisi-dsiponibilidad/exports/geojson?lang=es&timezone=Europe%2FBerlin')
            .then(response => response.json())
            .then(json => {
                //console.log('json', json.features)
                setVLCitems(json.features)
            })
    }
    //Obtenemos las paradas guardadas en favoritos
    const getFavStops = async () => {
        const items = await getData();
        setFav(items);
    }
    useEffect(() => {
        loadData();
        getCurrentLocation();
        getFavStops();
    }, [])

    const mapView = useRef<Map>(null);
    //Obtenmos la ubicación actual del dispositivo, y desplazamos el mapa a esta
    const getCurrentLocation = async () => {
        //comprobar permiso de localizacion
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('No hay permisos de localización');
            return;
        }
        //Obtener posición GPS
        let location = await Location.getCurrentPositionAsync({});
        //console.log(location);
        let region = {
            latitude: parseFloat(location.coords.latitude.toString()),
            longitude: parseFloat(location.coords.longitude.toString()),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
        }
        setRegion(region);
        mapView.current ? mapView.current.animateToRegion(region, 2000) : null;
    }
    //Función para obtener los estilos del marcador personalizado
    const getMarkerStyle = (item: any) => {
        if (item.properties.available > 0 && item.properties.free > 0) return styles.markerAvailable;
        else if (item.properties.free === 0) return styles.markerHalf;
        else if (item.properties.available === 0) return styles.markerFull;
    }
    //Función para crear el tooltip personalizado
    const getTitleInfo = (item: any) => {
        const isFav = fav && !!fav.find(f => f.properties.gid === item.properties.gid) ? true : false;
        return <View style={styles.popup}>
            <Text style={styles.textBold}><FontAwesomeIcon icon={isFav ? faHeart as IconProp : faHeartRegular as IconProp} size={20} color={isFav ? "#C70039" : "#000"} />{" " + item.properties.name}</Text>
            <Text style={styles.textItalic}>{item.properties.address}</Text>
            <Text>
                <FontAwesomeIcon icon={faBicycle} size={20} />{" " + item.properties.available}
                {" "}
                <FontAwesomeIcon icon={faSquareParking} size={20} />{" " + item.properties.free}
            </Text>
        </View>
    }
    //console.log('items', VLCitems)
    return (
        <View style={styles.container}>
            <MapView
                ref={mapView}
                showsUserLocation={true}
                provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                style={styles.map}
                initialRegion={region ? region : {
                    latitude: 39.513,
                    longitude: -0.424,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                clusterColor="#1a73e8"
                showsMyLocationButton={true}
            >
                {VLCitems ? VLCitems.map((item, index) => {
                    /*Mostramos el marker personalizado o el normal según lo que se indique con el botón*/
                    return (customMarker ? <Marker key={index} title={item.properties.name} description={item.properties.address} coordinate={{ latitude: item.geometry.coordinates[1], longitude: item.geometry.coordinates[0] }} /*onCalloutPress={() => getTitleInfo(item)}*/>
                        <View style={getMarkerStyle(item)}>
                            <Text style={styles.text}>
                                <FontAwesomeIcon icon={faBicycle} color="#fff" size={20} />{" " + item.properties.available}
                                {" "}
                                <FontAwesomeIcon icon={faSquareParking} color="#fff" size={20} />{" " + item.properties.free}
                            </Text>
                        </View>
                        {/*<Callout key={index} tooltip={true}>{getTitleInfo(item)}</Callout>*/}

                    </Marker> :
                        <Marker key={item.properties.gid} title={item.properties.name} description={item.properties.address} pinColor={getColorStyle(item)} coordinate={{ latitude: item.geometry.coordinates[1], longitude: item.geometry.coordinates[0] }}>
                            <Callout key={index} tooltip={true}>{getTitleInfo(item)}</Callout>
                        </Marker>)
                }) : <></>}
            </MapView>
            {/* Botón para cambiar los iconos del mapa*/}
            <Button style={styles.button} icon={<FontAwesomeIcon icon={faRetweet} size={30} color="#A8D45A" />} onPress={() => setCustomMarker(!customMarker)} buttonStyle={{
                backgroundColor: 'white', borderRadius: 100, shadowColor: 'rgba(0, 0, 0, 0.1)',
                shadowOpacity: 0.8,
                elevation: 6,
                shadowRadius: 100,
                shadowOffset: { width: 1, height: 13 },
                paddingVertical: 15,
                paddingHorizontal: 15,
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 0.5
            }} />
        </View >
    );

}