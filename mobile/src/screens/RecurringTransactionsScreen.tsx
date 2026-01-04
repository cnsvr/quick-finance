import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { apiService } from '../services/api';

interface RecurringTransaction {
  id: string;
  amount: string;
  type: 'EXPENSE' | 'INCOME';
  category: string;
  description?: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  startDate: string;
  endDate?: string;
  nextRun: string;
  isActive: boolean;
}

export const RecurringTransactionsScreen = () => {
  const isFocused = useIsFocused();
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);

  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [interval, setInterval] = useState('1');

  useEffect(() => {
    loadRecurring();
  }, []);

  useEffect(() => {
    if (isFocused && !loading) {
      loadRecurring();
    }
  }, [isFocused]);

  const loadRecurring = async () => {
    try {
      const response = await apiService.getRecurring();
      setRecurring(response.data.recurring);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load recurring transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRecurring();
  };

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setDescription('');
    setType('EXPENSE');
    setFrequency('MONTHLY');
    setInterval('1');
    setEditingItem(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (item: RecurringTransaction) => {
    setEditingItem(item);
    setAmount(item.amount);
    setCategory(item.category);
    setDescription(item.description || '');
    setType(item.type);
    setFrequency(item.frequency);
    setInterval(item.interval.toString());
    setShowAddModal(true);
  };

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!category.trim()) {
      Alert.alert('Missing Category', 'Please enter a category');
      return;
    }

    try {
      if (editingItem) {
        // Update existing
        await apiService.updateRecurring(editingItem.id, {
          amount: numAmount,
          category: category.trim(),
          description: description.trim() || undefined,
          frequency,
          interval: parseInt(interval),
        });
        Alert.alert('Success', 'Recurring transaction updated');
      } else {
        // Create new
        await apiService.createRecurring({
          amount: numAmount,
          type,
          category: category.trim(),
          description: description.trim() || undefined,
          frequency,
          interval: parseInt(interval),
          startDate: new Date().toISOString(),
        });
        Alert.alert('Success', 'Recurring transaction created');
      }

      setShowAddModal(false);
      resetForm();
      loadRecurring();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Recurring Transaction',
      'Are you sure you want to delete this recurring transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteRecurring(id);
              setRecurring(prev => prev.filter(r => r.id !== id));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async (item: RecurringTransaction) => {
    try {
      await apiService.updateRecurring(item.id, {
        isActive: !item.isActive,
      });
      setRecurring(prev =>
        prev.map(r => (r.id === item.id ? { ...r, isActive: !r.isActive } : r))
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const getFrequencyText = (freq: string, int: number) => {
    const base = freq.toLowerCase();
    return int === 1 ? base : `every ${int} ${base}`;
  };

  const formatNextRun = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const renderItem = ({ item }: { item: RecurringTransaction }) => (
    <TouchableOpacity
      style={[styles.item, !item.isActive && styles.itemInactive]}
      onPress={() => handleEdit(item)}
      onLongPress={() => handleDelete(item.id)}>
      <View style={styles.itemLeft}>
        <View
          style={[
            styles.typeIndicator,
            item.type === 'INCOME' ? styles.incomeIndicator : styles.expenseIndicator,
          ]}
        />
        <View style={styles.itemInfo}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.frequency}>
            {getFrequencyText(item.frequency, item.interval)} • Next: {formatNextRun(item.nextRun)}
          </Text>
        </View>
      </View>
      <View style={styles.itemRight}>
        <Text
          style={[
            styles.amount,
            item.type === 'INCOME' ? styles.incomeAmount : styles.expenseAmount,
          ]}>
          {item.type === 'INCOME' ? '+' : '-'}₺{parseFloat(item.amount).toFixed(2)}
        </Text>
        <TouchableOpacity onPress={() => handleToggleActive(item)}>
          <Ionicons
            name={item.isActive ? 'pause-circle' : 'play-circle'}
            size={24}
            color={item.isActive ? '#FF9800' : '#4CAF50'}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recurring Transactions</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add-circle" size={28} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={recurring}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="repeat" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No Recurring Transactions</Text>
            <Text style={styles.emptySubtext}>
              Set up automatic monthly bills, subscriptions, or salary
            </Text>
          </View>
        }
      />

      <Text style={styles.hint}>Tap to edit • Long press to delete • Pause/Resume button</Text>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowAddModal(false);
          resetForm();
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Edit Recurring' : 'Add Recurring Transaction'}
              </Text>

              {/* Amount */}
              <Text style={styles.label}>Amount (₺)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />

              {/* Type */}
              {!editingItem && (
                <>
                  <Text style={styles.label}>Type</Text>
                  <View style={styles.typeButtons}>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        type === 'EXPENSE' && styles.typeButtonActive,
                      ]}
                      onPress={() => setType('EXPENSE')}>
                      <Text
                        style={[
                          styles.typeButtonText,
                          type === 'EXPENSE' && styles.typeButtonTextActive,
                        ]}>
                        Expense
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        type === 'INCOME' && styles.typeButtonActive,
                      ]}
                      onPress={() => setType('INCOME')}>
                      <Text
                        style={[
                          styles.typeButtonText,
                          type === 'INCOME' && styles.typeButtonTextActive,
                        ]}>
                        Income
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Category */}
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="e.g., Netflix, Salary"
              />

              {/* Description */}
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Additional notes"
              />

              {/* Frequency */}
              <Text style={styles.label}>Frequency</Text>
              <View style={styles.frequencyButtons}>
                {(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const).map(freq => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.freqButton,
                      frequency === freq && styles.freqButtonActive,
                    ]}
                    onPress={() => setFrequency(freq)}>
                    <Text
                      style={[
                        styles.freqButtonText,
                        frequency === freq && styles.freqButtonTextActive,
                      ]}>
                      {freq.charAt(0) + freq.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Interval */}
              <Text style={styles.label}>Every</Text>
              <TextInput
                style={styles.input}
                value={interval}
                onChangeText={setInterval}
                keyboardType="number-pad"
                placeholder="1"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
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
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  itemInactive: {
    opacity: 0.5,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  incomeIndicator: {
    backgroundColor: '#4CAF50',
  },
  expenseIndicator: {
    backgroundColor: '#F44336',
  },
  itemInfo: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  frequency: {
    fontSize: 12,
    color: '#666',
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  incomeAmount: {
    color: '#4CAF50',
  },
  expenseAmount: {
    color: '#F44336',
  },
  empty: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    padding: 12,
    color: '#999',
    fontSize: 12,
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
    width: '90%',
    maxHeight: '80%',
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
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  frequencyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  freqButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  freqButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  freqButtonText: {
    fontSize: 14,
    color: '#666',
  },
  freqButtonTextActive: {
    color: '#2196F3',
    fontWeight: '600',
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
