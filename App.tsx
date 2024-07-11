
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { MyMenu } from './Menu';
import LoginScreen, { getLoginData, storeLoginData } from './Login';
import { LogBox } from 'react-native';

export interface User {
  user: string,
  email: string
}

export default function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const logout = () => {
    setUser(undefined);
    setIsLogged(false);
    storeLoginData(undefined);
  }
  //Comprobamos si hay algun usuario logueado para mostrar el login o no
  useEffect(() => {
    async function getData() {
      const user = await getLoginData();
      if (user) {
        setIsLogged(true);
        setUser(user);
      }
    }
    getData();

  }, []);
  LogBox.ignoreAllLogs();//Ignorar los logs
  //Si el usuario no está logueado, mostramos el login, en caso contrario, la app
  return (
    isLogged && user ?
      <NavigationContainer>
        <MyMenu user={user} logout={logout} />
      </NavigationContainer>
      : <LoginScreen setLogged={setIsLogged} setUser={setUser} />

  );
}
