import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, FileText, User } from 'lucide-react-native';
import HomeScreen from '../screens/tabs/HomeScreen';
import ProfileScreen from '../screens/tabs/ProfileScreen';
import { AppointmentNavigator } from './AppointmentNavigator';
import { RecordsNavigator } from './RecordsNavigator';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#2563eb',
                tabBarInactiveTintColor: '#64748b',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopColor: '#e2e8f0',
                    borderTopWidth: 1,
                    paddingTop: 8,
                    paddingBottom: 8,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Home',
                    tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="AppointmentsTab"
                component={AppointmentNavigator}
                options={{
                    title: 'Appointments',
                    tabBarIcon: ({ size, color }) => (
                        <Calendar size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="RecordsTab"
                component={RecordsNavigator}
                options={{
                    title: 'Records',
                    tabBarIcon: ({ size, color }) => (
                        <FileText size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
}
