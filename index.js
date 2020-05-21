/**
 * @format
 */
import React from 'react';
import {AppRegistry} from 'react-native';
import App from './components/App';
import {name as appName} from './app.json';
import {Provider} from 'react-redux';

import {PersistGate} from 'redux-persist/integration/react';
import {createStore} from 'redux';
import {persistStore, persistReducer} from 'redux-persist';
import rootReducer from './store';
import AsyncStorage from '@react-native-community/async-storage';

const persistConfig = {
  key: 'anyKey',
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = createStore(persistedReducer);
export const persistor = persistStore(store);
console.disableYellowBox = true;

const RNRedux = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);

AppRegistry.registerComponent(appName, () => RNRedux);
