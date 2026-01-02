import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Vibration,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { apiService } from '../services/api';

// Top 6 expense categories
const DEFAULT_EXPENSE_CATEGORIES = [
  { emoji: '☕', name: 'Coffee' },
  { emoji: '🍔', name: 'Food' },
  { emoji: '🛒', name: 'Groceries' },
  { emoji: '🚗', name: 'Transport' },
  { emoji: '🎬', name: 'Entertainment' },
  { emoji: '💊', name: 'Health' },
];

// Top 6 income categories
const DEFAULT_INCOME_CATEGORIES = [
  { emoji: '💰', name: 'Salary' },
  { emoji: '💼', name: 'Freelance' },
  { emoji: '📈', name: 'Investment' },
  { emoji: '🎁', name: 'Gift' },
  { emoji: '💳', name: 'Refund' },
  { emoji: '➕', name: 'Other' },
];

export const QuickEntryScreen = () => {
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [transactionType, setTransactionType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [categories, setCategories] = useState(DEFAULT_EXPENSE_CATEGORIES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  // Update categories when transaction type changes
  useEffect(() => {
    setCategories(transactionType === 'EXPENSE' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES);
    setSelectedCategory(''); // Reset selection when switching types
  }, [transactionType]);

  const loadCategories = async () => {
    try {
      const suggestions = await apiService.getCategorySuggestions();

      if (suggestions && suggestions.length > 0) {
        // Map suggestions to categories with emojis based on type
        const defaultCategories = transactionType === 'EXPENSE'
          ? DEFAULT_EXPENSE_CATEGORIES
          : DEFAULT_INCOME_CATEGORIES;

        const topCategories = suggestions.slice(0, 6).map((s: any) => {
          const defaultCat = defaultCategories.find(c => c.name === s.category);
          return defaultCat || { emoji: '📌', name: s.category };
        });
        setCategories(topCategories);
      }
    } catch (error) {
      // Use default categories if error
      console.log('Using default categories');
    }
  };

  const handleNumberPress = (num: string) => {
    if (amount.length < 10) {
      setAmount(prev => prev + num);
      Vibration.vibrate(10); // Haptic feedback
    }
  };

  const handleBackspace = () => {
    setAmount(prev => prev.slice(0, -1));
    Vibration.vibrate(10);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    Vibration.vibrate(20);
  };

  const handleSubmit = async () => {
    if (!amount || !selectedCategory) {
      Alert.alert('Missing Information', 'Please enter an amount and select a category');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than zero');
      return;
    }

    setLoading(true);
    try {
      await apiService.quickEntry(numAmount, selectedCategory, transactionType);

      // Success feedback
      Vibration.vibrate([0, 50, 50, 50]); // Success pattern

      // Reset form
      setAmount('');
      setSelectedCategory('');

      const typeText = transactionType === 'INCOME' ? 'income' : 'expense';
      Alert.alert('Added!', `₺${numAmount} ${typeText} added to ${selectedCategory}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add transaction. Please check your connection.';
      Alert.alert('Failed to Add', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Type Toggle */}
        <View style={styles.typeToggle}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            transactionType === 'EXPENSE' && styles.typeButtonActive,
            transactionType === 'EXPENSE' && styles.expenseActive,
          ]}
          onPress={() => {
            setTransactionType('EXPENSE');
            Vibration.vibrate(20);
          }}>
          <Text style={[
            styles.typeButtonText,
            transactionType === 'EXPENSE' && styles.typeButtonTextActive,
          ]}>
            Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            transactionType === 'INCOME' && styles.typeButtonActive,
            transactionType === 'INCOME' && styles.incomeActive,
          ]}
          onPress={() => {
            setTransactionType('INCOME');
            Vibration.vibrate(20);
          }}>
          <Text style={[
            styles.typeButtonText,
            transactionType === 'INCOME' && styles.typeButtonTextActive,
          ]}>
            Income
          </Text>
        </TouchableOpacity>
      </View>

      {/* Amount Display */}
      <View style={styles.amountContainer}>
        <Text style={styles.currencySymbol}>₺</Text>
        <Text style={[
          styles.amount,
          transactionType === 'INCOME' && styles.incomeText,
        ]}>{amount || '0'}</Text>
      </View>

      {/* Category Selection */}
      <View style={styles.categoriesContainer}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.name}
            style={[
              styles.categoryButton,
              selectedCategory === cat.name && styles.categoryButtonSelected,
            ]}
            onPress={() => handleCategorySelect(cat.name)}>
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <Text style={styles.categoryName}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Numpad */}
      <View style={styles.numpadContainer}>
        <View style={styles.numpadRow}>
          <NumpadButton number="7" onPress={handleNumberPress} />
          <NumpadButton number="8" onPress={handleNumberPress} />
          <NumpadButton number="9" onPress={handleNumberPress} />
        </View>
        <View style={styles.numpadRow}>
          <NumpadButton number="4" onPress={handleNumberPress} />
          <NumpadButton number="5" onPress={handleNumberPress} />
          <NumpadButton number="6" onPress={handleNumberPress} />
        </View>
        <View style={styles.numpadRow}>
          <NumpadButton number="1" onPress={handleNumberPress} />
          <NumpadButton number="2" onPress={handleNumberPress} />
          <NumpadButton number="3" onPress={handleNumberPress} />
        </View>
        <View style={styles.numpadRow}>
          <TouchableOpacity style={styles.numpadButton} onPress={handleBackspace}>
            <Text style={styles.numpadText}>⌫</Text>
          </TouchableOpacity>
          <NumpadButton number="0" onPress={handleNumberPress} />
          <NumpadButton number="." onPress={handleNumberPress} />
        </View>
      </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!amount || !selectedCategory) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!amount || !selectedCategory || loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Add ✓</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Numpad Button Component
const NumpadButton = ({ number, onPress }: { number: string; onPress: (n: string) => void }) => (
  <TouchableOpacity style={styles.numpadButton} onPress={() => onPress(number)}>
    <Text style={styles.numpadText}>{number}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  expenseActive: {
    backgroundColor: '#FFEBEE',
  },
  incomeActive: {
    backgroundColor: '#E8F5E9',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#000',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    paddingVertical: 40,
  },
  currencySymbol: {
    fontSize: 32,
    color: '#666',
    marginRight: 8,
  },
  amount: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#F44336',
  },
  incomeText: {
    color: '#4CAF50',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  categoryButton: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f5f5f5',
  },
  categoryButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    color: '#666',
  },
  numpadContainer: {
    marginBottom: 20,
  },
  numpadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  numpadButton: {
    width: '31%',
    aspectRatio: 1.2,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numpadText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
