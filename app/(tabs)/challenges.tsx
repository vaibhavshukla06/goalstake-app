import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList,
  TouchableOpacity,
  TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useChallengeStore } from "@/store/challengeStore";
import { ChallengeCard } from "@/components/ChallengeCard";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/constants/colors";
import { Challenge, ChallengeCategory } from "@/types";
import { 
  Search, 
  Trophy,
  Filter
} from "lucide-react-native";

export default function ChallengesScreen() {
  const { challenges, userChallenges, fetchChallenges, isLoading } = useChallengeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | "all">("all");
  const [filter, setFilter] = useState<"all" | "joined" | "available">("all");
  
  useEffect(() => {
    fetchChallenges();
  }, []);
  
  const filteredChallenges = challenges.filter(challenge => {
    // Filter by search query
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = selectedCategory === "all" || challenge.category === selectedCategory;
    
    // Filter by joined/available
    const isJoined = userChallenges.includes(challenge.id);
    const matchesFilter = filter === "all" || 
                         (filter === "joined" && isJoined) || 
                         (filter === "available" && !isJoined);
    
    return matchesSearch && matchesCategory && matchesFilter;
  });
  
  const renderCategoryButton = (category: ChallengeCategory | "all", label: string) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.selectedCategoryButton
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text 
        style={[
          styles.categoryButtonText,
          selectedCategory === category && styles.selectedCategoryButtonText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  const renderFilterButton = (filterValue: "all" | "joined" | "available", label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterValue && styles.selectedFilterButton
      ]}
      onPress={() => setFilter(filterValue)}
    >
      <Text 
        style={[
          styles.filterButtonText,
          filter === filterValue && styles.selectedFilterButtonText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Challenges</Text>
        
        <View style={styles.searchContainer}>
          <Search size={18} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search challenges..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>
      
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <Filter size={16} color={colors.textSecondary} />
          <Text style={styles.filterLabel}>Filter:</Text>
          {renderFilterButton("all", "All")}
          {renderFilterButton("joined", "Joined")}
          {renderFilterButton("available", "Available")}
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {renderCategoryButton("all", "All")}
          {renderCategoryButton(ChallengeCategory.Fitness, "Fitness")}
          {renderCategoryButton(ChallengeCategory.Learning, "Learning")}
          {renderCategoryButton(ChallengeCategory.Productivity, "Productivity")}
          {renderCategoryButton(ChallengeCategory.Health, "Health")}
          {renderCategoryButton(ChallengeCategory.Finance, "Finance")}
          {renderCategoryButton(ChallengeCategory.Other, "Other")}
        </ScrollView>
      </View>
      
      {filteredChallenges.length > 0 ? (
        <FlatList
          data={filteredChallenges}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChallengeCard 
              challenge={item} 
              showProgress={userChallenges.includes(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <EmptyState
          title="No Challenges Found"
          message={
            searchQuery 
              ? "Try adjusting your search or filters" 
              : "No challenges match your current filters"
          }
          icon={<Trophy size={48} color={colors.primary} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: colors.text,
    fontSize: 16,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
    marginRight: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: colors.card,
  },
  selectedFilterButton: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedFilterButtonText: {
    color: colors.background,
    fontWeight: "500",
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.card,
  },
  selectedCategoryButton: {
    backgroundColor: `${colors.primary}15`,
  },
  categoryButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedCategoryButtonText: {
    color: colors.primary,
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
});

// Import ScrollView
import { ScrollView } from "react-native";