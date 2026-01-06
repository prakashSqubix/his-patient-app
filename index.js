import { AppRegistry } from 'react-native';
import App from './src/App';
// Using the string directly to match MainActivity if app.json is changed later
const AppName = "health_app";

AppRegistry.registerComponent(AppName, () => App);
