import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';

interface BudgetGoal {
  id: string;
  category: string;
  limit: number;
  spent: number;
  percentage: number;
}

export const BudgetGoalsScreen = () => {
  const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load budget goals from AsyncStorage
      const stored = await AsyncStorage.getItem('budgetGoals');
      const goals = stored ? JSON.parse(stored) : [];

      // Load current stats to calculate spent amounts
      const statsData = await apiService.getStats();
      setStats(statsData);

      // Update goals with current spending
      const updatedGoals = goals.map((goal: any) => {
        const category = statsData.categories.find(
          (c: any) => c.category.toLowerCase() === goal.category.toLowerCase()
        );
        const spent = category ? parseFloat(category.amount) : 0;
        const percentage = goal.limit > 0 ? Math.round((spent / goal.limit) * 100) : 0;

        return {
          ...goal,
          spent,
          percentage,
        };
      });

      setBudgetGoals(updatedGoals);
    } catch (error) {
      Alert.alert('Error', 'Failed to load budget goals');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newCategory.trim()) {
      Alert.alert('Missing Category', 'Please enter a category name');
      return;
    }

    const limitNum = parseFloat(newLimit);
    if (isNaN(limitNum) || limitNum <= 0) {
      Alert.alert('Invalid Limit', 'Please enter a valid budget limit');
      return;
    }

    try {
      const newGoal: BudgetGoal = {
        id: Date.now().toString(),
        category: newCategory.trim(),
        limit: limitNum,
        spent: 0,
        percentage: 0,
      };

      const updatedGoals = [...budgetGoals, newGoal];
      await AsyncStorage.setItem('budgetGoals', JSON.stringify(updatedGoals));

      setBudgetGoals(updatedGoals);
      setShowAddModal(false);
      setNewCategory('');
      setNewLimit('');
      loadData(); // Reload to get current spending
    } catch (error) {
      Alert.alert('Error', 'Failed to save budget goal');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    Alert.alert(
      'Delete Budget Goal',
      'Are you sure you want to delete this budget goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedGoals = budgetGoals.filter(g => g.id !== id);
              await AsyncStorage.setItem('budgetGoals', JSON.stringify(updatedGoals));
              setBudgetGoals(updatedGoals);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete budget goal');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return '#F44336';
    if (percentage >= 80) return '#FF9800';
    return '#4CAF50';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 100) return 'alert-circle';
    if (percentage >= 80) return 'warning';
    return 'checkmark-circle';
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Goals</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle" size={28} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {budgetGoals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No budget goals yet</Text>
            <Text style={styles.emptySubtext}>
              Set spending limits for your categories
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowAddModal(true)}>
              <Text style={styles.emptyButtonText}>Create Your First Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          budgetGoals.map(goal => (
            <View key={goal.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View style={styles.goalHeaderLeft}>
                  <Ionicons
                    name={getStatusIcon(goal.percentage)}
                    size={24}
                    color={getStatusColor(goal.percentage)}
                  />
                  <Text style={styles.categoryName}>{goal.category}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteGoal(goal.id)}>
                  <Ionicons name="trash-outline" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>

              <View style={styles.amounts}>
                <View>
                  <Text style={styles.amountLabel}>Spent</Text>
                  <Text style={[styles.amountValue, { color: getStatusColor(goal.percentage) }]}>
                    ₺{goal.spent.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.separator} />
                <View>
                  <Text style={styles.amountLabel}>Budget</Text>
                  <Text style={styles.amountValue}>₺{goal.limit.toFixed(2)}</Text>
                </View>
                <View style={styles.separator} />
                <View>
                  <Text style={styles.amountLabel}>Remaining</Text>
                  <Text style={[
                    styles.amountValue,
                    { color: goal.limit - goal.spent < 0 ? '#F44336' : '#4CAF50' }
                  ]}>
                    ₺{Math.abs(goal.limit - goal.spent).toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(goal.percentage, 100)}%`,
                        backgroundColor: getStatusColor(goal.percentage),
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: getStatusColor(goal.percentage) }]}>
                  {goal.percentage}% used
                </Text>
              </View>

              {goal.percentage >= 80 && (
                <View style={[styles.alert, { backgroundColor: goal.percentage >= 100 ? '#FFEBEE' : '#FFF3E0' }]}>
                  <Ionicons
                    name={goal.percentage >= 100 ? 'alert-circle' : 'warning'}
                    size={16}
                    color={goal.percentage >= 100 ? '#F44336' : '#FF9800'}
                  />
                  <Text style={[styles.alertText, { color: goal.percentage >= 100 ? '#F44336' : '#FF9800' }]}>
                    {goal.percentage >= 100
                      ? 'Budget exceeded!'
                      : 'Approaching budget limit'}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Budget Goal</Text>

            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="e.g., Food, Transport, Entertainment"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Monthly Budget Limit (₺)</Text>
            <TextInput
              style={styles.input}
              value={newLimit}
              onChangeText={setNewLimit}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewCategory('');
                  setNewLimit('');
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddGoal}>
                <Text style={styles.saveButtonText}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  addButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  goalCard: {
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
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  amounts: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  separator: {
    width: 1,
    backgroundColor: '#f0f0f0',
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  progressContainer: {
    marginTop: 8,
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
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'right',
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  alertText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#000',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
