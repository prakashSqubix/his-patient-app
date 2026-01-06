import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ArrowLeft, Palette } from 'lucide-react-native';

export default function ThemeDemoScreen() {
  const { theme, tenantConfig, updateTheme } = useTheme();

  const testTenants = ['clinic_001', 'clinic_002', 'clinic_003', 'default'];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.text.disabled + '40',
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Theme Demo
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.infoRow}>
            <Palette size={24} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>
                Current Tenant
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
                {tenantConfig.tenantName}
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Test Tenant Themes
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.text.secondary }]}>
            Switch between different tenant themes
          </Text>
          <View style={styles.buttonGrid}>
            {testTenants.map((tenantId) => (
              <TouchableOpacity
                key={tenantId}
                style={[
                  styles.tenantButton,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.text.disabled + '40',
                  },
                ]}
                onPress={() => updateTheme(tenantId)}
              >
                <Text style={[styles.tenantButtonText, { color: theme.colors.text.primary }]}>
                  {tenantId.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Color Palette
          </Text>
          <View style={styles.colorGrid}>
            <View style={styles.colorItem}>
              <View style={[styles.colorBox, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.colorLabel, { color: theme.colors.text.secondary }]}>
                Primary
              </Text>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorBox, { backgroundColor: theme.colors.secondary }]} />
              <Text style={[styles.colorLabel, { color: theme.colors.text.secondary }]}>
                Secondary
              </Text>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorBox, { backgroundColor: theme.colors.accent }]} />
              <Text style={[styles.colorLabel, { color: theme.colors.text.secondary }]}>
                Accent
              </Text>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorBox, { backgroundColor: theme.colors.success }]} />
              <Text style={[styles.colorLabel, { color: theme.colors.text.secondary }]}>
                Success
              </Text>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorBox, { backgroundColor: theme.colors.warning }]} />
              <Text style={[styles.colorLabel, { color: theme.colors.text.secondary }]}>
                Warning
              </Text>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorBox, { backgroundColor: theme.colors.error }]} />
              <Text style={[styles.colorLabel, { color: theme.colors.text.secondary }]}>
                Error
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Button Variants
          </Text>
          <View style={styles.buttonShowcase}>
            <Button title="Primary Button" onPress={() => {}} />
            <Button title="Secondary Button" onPress={() => {}} variant="secondary" />
            <Button title="Outline Button" onPress={() => {}} variant="outline" />
            <Button title="Small Button" onPress={() => {}} size="small" />
          </View>
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Form Elements
          </Text>
          <Input label="Text Input" placeholder="Enter text here" />
          <Input label="Email Input" placeholder="email@example.com" />
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Error Display
          </Text>
          <ErrorMessage message="This is an error message example" />
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Typography
          </Text>
          <Text style={[styles.typographyExample, {
            fontSize: theme.typography.fontSize.xxl,
            color: theme.colors.text.primary
          }]}>
            Extra Large Text
          </Text>
          <Text style={[styles.typographyExample, {
            fontSize: theme.typography.fontSize.xl,
            color: theme.colors.text.primary
          }]}>
            Large Text
          </Text>
          <Text style={[styles.typographyExample, {
            fontSize: theme.typography.fontSize.md,
            color: theme.colors.text.secondary
          }]}>
            Medium Text
          </Text>
          <Text style={[styles.typographyExample, {
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.disabled
          }]}>
            Small Text
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tenantButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  tenantButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  colorItem: {
    alignItems: 'center',
    width: '30%',
  },
  colorBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  colorLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  buttonShowcase: {
    gap: 12,
  },
  typographyExample: {
    marginBottom: 8,
  },
});
