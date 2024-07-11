import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList } from 'react-native';
import { StopsData } from './Map';
import { StopList } from './StopList';
//import customData from './data.json';
import { Region } from 'react-native-maps';



export const Search = ({ navigation }: any) => {
    const [query, setQuery] = useState('');
    const [filteredItems, setFilteredItems] = useState<StopsData[]>();
    const [VLCitems, setVLCitems] = useState<StopsData[]>([]);
    const [fav, setFav] = useState<StopsData[] | undefined>([]);
    //cargamos los datos
    const loadData = () => {
        //setVLCitems(customData.features);
        fetch('https://valencia.opendatasoft.com/api/explore/v2.1/catalog/datasets/valenbisi-disponibilitat-valenbisi-dsiponibilidad/exports/geojson?lang=es&timezone=Europe%2FBerlin')
            .then(response => response.json())
            .then(json => {
                setVLCitems(json.features)
            })
    }
    useEffect(() => {
        loadData();
    }, [])
    //Función para filtrar los elementos en base al texto introducido
    const handleSearch = (text: string) => {
        setQuery(text);
        const filtered = VLCitems ? VLCitems.filter(item => item.properties.name.toLowerCase().includes(text.toLowerCase())) : VLCitems;
        setFilteredItems(filtered);
    };
    //Función para navegar al detalle de la parada al pulsar una
    const onPress = (item: StopsData, currLoc: Region) => {
        navigation.navigate('Detalle', { item: item, currLoc: currLoc, setFav: setFav });
    }

    return (
        <>
            <View style={styles.container}>
                <TextInput
                    style={styles.searchBox}
                    placeholder="Búsqueda"
                    onChangeText={handleSearch}
                    value={query}
                />
                {/*<FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />*/}
                <StopList navigation={navigation} route={{
                    key: "paradas",
                    name: "Paradas",
                    params: { items: filteredItems, onPress: onPress, navigation: navigation }
                }} />
            </View>
        </>
    );
};
//Estilos
const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 30,
        marginHorizontal: 10,
    },
    searchBox: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    item: {
        fontSize: 18,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
});