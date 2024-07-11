import React, { useState, useEffect, } from 'react';
import { Text, View, StyleSheet, Dimensions, Platform, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Button } from '@rneui/themed';
import { allStops, currLocation } from './StopList';
import { StopsData } from './Map';


export default function Scan({ navigation }: any) {
    const [hasPermission, setHasPermission] = useState<boolean | undefined>(undefined);
    const [scanned, setScanned] = useState(false);
    const [VLCitems, setVLCitems] = useState<StopsData[]>([]);
    //Obtenemos permisos para usar la cámara y cargamos los datos
    useEffect(() => {
        const getBarCodeScannerPermissions = async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getBarCodeScannerPermissions();
        if (!allStops || allStops.length === 0) loadData();
    }, []);
    const loadData = () => {
        //console.log('cargarDatos')
        fetch('https://valencia.opendatasoft.com/api/explore/v2.1/catalog/datasets/valenbisi-disponibilitat-valenbisi-dsiponibilidad/exports/geojson?lang=es&timezone=Europe%2FBerlin')
            .then(response => response.json())
            .then(json => {
                setVLCitems(json.features)
            })
    }
    //Función para abrir el detalle de la parada escaneada
    const handleBarCodeScanned = ({ type, data }: any) => {
        setScanned(true);
        if (data.includes("stopId=")) {
            const id = data.split("=")[1];
            if (allStops) {
                const item = allStops.find(s => s.properties.number === +id);
                if (item) navigation.navigate('Detalle', { item: item, currLoc: currLocation })
                else Alert.alert('La parada no existe o el QR no es válido');
            }
            else if (VLCitems) {
                const item = VLCitems.find(s => s.properties.number === +id);
                if (item) navigation.navigate('Detalle', { item: item, currLoc: currLocation })
                else Alert.alert('La parada no existe o el QR no es válido');
            }
        }
    };

    if (hasPermission === null) {
        return <Text>Solicitando permiso para acceder a la cámara</Text>;
    }
    if (hasPermission === false) {
        return <Text>Sin acceso a la cámara</Text>;
    }

    return (
        <View style={styles.container}>
            <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.rectangle}>
                <View style={styles.rectangleColor} />
                <View style={styles.topLeft} />
                <View style={styles.topRight} />
                <View style={styles.bottomLeft} />
                <View style={styles.bottomRight} />
            </View>
            {scanned && <Button buttonStyle={styles.button} title={'Pulsa para volver a escanear'} onPress={() => setScanned(false)} />}
        </View>
    );
}
const deviceHeight = Dimensions.get("window").height;

const deviceWidth = Dimensions.get("window").width;
//Estilos para que se vea un cuadrado para escanear QR
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    textBg: {
        width: deviceWidth,
        height: 50,
        justifyContent: 'center',
        backgroundColor: '#43474a',
        marginTop: deviceHeight / 14
    },
    preview: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    scanText: {
        color: 'white',
        textAlign: 'center'
    },
    overlay: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        height: deviceHeight,
        width: deviceWidth,
        borderLeftColor: 'rgba(0, 0, 0, .75)',
        borderRightColor: 'rgba(0, 0, 0, .75)',
    },
    rectangleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    rectangle: {
        position: 'absolute',
        borderLeftColor: 'rgba(0, 0, 0, .6)',
        borderRightColor: 'rgba(0, 0, 0, .6)',
        borderTopColor: 'rgba(0, 0, 0, .6)',
        borderBottomColor: 'rgba(0, 0, 0, .6)',
        borderLeftWidth: deviceWidth / 1,
        borderRightWidth: deviceWidth / 1,
        borderTopWidth: deviceHeight / 1,
        borderBottomWidth: deviceHeight / 1,
        paddingTop: 50
    },
    rectangleColor: {
        height: 250,
        width: 325,
        backgroundColor: 'transparent',
    },
    topLeft: {
        width: 50,
        height: 50,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        position: 'absolute',
        left: -1,
        top: -1,
        borderLeftColor: '#A8D45A',
        borderTopColor: '#A8D45A'
    },
    topRight: {
        width: 50,
        height: 50,
        borderTopWidth: 2,
        borderRightWidth: 2,
        position: 'absolute',
        right: -1,
        top: -1,
        borderRightColor: '#A8D45A',
        borderTopColor: '#A8D45A'
    },
    bottomLeft: {
        width: 50,
        height: 50,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        position: 'absolute',
        left: -1,
        bottom: -1,
        borderLeftColor: '#A8D45A',
        borderBottomColor: '#A8D45A'
    },
    bottomRight: {
        width: 50,
        height: 50,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        position: 'absolute',
        right: -1,
        bottom: -1,
        borderRightColor: '#A8D45A',
        borderBottomColor: '#A8D45A'
    },
    close: {
        width: deviceWidth,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: deviceHeight / 7,
    },
    button: {
        marginTop: 30,
        backgroundColor: '#A8D45A',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        color: 'white'
    }
});