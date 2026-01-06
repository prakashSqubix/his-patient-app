import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { MedicalRecordService } from '@/services/medical-record.service';
import { MedicalRecord, LabReport } from '@/types/database';
import { Card } from '@/components/Card';
import { LoadingScreen } from '@/components/LoadingScreen';
import {
  FileText,
  Calendar,
  User,
  Stethoscope,
  TestTube,
} from 'lucide-react-native';

export default function RecordsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'visits' | 'reports'>('visits');
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      const [records, reports] = await Promise.all([
        MedicalRecordService.getPatientRecords(user.id),
        MedicalRecordService.getLabReports(user.id),
      ]);
      setMedicalRecords(records);
      setLabReports(reports);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medical Records</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'visits' && styles.tabActive]}
          onPress={() => setActiveTab('visits')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'visits' && styles.tabTextActive,
            ]}
          >
            Visit History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reports' && styles.tabActive]}
          onPress={() => setActiveTab('reports')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'reports' && styles.tabTextActive,
            ]}
          >
            Lab Reports
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'visits' ? (
          medicalRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <FileText size={64} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No Visit Records</Text>
              <Text style={styles.emptyText}>
                Your visit history will appear here
              </Text>
            </View>
          ) : (
            medicalRecords.map((record) => (
              <TouchableOpacity
                key={record.id}
                onPress={() =>
                  router.push(`/(tabs)/records/visit/${record.id}`)
                }
                activeOpacity={0.7}
              >
                <Card style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <View style={styles.recordIcon}>
                      <Stethoscope size={20} color="#2563eb" />
                    </View>
                    <View style={styles.recordInfo}>
                      <Text style={styles.recordTitle}>
                        {record.diagnosis || 'Medical Visit'}
                      </Text>
                      <View style={styles.recordMeta}>
                        <Calendar size={14} color="#64748b" />
                        <Text style={styles.recordDate}>
                          {formatDate(record.visit_date)}
                        </Text>
                      </View>
                      {record.doctor && (
                        <View style={styles.recordMeta}>
                          <User size={14} color="#64748b" />
                          <Text style={styles.recordDoctor}>
                            Dr. {record.doctor.first_name}{' '}
                            {record.doctor.last_name}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )
        ) : labReports.length === 0 ? (
          <View style={styles.emptyState}>
            <TestTube size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Lab Reports</Text>
            <Text style={styles.emptyText}>
              Your lab reports will appear here
            </Text>
          </View>
        ) : (
          labReports.map((report) => (
            <TouchableOpacity
              key={report.id}
              onPress={() => router.push(`/(tabs)/records/report/${report.id}`)}
              activeOpacity={0.7}
            >
              <Card style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.reportIcon}>
                    <TestTube size={20} color="#059669" />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordTitle}>{report.report_name}</Text>
                    <Text style={styles.reportType}>{report.report_type}</Text>
                    <View style={styles.recordMeta}>
                      <Calendar size={14} color="#64748b" />
                      <Text style={styles.recordDate}>
                        {formatDate(report.report_date)}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#2563eb',
  },
  content: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  recordCard: {
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: 'row',
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  reportType: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 4,
  },
  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  recordDate: {
    fontSize: 13,
    color: '#64748b',
  },
  recordDoctor: {
    fontSize: 13,
    color: '#64748b',
  },
});
