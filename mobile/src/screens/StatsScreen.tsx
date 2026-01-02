import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { apiService } from '../services/api';

interface Stats {
  monthly: {
    income: string;
    expenses: string;
    available: number;
    spentPercentage: number;
  };
  weekly: {
    expenses: string;
  };
  categories: Array<{
    category: string;
    amount: string;
    count: number;
    percentage: number;
  }>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface StatsScreenProps {
  onLogout?: () => void;
}

export const StatsScreen = ({ onLogout }: StatsScreenProps) => {
  const isFocused = useIsFocused();
  const [stats, setStats] = useState<Stats | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh when tab is focused
  useEffect(() => {
    if (isFocused && !loading) {
      loadData();
    }
  }, [isFocused]);

  const loadData = async () => {
    try {
      const [statsData, userData] = await Promise.all([
        apiService.getStats(),
        apiService.getUserInfo(),
      ]);
      setStats(statsData);
      setUser(userData);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to load statistics. Please check your connection.';
      Alert.alert('Unable to Load Stats', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.logout();
              onLogout?.();
            } catch (error: any) {
              const message = error.response?.data?.message || 'Failed to logout. Please try again.';
              Alert.alert('Logout Failed', message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.centered}>
        <Text>No data available</Text>
      </View>
    );
  }

  const income = parseFloat(stats.monthly.income);
  const expenses = parseFloat(stats.monthly.expenses);
  const available = stats.monthly.available;
  const budgetPercent = stats.monthly.spentPercentage;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with user name and logout */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello!</Text>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>

        {/* Monthly Budget Card */}
        <View style={styles.card}>
        <Text style={styles.cardTitle}>Monthly Budget</Text>

        <View style={styles.budgetRow}>
          <Text style={styles.label}>Income</Text>
          <Text style={styles.incomeText}>₺{income.toFixed(2)}</Text>
        </View>

        <View style={styles.budgetRow}>
          <Text style={styles.label}>Spent</Text>
          <Text style={styles.expenseText}>₺{expenses.toFixed(2)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.budgetRow}>
          <Text style={styles.availableLabel}>Available</Text>
          <Text style={[
            styles.availableAmount,
            available < 0 ? styles.negative : styles.positive
          ]}>
            ₺{Math.abs(available).toFixed(2)}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(budgetPercent, 100)}%`,
                  backgroundColor: budgetPercent > 100 ? '#F44336' :
                                 budgetPercent > 80 ? '#FF9800' : '#4CAF50'
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>{budgetPercent}% spent</Text>
        </View>
      </View>

      {/* Weekly Stats */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>This Week</Text>
        <Text style={styles.weeklyAmount}>
          ₺{parseFloat(stats.weekly.expenses).toFixed(2)}
        </Text>
        <Text style={styles.weeklyLabel}>Total Expenses</Text>
      </View>

      {/* Category Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Category Breakdown</Text>

        {stats.categories.length > 0 ? (
          stats.categories.map((cat, index) => (
            <View key={index} style={styles.categoryRow}>
              <View style={styles.categoryLeft}>
                <Text style={styles.categoryName}>{cat.category}</Text>
                <Text style={styles.categoryCount}>{cat.count} transactions</Text>
              </View>
              <View style={styles.categoryRight}>
                <Text style={styles.categoryAmount}>
                  ₺{parseFloat(cat.amount).toFixed(2)}
                </Text>
                <Text style={styles.categoryPercent}>{cat.percentage}%</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>No expenses yet</Text>
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  incomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
  },
  expenseText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F44336',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  availableLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  availableAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'right',
  },
  weeklyAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 4,
  },
  weeklyLabel: {
    fontSize: 14,
    color: '#666',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  categoryLeft: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: '#999',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  categoryPercent: {
    fontSize: 12,
    color: '#666',
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
});
