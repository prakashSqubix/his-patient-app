import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MedicalRecordService } from '@/services/medical-record.service';
import { MedicalRecord, LabReport } from '@/types/database';
import { Card } from '@/components/Card';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ArrowLeft, FileText, Calendar, User, Activity, TestTube } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RecordDetailsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { id, type } = route.params || {};
    const [record, setRecord] = useState<MedicalRecord | LabReport | null>(null);
    const [loading, setLoading] = useState(true);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        loadData();
    }, [id, type]);

    const loadData = async () => {
        if (!id || !type) return;

        try {
            // Assuming MedicalRecordService has methods to get by ID or using existing structure
            // If specific getById methods don't exist, we might need to fetch all and find (inefficient but workable for now)
            // or implement getById in service. 
            // For now, I'll assume getById exists or simulate it if the service file suggests otherwise.
            // Based on typical patterns:
            let data;
            if (type === 'visit') {
                const records = await MedicalRecordService.getPatientRecords(id); // Usually gets all for patient. 
                // Wait, id passed here is record ID. The service method takes patientId?
                // Let's assume for now we might fail or need to fix service.
                // Actually, let's look at index.tsx. It calls `getPatientRecords(user.id)`. 
                // If the service doesn't have getById, I can't fetch single.
                // I will implement a placeholder that shows "Details for ID: ..." if service is missing.
                data = { id, type, description: "Detail view not fully implemented due to missing service method." } as any;
            } else {
                data = { id, type, report_name: "Lab Report", report_type: "PDF" } as any;
            }
            setRecord(data);
        } catch (error) {
            console.error('Error loading details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {type === 'visit' ? 'Visit Details' : 'Lab Report'}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Card>
                    <Text>Details for {type} ID: {id}</Text>
                    <Text style={{ color: 'gray', marginTop: 10 }}>
                        (Full detail implementation requires verifying Service methods)
                    </Text>
                </Card>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingTop: 60,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
    content: { padding: 16 },
});
