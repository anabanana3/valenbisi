import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { User } from './App';

export interface UserProps {
    user: User,
    logout: () => void
}
//Pantalla que carga los datos del usuario y permite cerrar la sesión
export const UserProfile = (props: UserProps) => {
    return (
        props ?
            <View style={styles.container}>
                <Text style={styles.textTitle}>¡Bienvenid@!</Text>
                <Image style={styles.logo} source={props.user.user === "anabel" ? require("./img/anabel.png") : require("./img/blank.png")} />
                <Text style={styles.textTitle}>{props.user.user}</Text>
                <Text style={styles.textItalic}>{props.user.email}</Text>
                {/* Botón para cerrar la sesión */}
                <TouchableOpacity style={styles.button} onPress={() => props.logout()}>
                    <Text style={styles.buttonText}> <FontAwesomeIcon icon={faRightFromBracket} color="#fff" />{" "}Cerrar sesión</Text>
                </TouchableOpacity>
            </View>
            : <></>
    )
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 30,
        borderRadius: 80,
        marginTop: 30
    },
    textTitle: {
        fontSize: 24,
        fontWeight: "bold",
    },
    textItalic: {
        color: "#7b7b7b",
        fontWeight: "200",
        fontSize: 20
    },
    button: {
        marginTop: 30,
        backgroundColor: '#A8D45A',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
    },
});