import { Text } from "@react-navigation/elements";
import { ScrollView, StyleSheet } from "react-native";

export default function AdminDashboard(){

return(<ScrollView style = {styles.page}>

<Text style={styles.title}>
  Admin Dashboard
</Text>

<Text style={styles.subtitle}>
 Manage courses, students, teachers, and view platform analytics
</Text>

</ScrollView>)

}

const styles = StyleSheet.create({
page:{padding:20,backgroundColor:"#0f0f0f",flexGrow:1},
title:{fontSize:30,fontWeight:"700",color:"#fff",marginBottom:8},
subtitle:{color:"#aaa"},

});

