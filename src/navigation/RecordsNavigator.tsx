import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RecordsListScreen from '../screens/records/index';
import RecordDetailsScreen from '../screens/records/details';

const Stack = createNativeStackNavigator();

export function RecordsNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="RecordsList" component={RecordsListScreen} />
            <Stack.Screen name="RecordDetails" component={RecordDetailsScreen} />
        </Stack.Navigator>
    );
}
