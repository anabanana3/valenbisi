import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { User } from './App';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface LoginProps {
    setLogged: React.Dispatch<React.SetStateAction<boolean>>;
    setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
}

const LoginScreen = (props: LoginProps) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleLogin = () => {
        // Dejamos autenticarse a cualquier usuario
        if (username !== "" && password !== "") {
            const user: User = { user: username, email: username + "@gmail.com" };
            storeLoginData(user);
            props.setLogged(true);
            props.setUser(user);
        }
        /*if (username === "hola" && password === "hola") {
            const user: User = { user: username, email: username + "@gmail.com" };
            props.setLogged(true);
            props.setUser(user);
        } else if (username === "anabel" && password === "anabel") {
            const user: User = { user: username, email: username + "@gmail.com" };
            props.setLogged(true);
            props.setUser(user);
        } else if (username === "pascual" && password === "pascual") {
            const user: User = { user: username, email: username + "@gmail.com" };
            props.setLogged(true);
            props.setUser(user);
        }
        else {
            props.setLogged(false);
            setError(true);
        }*/
        console.log('Username:', username);
        console.log('Password:', password);
    };

    return (
        <View style={styles.container}>
            <Image style={styles.logo} source={require('./img/logo.png')} />
            <TextInput
                style={styles.input}
                placeholder="Ususario"
                value={username}
                onChangeText={text => setUsername(text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                secureTextEntry
                value={password}
                onChangeText={text => setPassword(text)}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            {error ? <Text>{'\n'}Usuario o contraseña incorrectos</Text> : <></>}
        </View>
    );
};
//Función para almacenar el usuario logueado y que no haga falta que vuelva a iniciar sesión
export const storeLoginData = async (user: User | undefined) => {
    try {
        const jsonValue = JSON.stringify(user)
        await AsyncStorage.setItem('@login', jsonValue)
    } catch (e) {
        // saving error
        //Alert.alert('Error al guardar el ususario');
    }
}
//Función para obtener el usuario logueado
export const getLoginData = async () => {
    try {
        const value = await AsyncStorage.getItem('@login')
        if (value !== null) {
            return JSON.parse(value) as User;
        }
    } catch (e) {
        Alert.alert('Error al cargar el ususario');
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 30,
        borderRadius: 80
    },
    input: {
        width: '80%',
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    button: {
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

export default LoginScreen;