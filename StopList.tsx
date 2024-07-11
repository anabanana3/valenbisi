import { faBicycle, faCircle, faCircleExclamation, faFilter, faHeart, faLocationArrow, faSquareParking } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { getDistance } from 'geolib';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Region, StopsData } from './Map';
import * as Location from 'expo-location';
import { getData } from './Favorites';
import { Button } from '@rneui/themed';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
//import customData from './data.json';

export let allStops: StopsData[] | undefined = undefined;
export let currLocation: Region | undefined = undefined;
export type ItemProps = {
    item: StopsData;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
};
enum FilterTtypes {
    all,
    parking,
    bikes
}
export const getColorStyle = (item: any) => {
    if (item.properties.available > 0 && item.properties.free > 0) return "#A8D45A";
    else if (item.properties.free === 0) return "#FFC300";
    else if (item.properties.available === 0) return "#FF5733";
}
let timeout: any = undefined;
export const StopList = ({ navigation, route }: any) => {
    const [VLCitems, setVLCitems] = useState<StopsData[]>([]);
    const [currLoc, setCurrLoc] = useState<Region | undefined>(undefined);
    const [error, setError] = useState(false);
    const [fav, setFav] = useState<StopsData[] | undefined>([]);
    const [filter, setFilter] = useState<FilterTtypes>(FilterTtypes.all);
    const props = route;
    const loadData = () => {
        props.params && props.params.items ? setVLCitems(props.params.items) :
            fetch('https://valencia.opendatasoft.com/api/explore/v2.1/catalog/datasets/valenbisi-disponibilitat-valenbisi-dsiponibilidad/exports/geojson?lang=es&timezone=Europe%2FBerlin')
                .then(response => response.json())
                .then(json => {
                    //console.log('json', json.features)
                    setVLCitems(json.features)
                    allStops = json.features;
                });
    }



    useEffect(() => {
        currLocation = currLoc;
    }, [currLoc])

    //Obtener la posición actual
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
    //Cargar las paradas guardadas en favoritos
    const getFavStops = async () => {
        const items = await getData();
        setFav(items);
        //console.log('loadFsvs')
    }
    //Cargar datos al renderizar la vista
    useEffect(() => {
        loadData();
        if (!currLoc) getCurrentLocation();
        getFavStops();
        reloadData();
    }, [])

    //Recargar los datos
    const reloadData = () => {
        if (timeout) clearTimeout(timeout);
        setTimeout(() => reloadData(), 5000);
        getFavStops();
    }
    //Para recargar los datos cuando se llama desde otro componente
    useEffect(() => { loadData(); getFavStops(); console.log('entroo') }, [route.params])

    const Item = ({ item, onPress, backgroundColor, textColor }: ItemProps) => {
        //Calculamos la distancia con la posicion actual
        let distance: number | string = currLoc ? getDistance({ latitude: item.geometry.coordinates[1], longitude: item.geometry.coordinates[0] }, { latitude: currLoc.latitude, longitude: currLoc.longitude }) : 0;
        let km = false;
        if (distance > 1000) {
            distance = (distance / 1000).toFixed(2);
            km = true;
        }
        //Obtenemos si está en favoritos o no
        const isFav = fav && fav.find(f => f.properties.gid === item.properties.gid) ? true : false;
        return (
            <TouchableOpacity onPress={onPress} style={[styles.item, { backgroundColor }]}>
                <Text style={[styles.title, { color: textColor }]}>{<FontAwesomeIcon icon={isFav ? faHeart as IconProp : faHeartRegular as IconProp} size={20} color={isFav ? "#C70039" : textColor} />}{" "}{item.properties.name}</Text>
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
        const backgroundColor = '#fff';
        const color = 'black';
        //Función para mostrar el detalle de la parada seleccionada
        const onPress = () => {
            setSelectedId(item.properties.number);
            props.params && props.params.onPress ? props.params.onPress(item, currLoc) : navigation.navigate('Detalle', { item: item, currLoc: currLoc, setFav: setFav });
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
    //Función para mostrar spinner mientras se cargan los datos, y si tras 10s no hay datos mostrar que no se han podido cargar
    const loading = () => {
        setTimeout(() => {
            if (!VLCitems || VLCitems.length === 0) setError(true);
        }, 10000)
        return (
            <ActivityIndicator size="large" />
        )
    }
    //Función para obtener el icono que se usa en el filtro
    const getIcon = () => {
        if (filter === FilterTtypes.all) return faFilter;
        else if (filter === FilterTtypes.parking) return faSquareParking;
        else return faBicycle;
    }
    //Función para obtener el texto del filtro aplicado
    const getText = () => {
        if (filter === FilterTtypes.all) return "ninguno";
        else if (filter === FilterTtypes.parking) return "parking disponible";
        else return "bicis disponibles";
    }
    //Listado de paradas, ordenadas por proximidad y filtradas en caso de que haya algun filtro aplicado
    return (
        <View style={VLCitems ? styles.container : styles.container2}>
            {VLCitems ? <FlatList data={VLCitems.filter(i => {
                if (filter === FilterTtypes.all) return true;
                else if (filter === FilterTtypes.parking) return i.properties.free > 0;
                else return i.properties.available > 0;
            }).sort((a, b) => {
                if (currLoc) {
                    const d1 = getDistance({ latitude: a.geometry.coordinates[1], longitude: a.geometry.coordinates[0] }, { latitude: currLoc.latitude, longitude: currLoc.longitude });
                    const d2 = getDistance({ latitude: b.geometry.coordinates[1], longitude: b.geometry.coordinates[0] }, { latitude: currLoc.latitude, longitude: currLoc.longitude });
                    if (d1 >= d2) return 1;
                    else return -1;
                } else return 0;
            })} renderItem={renderItem}
                keyExtractor={item => item.properties.number} extraData={selectedId}
            />
                : !error ? loading() :
                    <View style={styles.container2}>
                        <Text style={styles.textCenter}>
                            <FontAwesomeIcon style={{ paddingLeft: '100%' }} icon={faCircleExclamation} size={25} color="#C70039" />
                        </Text>
                        <Text style={[styles.textItalic, styles.textCenter]}>
                            Error al cargar las paradas
                        </Text>
                    </View>
            }
            {/* Botón del filtro */}
            <Button icon={<FontAwesomeIcon icon={getIcon()} size={30} color={filter === FilterTtypes.all ? "#6E6E6E" : "#A8D45A"} />} onPress={() => {
                if (filter === FilterTtypes.all) setFilter(FilterTtypes.parking);
                else if (filter === FilterTtypes.parking) setFilter(FilterTtypes.bikes);
                else setFilter(FilterTtypes.all);
            }} buttonStyle={{
                backgroundColor: '#DFDFDF',
                //borderRadius: 100, 
                paddingVertical: 15,
                paddingHorizontal: 15,
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 0.5
            }} >
                <Text>{"  Filtro aplicado: " + (getText())}</Text>
            </Button>
        </View>)
}
//Estilos
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
        color: "#6E6E6E",
        fontWeight: "200",
    }
});