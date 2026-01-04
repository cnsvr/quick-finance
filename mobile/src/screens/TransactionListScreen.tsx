import React, { useState, useEffect, useMemo } from 'react';
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

interface Transaction {
  id: string;
  amount: string;
  type: 'EXPENSE' | 'INCOME';
  category: string;
  description?: string;
  date: string;
}

type DateFilter = 'all' | 'week' | 'month' | 'custom';
type TypeFilter = 'all' | 'EXPENSE' | 'INCOME';
type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export const TransactionListScreen = () => {
  const isFocused = useIsFocused();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  // Auto-refresh when tab is focused
  useEffect(() => {
    if (isFocused && !loading) {
      loadTransactions();
    }
  }, [isFocused]);

  const loadTransactions = async () => {
    try {
      const response = await apiService.getTransactions();
      setTransactions(response.data.transactions);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to load transactions. Please check your connection.';
      Alert.alert('Unable to Load Transactions', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditAmount(transaction.amount);
    setEditCategory(transaction.category);
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction) return;

    const numAmount = parseFloat(editAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than zero');
      return;
    }

    if (!editCategory.trim()) {
      Alert.alert('Missing Category', 'Please enter a category');
      return;
    }

    try {
      await apiService.updateTransaction(editingTransaction.id, {
        amount: numAmount,
        category: editCategory,
      });

      // Update local state
      setTransactions(prev =>
        prev.map(t =>
          t.id === editingTransaction.id
            ? { ...t, amount: numAmount.toString(), category: editCategory }
            : t
        )
      );

      setEditingTransaction(null);
      Alert.alert('Success', 'Transaction updated');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update transaction';
      Alert.alert('Update Failed', message);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteTransaction(id);
              setTransactions(prev => prev.filter(t => t.id !== id));
            } catch (error: any) {
              const message = error.response?.data?.message || 'Failed to delete transaction. Please try again.';
              Alert.alert('Delete Failed', message);
            }
          },
        },
      ]
    );
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    transactions.forEach(t => cats.add(t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        const transactionDay = new Date(
          transactionDate.getFullYear(),
          transactionDate.getMonth(),
          transactionDate.getDate()
        );

        if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return transactionDay >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return transactionDay >= monthAgo;
        }
        return true;
      });
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.category.toLowerCase().includes(query) ||
        t.amount.includes(query) ||
        (t.description && t.description.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return parseFloat(b.amount) - parseFloat(a.amount);
        case 'amount-asc':
          return parseFloat(a.amount) - parseFloat(b.amount);
        default:
          return 0;
      }
    });

    return filtered;
  }, [transactions, dateFilter, typeFilter, categoryFilter, searchQuery, sortOption]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => handleEdit(item)}
      onLongPress={() => handleDelete(item.id)}>
      <View style={styles.transactionLeft}>
        <View style={[
          styles.typeIndicator,
          item.type === 'INCOME' ? styles.incomeIndicator : styles.expenseIndicator
        ]} />
        <View>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
        </View>
      </View>
      <Text style={[
        styles.amount,
        item.type === 'INCOME' ? styles.incomeAmount : styles.expenseAmount
      ]}>
        {item.type === 'INCOME' ? '+' : '-'}₺{parseFloat(item.amount).toFixed(2)}
      </Text>
    </TouchableOpacity>
  );

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
        <View style={styles.headerTop}>
          <Text style={styles.title}>Transactions</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}>
            <Ionicons name="filter" size={20} color="#2196F3" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Active Filter Badges */}
        <View style={styles.filterBadgesContainer}>
          {dateFilter !== 'all' && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {dateFilter === 'week' ? 'Last 7 days' : 'Last 30 days'}
              </Text>
              <TouchableOpacity onPress={() => setDateFilter('all')}>
                <Ionicons name="close" size={14} color="#2196F3" />
              </TouchableOpacity>
            </View>
          )}
          {typeFilter !== 'all' && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {typeFilter === 'INCOME' ? 'Income' : 'Expenses'}
              </Text>
              <TouchableOpacity onPress={() => setTypeFilter('all')}>
                <Ionicons name="close" size={14} color="#2196F3" />
              </TouchableOpacity>
            </View>
          )}
          {categoryFilter !== 'all' && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{categoryFilter}</Text>
              <TouchableOpacity onPress={() => setCategoryFilter('all')}>
                <Ionicons name="close" size={14} color="#2196F3" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.count}>
          {filteredTransactions.length} of {transactions.length} transactions
        </Text>
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={item => item.id}
        renderItem={renderTransaction}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {searchQuery || dateFilter !== 'all' ? 'No matching transactions' : 'No transactions yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || dateFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first expense to get started!'}
            </Text>
          </View>
        }
      />

      <Text style={styles.hint}>Tap to edit • Long press to delete</Text>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Filter & Sort</Text>

              {/* Date Filter */}
              <Text style={styles.filterSectionTitle}>Date Range</Text>
              <TouchableOpacity
                style={[styles.filterOption, dateFilter === 'all' && styles.filterOptionActive]}
                onPress={() => setDateFilter('all')}>
                <Text style={[styles.filterOptionText, dateFilter === 'all' && styles.filterOptionTextActive]}>
                  All Time
                </Text>
                {dateFilter === 'all' && <Ionicons name="checkmark" size={20} color="#2196F3" />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, dateFilter === 'week' && styles.filterOptionActive]}
                onPress={() => setDateFilter('week')}>
                <Text style={[styles.filterOptionText, dateFilter === 'week' && styles.filterOptionTextActive]}>
                  Last 7 Days
                </Text>
                {dateFilter === 'week' && <Ionicons name="checkmark" size={20} color="#2196F3" />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, dateFilter === 'month' && styles.filterOptionActive]}
                onPress={() => setDateFilter('month')}>
                <Text style={[styles.filterOptionText, dateFilter === 'month' && styles.filterOptionTextActive]}>
                  Last 30 Days
                </Text>
                {dateFilter === 'month' && <Ionicons name="checkmark" size={20} color="#2196F3" />}
              </TouchableOpacity>

              {/* Type Filter */}
              <Text style={styles.filterSectionTitle}>Transaction Type</Text>
              <TouchableOpacity
                style={[styles.filterOption, typeFilter === 'all' && styles.filterOptionActive]}
                onPress={() => setTypeFilter('all')}>
                <Text style={[styles.filterOptionText, typeFilter === 'all' && styles.filterOptionTextActive]}>
                  All Types
                </Text>
                {typeFilter === 'all' && <Ionicons name="checkmark" size={20} color="#2196F3" />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, typeFilter === 'EXPENSE' && styles.filterOptionActive]}
                onPress={() => setTypeFilter('EXPENSE')}>
                <Text style={[styles.filterOptionText, typeFilter === 'EXPENSE' && styles.filterOptionTextActive]}>
                  Expenses Only
                </Text>
                {typeFilter === 'EXPENSE' && <Ionicons name="checkmark" size={20} color="#2196F3" />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, typeFilter === 'INCOME' && styles.filterOptionActive]}
                onPress={() => setTypeFilter('INCOME')}>
                <Text style={[styles.filterOptionText, typeFilter === 'INCOME' && styles.filterOptionTextActive]}>
                  Income Only
                </Text>
                {typeFilter === 'INCOME' && <Ionicons name="checkmark" size={20} color="#2196F3" />}
              </TouchableOpacity>

              {/* Category Filter */}
              {categories.length > 0 && (
                <>
                  <Text style={styles.filterSectionTitle}>Category</Text>
                  <TouchableOpacity
                    style={[styles.filterOption, categoryFilter === 'all' && styles.filterOptionActive]}
                    onPress={() => setCategoryFilter('all')}>
                    <Text style={[styles.filterOptionText, categoryFilter === 'all' && styles.filterOptionTextActive]}>
                      All Categories
                    </Text>
                    {categoryFilter === 'all' && <Ionicons name="checkmark" size={20} color="#2196F3" />}
                  </TouchableOpacity>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.filterOption, categoryFilter === cat && styles.filterOptionActive]}
                      onPress={() => setCategoryFilter(cat)}>
                      <Text style={[styles.filterOptionText, categoryFilter === cat && styles.filterOptionTextActive]}>
                        {cat}
                      </Text>
                      {categoryFilter === cat && <Ionicons name="checkmark" size={20} color="#2196F3" />}
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* Sort Options */}
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <TouchableOpacity
                style={[styles.filterOption, sortOption === 'date-desc' && styles.filterOptionActive]}
                onPress={() => setSortOption('date-desc')}>
                <Text style={[styles.filterOptionText, sortOption === 'date-desc' && styles.filterOptionTextActive]}>
                  Newest First
                </Text>
                {sortOption === 'date-desc' && <Ionicons name="checkmark" size={20} color="#2196F3" />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, sortOption === 'date-asc' && styles.filterOptionActive]}
                onPress={() => setSortOption('date-asc')}>
                <Text style={[styles.filterOptionText, sortOption === 'date-asc' && styles.filterOptionTextActive]}>
                  Oldest First
                </Text>
                {sortOption === 'date-asc' && <Ionicons name="checkmark" size={20} color="#2196F3" />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, sortOption === 'amount-desc' && styles.filterOptionActive]}
                onPress={() => setSortOption('amount-desc')}>
                <Text style={[styles.filterOptionText, sortOption === 'amount-desc' && styles.filterOptionTextActive]}>
                  Highest Amount
                </Text>
                {sortOption === 'amount-desc' && <Ionicons name="checkmark" size={20} color="#2196F3" />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, sortOption === 'amount-asc' && styles.filterOptionActive]}
                onPress={() => setSortOption('amount-asc')}>
                <Text style={[styles.filterOptionText, sortOption === 'amount-asc' && styles.filterOptionTextActive]}>
                  Lowest Amount
                </Text>
                {sortOption === 'amount-asc' && <Ionicons name="checkmark" size={20} color="#2196F3" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => setShowFilterModal(false)}>
                <Text style={styles.saveButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={!!editingTransaction}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingTransaction(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Transaction</Text>

            <Text style={styles.label}>Amount (₺)</Text>
            <TextInput
              style={styles.input}
              value={editAmount}
              onChangeText={setEditAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />

            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={editCategory}
              onChangeText={setEditCategory}
              placeholder="Category"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditingTransaction(null)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEdit}>
                <Text style={styles.saveButtonText}>Save</Text>
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
    backgroundColor: '#fff',
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
  },
  filterBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  filterBadgeText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '600',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 12,
  },
  count: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#4CAF50',
  },
  expenseAmount: {
    color: '#F44336',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
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
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  filterOptionActive: {
    backgroundColor: '#E3F2FD',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#666',
  },
  filterOptionTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
});
