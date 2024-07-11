import React from 'react';
import { Button, Text, View } from 'react-native';


export const Home = ({ navigation }) => {
    return (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Home Screen</Text>
        <Button
            title="Go to Details"
            onPress={() => navigation.navigate('Detail')}
        />
        <Button
            title="Go to Map"
            onPress={() => navigation.navigate('Map')}
        />
    </View>)
}