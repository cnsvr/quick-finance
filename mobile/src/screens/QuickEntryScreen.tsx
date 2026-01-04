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
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { apiService } from '../services/api';

// Common emojis for categories
const EMOJI_OPTIONS = [
  '☕', '🍔', '🛒', '🚗', '🎬', '💊', '👕', '🏠', '💡', '📱',
  '✈️', '📚', '💰', '💼', '📈', '🎁', '💳', '🍕', '🍺', '⛽',
  '🏋️', '🎮', '🎵', '🐕', '🚕', '🏥', '💅', '🎨', '📦', '🔧',
];

// Default categories
const DEFAULT_CATEGORIES = {
  EXPENSE: [
    { emoji: '☕', name: 'Coffee' },
    { emoji: '🍔', name: 'Food' },
    { emoji: '🛒', name: 'Groceries' },
    { emoji: '🚗', name: 'Transport' },
    { emoji: '🎬', name: 'Entertainment' },
    { emoji: '💊', name: 'Health' },
    { emoji: '👕', name: 'Shopping' },
    { emoji: '🏠', name: 'Rent' },
    { emoji: '💡', name: 'Utilities' },
    { emoji: '📱', name: 'Phone' },
    { emoji: '✈️', name: 'Travel' },
    { emoji: '📚', name: 'Education' },
  ],
  INCOME: [
    { emoji: '💰', name: 'Salary' },
    { emoji: '💼', name: 'Freelance' },
    { emoji: '📈', name: 'Investment' },
    { emoji: '🎁', name: 'Gift' },
    { emoji: '💳', name: 'Refund' },
    { emoji: '➕', name: 'Other' },
  ],
};

interface FavoriteCategory {
  id: string;
  category: string;
  emoji: string;
  type: 'EXPENSE' | 'INCOME';
  order: number;
  isFavorite?: boolean;
  isDefault?: boolean;
}

interface Category {
  category: string;
  type: 'EXPENSE' | 'INCOME';
  count: number;
}

const MAX_FAVORITES = 6;

