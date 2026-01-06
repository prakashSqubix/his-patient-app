import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
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
import { Theme } from '@/types/theme';

export default function RecordsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'visits' | 'reports'>('visits');
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);

  const styles = getStyles(theme);

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
              <FileText size={64} color={theme.colors.text.disabled} />
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
                  navigation.navigate('RecordDetails', { id: record.id, type: 'visit' })
                }
                activeOpacity={0.7}
              >
                <Card style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <View style={styles.recordIcon}>
                      <Stethoscope size={20} color={theme.colors.primary} />
                    </View>
                    <View style={styles.recordInfo}>
                      <Text style={styles.recordTitle}>
                        {record.diagnosis || 'Medical Visit'}
                      </Text>
                      <View style={styles.recordMeta}>
                        <Calendar size={14} color={theme.colors.text.secondary} />
                        <Text style={styles.recordDate}>
                          {formatDate(record.visit_date)}
                        </Text>
                      </View>
                      {record.doctor && (
                        <View style={styles.recordMeta}>
                          <User size={14} color={theme.colors.text.secondary} />
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
            <TestTube size={64} color={theme.colors.text.disabled} />
            <Text style={styles.emptyTitle}>No Lab Reports</Text>
            <Text style={styles.emptyText}>
              Your lab reports will appear here
            </Text>
          </View>
        ) : (
          labReports.map((report) => (
            <TouchableOpacity
              key={report.id}
              onPress={() => navigation.navigate('RecordDetails', { id: report.id, type: 'report' })}
              activeOpacity={0.7}
            >
              <Card style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.reportIcon}>
                    <TestTube size={20} color={theme.colors.success} />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordTitle}>{report.report_name}</Text>
                    <Text style={styles.reportType}>{report.report_type}</Text>
                    <View style={styles.recordMeta}>
                      <Calendar size={14} color={theme.colors.text.secondary} />
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

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: 60,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeights.semibold as any,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily,
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  content: {
    padding: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeights.semibold as any,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    fontFamily: theme.typography.fontFamily,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily,
  },
  recordCard: {
    marginBottom: theme.spacing.md,
  },
  recordHeader: {
    flexDirection: 'row',
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface, // or primary + opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface, // or success + opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  recordTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeights.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily,
  },
  reportType: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.success,
    marginBottom: 4,
    fontFamily: theme.typography.fontFamily,
  },
  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  recordDate: {
    fontSize: 13, // slightly smaller than sm
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily,
  },
  recordDoctor: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily,
  },
});
