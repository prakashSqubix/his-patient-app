import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppointmentListScreen from '../screens/appointments/index';
import AppointmentBookScreen from '../screens/appointments/book';
import AppointmentSearchScreen from '../screens/appointments/search';
import DoctorProfileScreen from '../screens/appointments/doctor/index';

const Stack = createNativeStackNavigator();

export function AppointmentNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AppointmentList" component={AppointmentListScreen} />
            <Stack.Screen name="AppointmentBook" component={AppointmentBookScreen} />
            <Stack.Screen name="AppointmentSearch" component={AppointmentSearchScreen} />
            <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
        </Stack.Navigator>
    );
}
