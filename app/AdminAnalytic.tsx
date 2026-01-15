import { Feather } from "@expo/vector-icons";
import { Text } from "@react-navigation/elements";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function AdminAnalyticsScreen(){
  const [overview, setOverview] = useState<any>(null);

  
return(<ScrollView style={styles.container}>
    <Text style={styles.title}>Analytics Dashboard</Text>
    <View style={styles.card}>
    
        <View style={styles.row}>
          <Feather name="users" size={20} />
          <Text style={styles.label}>Total Users</Text>
          
              </View>
    <Text style={styles.value}>{overview.totalUsers}</Text>
          <Text style={styles.sub}>{overview.activeUsers} active</Text>
   
    
    <View style={styles.card}>
        <View style={styles.row}>
          <Feather name="book-open" size={20} />
          <Text style={styles.label}>Courses</Text>
        </View>
      
        <Text style={styles.value}>{overview.totalCourses}</Text>
        <Text style={styles.sub}>{overview.activeCourses} active</Text>
      
      </View>



<View style={styles.card}>
        <View style={styles.row}>
          <Feather name="file-text" size={20} />
          <Text style={styles.label}>Assignments</Text>
        </View>
                <Text style={styles.value}>{overview.totalAssignments}</Text>
        <Text style={styles.sub}>
          {overview.publishedAssignments} published
        </Text>
  </View>

 <View style={styles.card}>
    <View style={styles.row}>
          <Feather name="check-circle" size={20} />
          <Text style={styles.label}>Submissions</Text>
        </View>
        <Text style={styles.value}>{overview.totalSubmissions}</Text>
    <Text style={styles.sub}>
          {overview.gradedSubmissions} graded
        </Text>
    </View>



    </View>


       </ScrollView>)


}

const styles = StyleSheet.create({
    container:{flex:1,backgroundColor:"#F4F6F8",padding:16},
    title:{fontSize:22,fontWeight:"700",marginBottom:16},
    row:{flexDirection:"row",alignItems:"center",gap:8},
    label:{fontSize:14,color:"#555",},
    value:{fontSize:14,color:"#555"},
    sub:{fontSize:12,color:"#888"},
    card:{backgroundColor:"#FFF",padding:16,borderRadius:12,marginBottom:12},
});