export const QuickEntryScreen = () => {
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategoryEmoji, setSelectedCategoryEmoji] = useState('');
  const [transactionType, setTransactionType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [favoriteCategories, setFavoriteCategories] = useState<FavoriteCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Modal state
  const [allCategories, setAllCategories] = useState<FavoriteCategory[]>([]);
  const [tempFavorites, setTempFavorites] = useState<Set<string>>(new Set());
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📌');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFavoriteCategories();
  }, [transactionType]);

  const loadFavoriteCategories = async () => {
    try {
      const favorites = await apiService.getFavoriteCategories(transactionType);
      if (favorites && favorites.length > 0) {
        setFavoriteCategories(favorites.slice(0, MAX_FAVORITES));
      } else {
        // Initialize with first 6 default categories
        const defaultCats = DEFAULT_CATEGORIES[transactionType].slice(0, MAX_FAVORITES);
        setFavoriteCategories(defaultCats.map((cat, index) => ({
          id: `default-${index}`,
          category: cat.name,
          emoji: cat.emoji,
          type: transactionType,
          order: index,
          isDefault: true,
        })));
      }
    } catch (error) {
      console.log('Error loading favorites, using defaults');
      const defaultCats = DEFAULT_CATEGORIES[transactionType].slice(0, MAX_FAVORITES);
      setFavoriteCategories(defaultCats.map((cat, index) => ({
        id: `default-${index}`,
        category: cat.name,
        emoji: cat.emoji,
        type: transactionType,
        order: index,
        isDefault: true,
      })));
    }
  };

  const loadAllCategories = async () => {
    try {
      // Get user's transaction categories
      const userCategories = await apiService.getAllCategories(transactionType);

      // Get current favorites
      const favorites = await apiService.getFavoriteCategories(transactionType);
      const favoriteSet = new Set(favorites.map((f: FavoriteCategory) => f.category));
      setTempFavorites(favoriteSet);

      // Combine default categories with user categories
      const defaultCats = DEFAULT_CATEGORIES[transactionType].map((cat, index) => ({
        id: `default-${cat.name}`,
        category: cat.name,
        emoji: cat.emoji,
        type: transactionType,
        order: index,
        isDefault: true,
        isFavorite: favoriteSet.has(cat.name),
      }));

      const userCats = (userCategories || [])
        .filter((cat: Category) => !defaultCats.find(d => d.category === cat.category))
        .map((cat: Category, index: number) => ({
          id: `user-${cat.category}`,
          category: cat.category,
          emoji: '📌',
          type: transactionType,
          order: defaultCats.length + index,
          isDefault: false,
          isFavorite: favoriteSet.has(cat.category),
        }));

      setAllCategories([...defaultCats, ...userCats]);
    } catch (error) {
      console.log('Error loading all categories');
      const defaultCats = DEFAULT_CATEGORIES[transactionType].map((cat, index) => ({
        id: `default-${cat.name}`,
        category: cat.name,
        emoji: cat.emoji,
        type: transactionType,
        order: index,
        isDefault: true,
        isFavorite: false,
      }));
      setAllCategories(defaultCats);
      setTempFavorites(new Set());
    }
  };

  const formatNumber = (value: string): string => {
    if (!value) return '0';
    const cleaned = value.replace(/[^\d,]/g, '');
    const parts = cleaned.split(',');
    const integerPart = parts[0] || '0';
    const decimalPart = parts[1];
    const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return decimalPart !== undefined ? `${formatted},${decimalPart.slice(0, 2)}` : formatted;
  };

  const parseFormattedNumber = (formatted: string): number => {
    const normalized = formatted.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  };

  const handleNumberPress = (num: string) => {
    if (num === ',' && amount.includes(',')) return;
    if (amount.includes(',') && amount.split(',')[1].length >= 2) return;
    const newAmount = amount + num;
    setAmount(newAmount);
    Vibration.vibrate(10);
  };

  const handleBackspace = () => {
    setAmount(prev => prev.slice(0, -1));
    Vibration.vibrate(10);
  };

  const handleCategorySelect = (category: string, emoji: string) => {
    setSelectedCategory(category);
    setSelectedCategoryEmoji(emoji);
    Vibration.vibrate(20);
  };

  const handleOpenCategoryModal = () => {
    loadAllCategories();
    setShowCategoryModal(true);
    setNewCategoryName('');
    setSelectedEmoji('📌');
    setShowEmojiPicker(false);
    setSearchQuery('');
  };

  const handleToggleFavorite = (category: string) => {
    const newFavorites = new Set(tempFavorites);

    if (newFavorites.has(category)) {
      // Can't remove if it's the last favorite
      if (newFavorites.size <= 1) {
        Alert.alert('Error', 'You must have at least 1 favorite category');
        return;
      }
      newFavorites.delete(category);
    } else {
      // Can't add if already at max
      if (newFavorites.size >= MAX_FAVORITES) {
        Alert.alert('Limit Reached', `You can have maximum ${MAX_FAVORITES} favorite categories`);
        return;
      }
      newFavorites.add(category);
    }

    setTempFavorites(newFavorites);

    // Update UI
    setAllCategories(prev => prev.map(cat => ({
      ...cat,
      isFavorite: newFavorites.has(cat.category),
    })));
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    // Check if category already exists
    if (allCategories.find(c => c.category.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      Alert.alert('Error', 'This category already exists');
      return;
    }

    const newCategory: FavoriteCategory = {
      id: `new-${Date.now()}`,
      category: newCategoryName.trim(),
      emoji: selectedEmoji,
      type: transactionType,
      order: allCategories.length,
      isDefault: false,
      isFavorite: false,
    };

    setAllCategories(prev => [...prev, newCategory]);
    setNewCategoryName('');
    setSelectedEmoji('📌');
    setShowEmojiPicker(false);
    Alert.alert('Success', 'Category added! Star it to add to favorites.');
  };

  const handleDeleteCategory = async (category: FavoriteCategory) => {
    if (category.isDefault) {
      Alert.alert('Cannot Delete', 'Default categories cannot be deleted');
      return;
    }

    Alert.alert(
      'Delete Category',
      `Delete "${category.category}"? This will also remove it from your favorites and all transactions with this category will remain unchanged.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // If it's a favorite, delete from backend
              if (category.id && !category.id.startsWith('new-') && !category.id.startsWith('user-')) {
                await apiService.deleteFavoriteCategory(category.id);
              }

              // Remove from temp favorites
              const newFavorites = new Set(tempFavorites);
              newFavorites.delete(category.category);
              setTempFavorites(newFavorites);

              // Remove from all categories
              setAllCategories(prev => prev.filter(c => c.id !== category.id));

              Alert.alert('Deleted', `${category.category} has been removed`);
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const handleApplyFavorites = async () => {
    if (tempFavorites.size === 0) {
      Alert.alert('Error', 'Please select at least 1 favorite category');
      return;
    }

    try {
      // Delete all current favorites
      const currentFavorites = await apiService.getFavoriteCategories(transactionType);
      await Promise.all(
        currentFavorites.map((fav: FavoriteCategory) =>
          apiService.deleteFavoriteCategory(fav.id)
        )
      );

      // Add new favorites
      const favoritesToAdd = allCategories.filter(cat => tempFavorites.has(cat.category));
      await Promise.all(
        favoritesToAdd.map((cat, index) =>
          apiService.addFavoriteCategory({
            category: cat.category,
            emoji: cat.emoji,
            type: transactionType,
            order: index,
          })
        )
      );

      // Reload favorites
      await loadFavoriteCategories();
      setShowCategoryModal(false);
      Alert.alert('Success', 'Favorite categories updated!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update favorites');
    }
  };

  const handleSubmit = async () => {
    if (!amount || !selectedCategory) {
      Alert.alert('Missing Information', 'Please enter an amount and select a category');
      return;
    }

    const numAmount = parseFormattedNumber(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than zero');
      return;
    }

    setLoading(true);
    try {
      await apiService.quickEntry(numAmount, selectedCategory, transactionType);
      Vibration.vibrate([0, 50, 50, 50]);
      setAmount('');
      setSelectedCategory('');
      setSelectedCategoryEmoji('');
      const typeText = transactionType === 'INCOME' ? 'income' : 'expense';
      const formattedAmount = formatNumber(numAmount.toFixed(2).replace('.', ','));
      Alert.alert('Added!', `₺${formattedAmount} ${typeText} added to ${selectedCategory}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add transaction. Please check your connection.';
      Alert.alert('Failed to Add', message);
    } finally {
      setLoading(false);
    }
  };

  const displayAmount = formatNumber(amount);

  // Filter categories by search query
  const filteredCategories = allCategories.filter(cat =>
    cat.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              setSelectedCategory('');
              setSelectedCategoryEmoji('');
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
              setSelectedCategory('');
              setSelectedCategoryEmoji('');
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
          ]}>{displayAmount}</Text>
        </View>

        {/* Selected Category Display */}
        {selectedCategory ? (
          <View style={styles.selectedCategoryContainer}>
            <Text style={styles.selectedCategoryEmoji}>{selectedCategoryEmoji}</Text>
            <Text style={styles.selectedCategoryText}>{selectedCategory}</Text>
          </View>
        ) : (
          <Text style={styles.selectCategoryHint}>Select a category below</Text>
        )}

        {/* Favorite Categories */}
        <View style={styles.favoriteCategoriesContainer}>
          {favoriteCategories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.favoriteCategoryButton,
                selectedCategory === cat.category && styles.categoryButtonSelected,
              ]}
              onPress={() => handleCategorySelect(cat.category, cat.emoji)}>
              <Text style={styles.favoriteCategoryEmoji}>{cat.emoji}</Text>
              <Text style={styles.favoriteCategoryName} numberOfLines={1}>{cat.category}</Text>
            </TouchableOpacity>
          ))}

          {/* More Button */}
          <TouchableOpacity
            style={styles.addCategoryButton}
            onPress={handleOpenCategoryModal}>
            <Ionicons name="add-circle" size={32} color="#2196F3" />
            <Text style={styles.addCategoryText}>More</Text>
          </TouchableOpacity>
        </View>

        {/* Numpad */}
        <View style={styles.numpadContainer}>
          <View style={styles.numpadRow}>
            <NumpadButton number="1" onPress={handleNumberPress} />
            <NumpadButton number="2" onPress={handleNumberPress} />
            <NumpadButton number="3" onPress={handleNumberPress} />
          </View>
          <View style={styles.numpadRow}>
            <NumpadButton number="4" onPress={handleNumberPress} />
            <NumpadButton number="5" onPress={handleNumberPress} />
            <NumpadButton number="6" onPress={handleNumberPress} />
          </View>
          <View style={styles.numpadRow}>
            <NumpadButton number="7" onPress={handleNumberPress} />
            <NumpadButton number="8" onPress={handleNumberPress} />
            <NumpadButton number="9" onPress={handleNumberPress} />
          </View>
          <View style={styles.numpadRow}>
            <NumpadButton number="," onPress={handleNumberPress} />
            <NumpadButton number="0" onPress={handleNumberPress} />
            <TouchableOpacity style={styles.numpadButton} onPress={handleBackspace}>
              <Ionicons name="backspace-outline" size={28} color="#000" />
            </TouchableOpacity>
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
            <Text style={styles.submitButtonText}>Add Transaction ✓</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Category Management Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Categories</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Category Count & Limit */}
              <View style={styles.categoryLimitInfo}>
                <Text style={styles.categoryLimitText}>
                  {allCategories.length}/30 categories
                </Text>
                {allCategories.length >= 25 && (
                  <Text style={styles.categoryWarningText}>
                    {allCategories.length >= 30
                      ? '⚠️ Maximum limit reached'
                      : `⚠️ ${30 - allCategories.length} remaining`}
                  </Text>
                )}
              </View>

              {/* Add New Category */}
              <View style={styles.addNewSection}>
                <Text style={styles.sectionTitle}>Add New Category</Text>
                <View style={styles.newCategoryForm}>
                  <TouchableOpacity
                    style={styles.emojiButton}
                    onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
                    <Text style={styles.emojiButtonText}>{selectedEmoji}</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.categoryNameInput}
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    placeholder="Category name"
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddNewCategory}>
                    <Ionicons name="add" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <View style={styles.emojiPicker}>
                    {EMOJI_OPTIONS.map(emoji => (
                      <TouchableOpacity
                        key={emoji}
                        style={styles.emojiOption}
                        onPress={() => {
                          setSelectedEmoji(emoji);
                          setShowEmojiPicker(false);
                        }}>
                        <Text style={styles.emojiOptionText}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Search Bar */}
              <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                  <Ionicons name="search" size={20} color="#999" />
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search categories..."
                    placeholderTextColor="#999"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* All Categories */}
              <View style={styles.allCategoriesSection}>
                <Text style={styles.sectionTitle}>
                  All Categories ({tempFavorites.size}/{MAX_FAVORITES} favorites)
                </Text>
                {filteredCategories.map(cat => (
                  <View key={cat.id} style={styles.categoryItem}>
                    <TouchableOpacity
                      style={styles.categoryItemLeft}
                      onPress={() => handleToggleFavorite(cat.category)}>
                      <Ionicons
                        name={cat.isFavorite ? 'star' : 'star-outline'}
                        size={24}
                        color={cat.isFavorite ? '#FFC107' : '#ccc'}
                      />
                      <Text style={styles.categoryItemEmoji}>{cat.emoji}</Text>
                      <Text style={styles.categoryItemName}>{cat.category}</Text>
                    </TouchableOpacity>
                    {!cat.isDefault && (
                      <TouchableOpacity onPress={() => handleDeleteCategory(cat)}>
                        <Ionicons name="trash-outline" size={20} color="#F44336" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Apply Button */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  tempFavorites.size === 0 && styles.applyButtonDisabled,
                ]}
                onPress={handleApplyFavorites}
                disabled={tempFavorites.size === 0}>
                <Text style={styles.applyButtonText}>
                  Apply ({tempFavorites.size} selected)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

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
    paddingVertical: 20,
  },
  currencySymbol: {
    fontSize: 32,
    color: '#666',
    marginRight: 8,
  },
  amount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#F44336',
  },
  incomeText: {
    color: '#4CAF50',
  },
  selectedCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 20,
    alignSelf: 'center',
  },
  selectedCategoryEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  selectedCategoryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  selectCategoryHint: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginBottom: 20,
  },
  favoriteCategoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  favoriteCategoryButton: {
    width: '22%',
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
  favoriteCategoryEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  favoriteCategoryName: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  addCategoryButton: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e3f2fd',
    borderStyle: 'dashed',
  },
  addCategoryText: {
    fontSize: 10,
    color: '#2196F3',
    marginTop: 2,
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
    aspectRatio: 1.3,
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
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  modalScroll: {
    padding: 20,
  },
  categoryLimitInfo: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  categoryLimitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  categoryWarningText: {
    fontSize: 12,
    color: '#FF9800',
    textAlign: 'center',
    marginTop: 4,
  },
  addNewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  newCategoryForm: {
    flexDirection: 'row',
    gap: 8,
  },
  emojiButton: {
    width: 60,
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiButtonText: {
    fontSize: 28,
  },
  categoryNameInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000',
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  emojiOption: {
    width: '10%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emojiOptionText: {
    fontSize: 28,
  },
  searchSection: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    padding: 0,
  },
  allCategoriesSection: {
    marginBottom: 24,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryItemEmoji: {
    fontSize: 24,
    marginHorizontal: 12,
  },
  categoryItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  applyButton: {
    backgroundColor: '#2196F3',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
